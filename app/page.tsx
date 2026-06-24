"use client";

import { useState, useEffect, useRef } from "react";

interface Receipt {
  id: string;
  title: string;
  amount: number;
  date: string;
  description: string;
  month: number;
  year: number;
  fileData?: string;
  fileName?: string;
  fileType?: string;
  category?: string;
  itbis?: number;
  rnc?: string;
  isAutoScanned?: boolean;
}

export default function Home() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [viewMode, setViewMode] = useState<"mes" | "anual" | "dashboard">("dashboard");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: "",
    description: "",
    category: "",
    itbis: "",
    rnc: "",
  });

  // Cargar recibos
  useEffect(() => {
    const saved = localStorage.getItem("receipts_pro");
    if (saved) {
      try {
        setReceipts(JSON.parse(saved));
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
    }
  }, []);

  const saveReceipts = (updatedReceipts: Receipt[]) => {
    setReceipts(updatedReceipts);
    localStorage.setItem("receipts_pro", JSON.stringify(updatedReceipts));
  };

  // Función de OCR para leer el recibo automáticamente
  const scanReceipt = async (file: File): Promise<Partial<Receipt>> => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      setScanProgress(20);
      
      // Convertir a base64
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      
      setScanProgress(40);
      
      // Usar Google Vision API
      const apiKey = "TU_API_KEY_DE_GOOGLE_VISION"; // <-- REEMPLAZA ESTO
      
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [{
              image: { content: base64Data },
              features: [{ type: "TEXT_DETECTION" }]
            }]
          })
        }
      );
      
      setScanProgress(70);
      
      const data = await response.json();
      const text = data.responses?.[0]?.textAnnotations?.[0]?.description || "";
      
      setScanProgress(90);
      
      // Extraer datos automáticamente con regex
      const extracted = extractDataFromText(text);
      
      setScanProgress(100);
      setIsScanning(false);
      
      return extracted;
      
    } catch (error) {
      console.error("Error escaneando:", error);
      setIsScanning(false);
      // Si falla, devolver datos vacíos para entrada manual
      return {};
    }
  };

  // Extraer datos del texto OCR
  const extractDataFromText = (text: string): Partial<Receipt> => {
    const result: Partial<Receipt> = {};
    
    // Buscar fechas (DD/MM/AAAA o DD-MM-AAAA)
    const dateRegex = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3];
      result.date = `${year}-${month}-${day}`;
    }
    
    // Buscar montos (RD$ o $ seguido de números)
    const amountRegex = /(?:RD\$|RD\s?\$|\$)\s*([\d,]+\.?\d*)/i;
    const amountMatch = text.match(amountRegex);
    if (amountMatch) {
      result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }
    
    // Buscar números de RNC (1-2-3-4-5-6-7-8-9)
    const rncRegex = /\b(\d{1,2}-?\d{1,2}-?\d{1,2}-?\d{1,2}-?\d{1,2}-?\d{1,2}-?\d{1,2}-?\d{1,2}-?\d{1,2})\b/;
    const rncMatch = text.match(rncRegex);
    if (rncMatch) {
      result.rnc = rncMatch[1];
    }
    
    // Buscar título (primera línea significativa)
    const lines = text.split('\n').filter(line => line.trim().length > 10);
    if (lines.length > 0) {
      result.title = lines[0].trim().slice(0, 50);
    }
    
    // Buscar descripción (línea más larga)
    if (lines.length > 1) {
      const desc = lines.find(l => l.length > 20 && !l.match(/\d/)) || lines[1] || "";
      result.description = desc.trim().slice(0, 100);
    }
    
    // Detectar categoría automática
    if (text.toLowerCase().includes("servicio") || text.toLowerCase().includes("consultor")) {
      result.category = "Servicios";
    } else if (text.toLowerCase().includes("venta") || text.toLowerCase().includes("producto")) {
      result.category = "Ventas";
    } else if (text.toLowerCase().includes("honorario") || text.toLowerCase().includes("profesional")) {
      result.category = "Honorarios";
    } else if (text.toLowerCase().includes("alquiler") || text.toLowerCase().includes("renta")) {
      result.category = "Alquileres";
    }
    
    // Si no se encontró fecha, usar hoy
    if (!result.date) {
      const today = new Date();
      result.date = today.toISOString().split('T')[0];
    }
    
    // Si no se encontró monto, usar 0
    if (!result.amount) {
      result.amount = 0;
    }
    
    result.isAutoScanned = true;
    
    return result;
  };

  // Procesar archivos (soporte múltiple)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const fileArray = Array.from(files);
    setMultipleFiles(fileArray);
    if (fileArray.length > 0) {
      setSelectedFile(fileArray[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(fileArray[0]);
    }
  };

  // Subir múltiples recibos
  const handleBatchUpload = async () => {
    if (multipleFiles.length === 0) {
      alert("Selecciona al menos un archivo");
      return;
    }
    
    setIsScanning(true);
    let successCount = 0;
    
    for (const file of multipleFiles) {
      try {
        const extracted = await scanReceipt(file);
        
        // Si la extracción falló o no tiene datos, pedir manual
        if (!extracted.amount || extracted.amount === 0) {
          // Usar datos manuales del formulario
          const dateObj = new Date(formData.date || new Date().toISOString().split('T')[0]);
          const newReceipt: Receipt = {
            id: Date.now() + "-" + Math.random().toString(36).substr(2, 6),
            title: formData.title || file.name || "Recibo",
            amount: parseFloat(formData.amount) || 0,
            date: formData.date || new Date().toISOString().split('T')[0],
            description: formData.description || "",
            category: formData.category || "",
            itbis: formData.itbis ? parseFloat(formData.itbis) : 0,
            rnc: formData.rnc || "",
            month: dateObj.getMonth() + 1,
            year: dateObj.getFullYear(),
            fileName: file.name,
            fileType: file.type,
            isAutoScanned: false,
          };
          
          // Leer archivo como base64
          const reader = new FileReader();
          await new Promise((resolve) => {
            reader.onload = (e) => {
              newReceipt.fileData = e.target?.result as string;
              resolve(null);
            };
            reader.readAsDataURL(file);
          });
          
          const updated = [...receipts, newReceipt];
          saveReceipts(updated);
          successCount++;
          
        } else {
          // Datos extraídos automáticamente
          const dateObj = new Date(extracted.date || new Date().toISOString().split('T')[0]);
          const newReceipt: Receipt = {
            id: Date.now() + "-" + Math.random().toString(36).substr(2, 6),
            title: extracted.title || file.name,
            amount: extracted.amount || 0,
            date: extracted.date || new Date().toISOString().split('T')[0],
            description: extracted.description || "",
            category: extracted.category || "",
            itbis: extracted.itbis || 0,
            rnc: extracted.rnc || "",
            month: dateObj.getMonth() + 1,
            year: dateObj.getFullYear(),
            fileName: file.name,
            fileType: file.type,
            isAutoScanned: true,
          };
          
          // Leer archivo como base64
          const reader = new FileReader();
          await new Promise((resolve) => {
            reader.onload = (e) => {
              newReceipt.fileData = e.target?.result as string;
              resolve(null);
            };
            reader.readAsDataURL(file);
          });
          
          const updated = [...receipts, newReceipt];
          saveReceipts(updated);
          successCount++;
        }
        
      } catch (error) {
        console.error("Error procesando:", error);
      }
    }
    
    setIsScanning(false);
    setMultipleFiles([]);
    resetForm();
    alert(`✅ ${successCount} recibos procesados correctamente`);
  };

  const resetForm = () => {
    setFormData({ title: "", amount: "", date: "", description: "", category: "", itbis: "", rnc: "" });
    setSelectedFile(null);
    setPreviewUrl("");
    setMultipleFiles([]);
    setShowForm(false);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    const dateObj = new Date(formData.date);
    const itbisValue = formData.itbis ? parseFloat(formData.itbis) : 0;
    
    const receiptData = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description || "",
      month: dateObj.getMonth() + 1,
      year: dateObj.getFullYear(),
      category: formData.category || "",
      itbis: itbisValue,
      rnc: formData.rnc || "",
      isAutoScanned: false,
    };

    if (editingId) {
      const updated = receipts.map(r => 
        r.id === editingId ? { ...r, ...receiptData } : r
      );
      saveReceipts(updated);
    } else {
      const newReceipt: Receipt = {
        id: Date.now().toString(),
        ...receiptData,
      };
      saveReceipts([...receipts, newReceipt]);
    }
    resetForm();
    alert("✅ Recibo guardado");
  };

  const editReceipt = (receipt: Receipt) => {
    setEditingId(receipt.id);
    setFormData({
      title: receipt.title,
      amount: receipt.amount.toString(),
      date: receipt.date,
      description: receipt.description || "",
      category: receipt.category || "",
      itbis: receipt.itbis?.toString() || "",
      rnc: receipt.rnc || "",
    });
    if (receipt.fileData) {
      setPreviewUrl(receipt.fileData);
    }
    setShowForm(true);
  };

  const deleteReceipt = (id: string) => {
    if (!confirm("¿Eliminar este recibo?")) return;
    const updated = receipts.filter((r) => r.id !== id);
    saveReceipts(updated);
  };

  const deleteAll = () => {
    if (!confirm("¿Eliminar TODOS los recibos?")) return;
    saveReceipts([]);
  };

  // Agrupar
  const grouped = receipts.reduce((acc: any, receipt) => {
    const key = `${receipt.year}-${String(receipt.month).padStart(2, "0")}`;
    if (!acc[key]) {
      acc[key] = { year: receipt.year, month: receipt.month, total: 0, receipts: [] };
    }
    acc[key].total += receipt.amount;
    acc[key].receipts.push(receipt);
    return acc;
  }, {});

  // Filtros
  let filtered = receipts;
  if (filterYear) {
    filtered = filtered.filter(r => r.year.toString() === filterYear);
  }
  if (filterCategory) {
    filtered = filtered.filter(r => r.category === filterCategory);
  }
  if (searchTerm) {
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  const filteredGrouped = filtered.reduce((acc: any, receipt) => {
    const key = `${receipt.year}-${String(receipt.month).padStart(2, "0")}`;
    if (!acc[key]) {
      acc[key] = { year: receipt.year, month: receipt.month, total: 0, receipts: [] };
    }
    acc[key].total += receipt.amount;
    acc[key].receipts.push(receipt);
    return acc;
  }, {});

  let groupedArray = Object.entries(filteredGrouped)
    .map(([key, value]: [string, any]) => ({ ...value, key }))
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

  // Resumen anual
  const annualSummary = receipts.reduce((acc: any, r) => {
    if (!acc[r.year]) {
      acc[r.year] = { year: r.year, total: 0, count: 0, months: {} };
    }
    acc[r.year].total += r.amount;
    acc[r.year].count += 1;
    if (!acc[r.year].months[r.month]) {
      acc[r.year].months[r.month] = 0;
    }
    acc[r.year].months[r.month] += r.amount;
    return acc;
  }, {});

  const totalGeneral = filtered.reduce((sum, r) => sum + r.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return months[month - 1];
  };

  const toggleMonth = (key: string) => {
    setExpandedMonth(expandedMonth === key ? null : key);
  };

  // Exportar CSV
  const exportCSV = () => {
    if (receipts.length === 0) { alert("No hay recibos"); return; }
    let csv = "Fecha,Título,Monto,Descripción,Categoría,ITBIS,RNC,Mes,Año,Automático\n";
    receipts.forEach(r => {
      csv += `"${r.date}","${r.title}",${r.amount},"${r.description || ""}","${r.category || ""}",${r.itbis || 0},"${r.rnc || ""}","${getMonthName(r.month)}",${r.year},${r.isAutoScanned ? "Sí" : "No"}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Exportar resumen anual
  const exportAnnualSummary = () => {
    let text = "=== RESUMEN ANUAL PARA IMPUESTOS ===\n\n";
    Object.values(annualSummary).forEach((s: any) => {
      text += `📅 AÑO ${s.year}\n`;
      text += `  💰 Total ingresos: ${formatCurrency(s.total)}\n`;
      text += `  📄 Número de recibos: ${s.count}\n`;
      text += `  📊 Ingresos por mes:\n`;
      Object.entries(s.months).forEach(([month, total]: [string, any]) => {
        text += `    ${getMonthName(parseInt(month))}: ${formatCurrency(total)}\n`;
      });
      text += `\n`;
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumen_anual_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const categories = [...new Set(receipts.map(r => r.category).filter(Boolean))];
  const years = [...new Set(receipts.map(r => r.year.toString()))].sort().reverse();

  // Calcular estadísticas para dashboard
  const totalReceipts = receipts.length;
  const autoScanned = receipts.filter(r => r.isAutoScanned).length;
  const averageAmount = totalReceipts > 0 ? totalGeneral / totalReceipts : 0;
  const monthCount = Object.keys(grouped).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Profesional */}
      <header className="bg-white shadow-xl border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white">📄</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Recibos Pro</h1>
                <p className="text-xs text-gray-500">Gestión de ingresos para impuestos</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setViewMode("dashboard")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === "dashboard" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setViewMode("mes")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === "mes" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                📆 Recibos
              </button>
              
              <input
                type="text"
                placeholder="🔍 Buscar recibos..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-40 sm:w-60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium"
              >
                <span>+</span> Nuevo Recibo
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* DASHBOARD */}
        {viewMode === "dashboard" && (
          <>
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <p className="text-sm text-gray-500">💰 Total Ingresos</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalGeneral)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <p className="text-sm text-gray-500">📄 Recibos</p>
                <p className="text-3xl font-bold text-gray-900">{totalReceipts}</p>
                <p className="text-xs text-green-600">⬆ {autoScanned} escaneados automáticamente</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <p className="text-sm text-gray-500">📆 Meses activos</p>
                <p className="text-3xl font-bold text-gray-900">{monthCount}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <p className="text-sm text-gray-500">📊 Promedio</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(averageAmount)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <p className="text-sm text-gray-500">📂 Categorías</p>
                <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>

            {/* Resumen Anual - Dashboard */}
            {Object.keys(annualSummary).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">📊 Resumen Anual</h2>
                  <button
                    onClick={exportAnnualSummary}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    📥 Exportar resumen
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(annualSummary).map((s: any) => (
                    <div key={s.year} className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-bold text-gray-800">📅 {s.year}</h3>
                      <p className="text-3xl font-bold text-indigo-600">{formatCurrency(s.total)}</p>
                      <p className="text-sm text-gray-500">{s.count} recibos</p>
                      <div className="mt-3 text-sm space-y-1">
                        {Object.entries(s.months).map(([month, total]: [string, any]) => (
                          <div key={month} className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-600">{getMonthName(parseInt(month))}</span>
                            <span className="font-medium text-gray-800">{formatCurrency(total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Últimos recibos */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Últimos recibos</h2>
              {receipts.slice(0, 5).map(r => (
                <div key={r.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{r.title}</p>
                    <p className="text-sm text-gray-500">{new Date(r.date).toLocaleDateString("es-DO")}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{r.category || "Sin categoría"}</span>
                    <span className="font-bold text-indigo-600">{formatCurrency(r.amount)}</span>
                    {r.isAutoScanned && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">🤖 Auto</span>
                    )}
                  </div>
                </div>
              ))}
              {receipts.length === 0 && (
                <p className="text-center text-gray-400 py-8">No hay recibos aún. ¡Sube tu primero!</p>
              )}
            </div>
          </>
        )}

        {/* VISTA DE RECIBOS (MES) */}
        {viewMode !== "dashboard" && (
          <>
            {/* Filtros */}
            <div className="flex flex-wrap gap-3 mb-6">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="">Todos los años</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              
              {categories.length > 0 && (
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
              
              <button
                onClick={exportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
              >
                📊 Exportar CSV
              </button>
            </div>

            {/* Lista por meses */}
            {groupedArray.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-16 text-center border-2 border-dashed border-gray-300">
                <div className="text-8xl mb-6">📭</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No hay recibos</h3>
                <p className="text-gray-500 mb-6">Sube tu primer recibo para comenzar</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all text-lg font-semibold"
                >
                  + Subir Recibo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedArray.map((group) => {
                  const isExpanded = expandedMonth === group.key;
                  return (
                    <div key={group.key} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                      <button
                        onClick={() => toggleMonth(group.key)}
                        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">📆</span>
                          <div className="text-left">
                            <h3 className="text-xl font-bold text-gray-800">
                              {getMonthName(group.month)} {group.year}
                            </h3>
                            <p className="text-sm text-gray-500">{group.receipts.length} recibos</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold text-indigo-600">
                            {formatCurrency(group.total)}
                          </span>
                          <span className="text-gray-400 text-2xl">{isExpanded ? "▼" : "▶"}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-200">
                          <div className="overflow-x-auto p-4">
                            <table className="w-full">
                              <thead className="bg-gray-50 rounded-lg">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ITBIS</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {group.receipts.map((receipt: Receipt) => (
                                  <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {new Date(receipt.date).toLocaleDateString("es-DO")}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      <div className="font-medium">{receipt.title}</div>
                                      {receipt.description && (
                                        <div className="text-xs text-gray-500">{receipt.description}</div>
                                      )}
                                      {receipt.isAutoScanned && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🤖 Automático</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                        {receipt.category || "Sin categoría"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                                      {formatCurrency(receipt.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {receipt.itbis ? formatCurrency(receipt.itbis) : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {receipt.fileData ? (
                                        <a
                                          href={receipt.fileData}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                          📎 Ver
                                        </a>
                                      ) : (
                                        <span className="text-gray-400 text-xs">Sin archivo</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => editReceipt(receipt)}
                                          className="text-blue-600 hover:text-blue-800"
                                          title="Editar"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={() => deleteReceipt(receipt.id)}
                                          className="text-red-600 hover:text-red-800"
                                          title="Eliminar"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {receipts.length > 0 && (
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={deleteAll}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      🗑️ Eliminar todos los recibos
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal para subir recibo - VERSIÓN PROFESIONAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? "✏️ Editar Recibo" : "📤 Subir Recibo"}
                </h2>
                <p className="text-sm text-gray-500">
                  {editingId ? "Actualiza los datos del recibo" : "Sube el recibo y la IA lo leerá automáticamente"}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ej: Pago Cliente XYZ"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monto (DOP) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="1000.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Ventas">Ventas</option>
                    <option value="Honorarios">Honorarios</option>
                    <option value="Alquileres">Alquileres</option>
                    <option value="Consultoría">Consultoría</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ITBIS</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                    value={formData.itbis}
                    onChange={(e) => setFormData({ ...formData, itbis: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RNC / NCF (opcional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: 1-23-45678-9"
                  value={formData.rnc}
                  onChange={(e) => setFormData({ ...formData, rnc: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Detalles adicionales..."
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📎 Subir archivo (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  multiple
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                {previewUrl && (
                  <div className="mt-3">
                    {selectedFile && <p className="text-sm text-gray-600">✅ {selectedFile.name}</p>}
                    {selectedFile?.type.startsWith('image/') && (
                      <img src={previewUrl} alt="Vista previa" className="mt-2 max-h-40 rounded-lg border shadow-sm" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all text-lg"
                >
                  {editingId ? "💾 Actualizar" : "💾 Guardar"}
                </button>
                
                {!editingId && multipleFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBatchUpload}
                    disabled={isScanning}
                    className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all text-lg disabled:opacity-50"
                  >
                    {isScanning ? `⏳ Escaneando... ${scanProgress}%` : "🤖 Escanear y Guardar"}
                  </button>
                )}
              </div>
              
              {isScanning && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                  <p className="text-xs text-gray-500 mt-1 text-center">Analizando recibo con IA...</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}