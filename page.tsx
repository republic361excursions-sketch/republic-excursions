"use client";

import { useState, useEffect } from "react";

interface Receipt {
  id: string;
  title: string;
  amount: number;
  date: string;
  description: string;
  month: number;
  year: number;
  fileData?: string; // Para guardar la imagen/PDF en base64
  fileName?: string;
  fileType?: string;
}

export default function Home() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: "",
    description: "",
  });

  // Cargar recibos guardados
  useEffect(() => {
    const saved = localStorage.getItem("receipts_v2");
    if (saved) {
      try {
        setReceipts(JSON.parse(saved));
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
    }
  }, []);

  // Guardar en localStorage
  const saveReceipts = (updatedReceipts: Receipt[]) => {
    setReceipts(updatedReceipts);
    localStorage.setItem("receipts_v2", JSON.stringify(updatedReceipts));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Guardar recibo
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    const dateObj = new Date(formData.date);
    
    // Leer archivo si existe
    let fileData = "";
    let fileName = "";
    let fileType = "";
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const result = event.target.result as string;
          saveReceiptWithFile(result, selectedFile.name, selectedFile.type);
        }
      };
      reader.readAsDataURL(selectedFile);
      return; // Esperar a que termine
    }

    // Guardar sin archivo
    const newReceipt: Receipt = {
      id: Date.now().toString(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
      month: dateObj.getMonth() + 1,
      year: dateObj.getFullYear(),
      fileData: "",
      fileName: "",
      fileType: "",
    };

    const updated = [...receipts, newReceipt];
    saveReceipts(updated);
    resetForm();
    alert("✅ Recibo guardado");
  };

  const saveReceiptWithFile = (fileData: string, fileName: string, fileType: string) => {
    const dateObj = new Date(formData.date);
    
    if (editingId) {
      // Editar existente
      const updated = receipts.map(r => 
        r.id === editingId ? { 
          ...r, 
          ...formData, 
          amount: parseFloat(formData.amount),
          date: formData.date,
          month: dateObj.getMonth() + 1,
          year: dateObj.getFullYear(),
          fileData, 
          fileName, 
          fileType 
        } : r
      );
      saveReceipts(updated);
    } else {
      // Nuevo
      const newReceipt: Receipt = {
        id: Date.now().toString(),
        title: formData.title,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear(),
        fileData,
        fileName,
        fileType,
      };
      const updated = [...receipts, newReceipt];
      saveReceipts(updated);
    }
    resetForm();
    alert("✅ Recibo guardado");
  };

  const resetForm = () => {
    setFormData({ title: "", amount: "", date: "", description: "" });
    setSelectedFile(null);
    setPreviewUrl("");
    setShowForm(false);
    setEditingId(null);
  };

  // Editar recibo
  const editReceipt = (receipt: Receipt) => {
    setEditingId(receipt.id);
    setFormData({
      title: receipt.title,
      amount: receipt.amount.toString(),
      date: receipt.date,
      description: receipt.description || "",
    });
    if (receipt.fileData) {
      setPreviewUrl(receipt.fileData);
    }
    setShowForm(true);
  };

  // Eliminar recibo
  const deleteReceipt = (id: string) => {
    if (!confirm("¿Eliminar este recibo?")) return;
    const updated = receipts.filter((r) => r.id !== id);
    saveReceipts(updated);
  };

  // Eliminar todo
  const deleteAll = () => {
    if (!confirm("¿Eliminar TODOS los recibos? Esta acción no se puede deshacer.")) return;
    saveReceipts([]);
  };

  // Agrupar por mes
  const grouped = receipts.reduce((acc: any, receipt) => {
    const key = `${receipt.year}-${String(receipt.month).padStart(2, "0")}`;
    if (!acc[key]) {
      acc[key] = { year: receipt.year, month: receipt.month, total: 0, receipts: [] };
    }
    acc[key].total += receipt.amount;
    acc[key].receipts.push(receipt);
    return acc;
  }, {});

  let groupedArray = Object.entries(grouped)
    .map(([key, value]: [string, any]) => ({ ...value, key }))
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

  // Filtrar por mes
  if (filterMonth) {
    groupedArray = groupedArray.filter(g => g.key === filterMonth);
  }

  // Buscar
  const filteredReceipts = receipts.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular totales
  const totalGeneral = receipts.reduce((sum, r) => sum + r.amount, 0);

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

  // Exportar a CSV
  const exportCSV = () => {
    if (receipts.length === 0) {
      alert("No hay recibos para exportar");
      return;
    }
    
    let csv = "Fecha,Título,Monto,Descripción,Mes,Año\n";
    receipts.forEach(r => {
      csv += `"${r.date}","${r.title}",${r.amount},"${r.description || ""}",${getMonthName(r.month)},${r.year}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📄</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Mis Recibos
              </h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {receipts.length} recibos
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Buscador */}
              <input
                type="text"
                placeholder="🔍 Buscar..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-40 sm:w-60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {/* Filtro por mes */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">Todos los meses</option>
                {Object.keys(grouped).sort().reverse().map(key => {
                  const [year, month] = key.split('-');
                  return (
                    <option key={key} value={key}>
                      {getMonthName(parseInt(month))} {year}
                    </option>
                  );
                })}
              </select>
              
              <button
                onClick={exportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
              >
                📊 Exportar
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>+</span> Subir Recibo
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Total general */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <p className="text-sm text-gray-500">💰 Total de Ingresos</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalGeneral)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <p className="text-sm text-gray-500">📄 Total Recibos</p>
            <p className="text-3xl font-bold text-gray-900">{receipts.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <p className="text-sm text-gray-500">📆 Meses registrados</p>
            <p className="text-3xl font-bold text-gray-900">{Object.keys(grouped).length}</p>
          </div>
        </div>

        {/* Lista por meses */}
        {groupedArray.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border-2 border-dashed border-gray-300">
            <div className="text-8xl mb-6">📭</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No hay recibos aún</h3>
            <p className="text-gray-500 mb-6">Sube tu primer recibo de pago</p>
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
              const monthTotal = group.receipts.reduce((sum: number, r: Receipt) => sum + r.amount, 0);
              
              return (
                <div key={group.key} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
                        {formatCurrency(monthTotal)}
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
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
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
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-gray-900">
                                  {formatCurrency(receipt.amount)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {receipt.fileData ? (
                                    <a
                                      href={receipt.fileData}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                      📎 Ver archivo
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
            
            {/* Botón Eliminar todo */}
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
      </main>

      {/* Modal para subir recibo */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? "✏️ Editar Recibo" : "📤 Subir Recibo"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto (DOP) *
                </label>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Detalles adicionales..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📎 Subir archivo (PDF, JPG, PNG)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  onChange={handleFileChange}
                />
                {previewUrl && selectedFile && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">✅ Archivo seleccionado: {selectedFile.name}</p>
                    {selectedFile.type.startsWith('image/') && (
                      <img src={previewUrl} alt="Vista previa" className="mt-2 max-h-40 rounded-lg border" />
                    )}
                  </div>
                )}
                {previewUrl && !selectedFile && (
                  <p className="text-sm text-gray-600">✅ Archivo adjunto</p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all text-lg"
              >
                {editingId ? "💾 Actualizar Recibo" : "💾 Guardar Recibo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}