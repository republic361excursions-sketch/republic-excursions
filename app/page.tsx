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
  fileData?: string;
  fileName?: string;
  fileType?: string;
  category?: string;
  itbis?: number;
  rnc?: string;
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
  const [viewMode, setViewMode] = useState<"dashboard" | "lista">("dashboard");

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: "",
    description: "",
    category: "",
    itbis: "",
    rnc: "",
  });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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

  const resetForm = () => {
    setFormData({ title: "", amount: "", date: "", description: "", category: "", itbis: "", rnc: "" });
    setSelectedFile(null);
    setPreviewUrl("");
    setShowForm(false);
    setEditingId(null);
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

  const grouped = receipts.reduce((acc: any, receipt) => {
    const key = `${receipt.year}-${String(receipt.month).padStart(2, "0")}`;
    if (!acc[key]) {
      acc[key] = { year: receipt.year, month: receipt.month, total: 0, receipts: [] };
    }
    acc[key].total += receipt.amount;
    acc[key].receipts.push(receipt);
    return acc;
  }, {});

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
  const categories = [...new Set(receipts.map(r => r.category).filter(Boolean))];
  const years = [...new Set(receipts.map(r => r.year.toString()))].sort().reverse();

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

  const exportCSV = () => {
    if (receipts.length === 0) { alert("No hay recibos"); return; }
    let csv = "Fecha,Título,Monto,Descripción,Categoría,ITBIS,RNC,Mes,Año\n";
    receipts.forEach(r => {
      csv += `"${r.date}","${r.title}",${r.amount},"${r.description || ""}","${r.category || ""}",${r.itbis || 0},"${r.rnc || ""}","${getMonthName(r.month)}",${r.year}\n`;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* HEADER DARK */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-xl">📄</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Recibos Pro</h1>
                <p className="text-xs text-purple-300">Gestión de ingresos</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setViewMode("dashboard")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "dashboard" 
                    ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-purple-500/30" 
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setViewMode("lista")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "lista" 
                    ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-purple-500/30" 
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                📋 Recibos
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-5 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-purple-500/25"
              >
                <span className="text-lg leading-none">+</span> Nuevo
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === "dashboard" && (
          <>
            {/* Tarjetas DARK */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl shadow-cyan-500/20 backdrop-blur-sm border border-white/10">
                <p className="text-sm opacity-80">💰 Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalGeneral)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20 backdrop-blur-sm border border-white/10">
                <p className="text-sm opacity-80">📄 Recibos</p>
                <p className="text-2xl font-bold">{receipts.length}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl shadow-pink-500/20 backdrop-blur-sm border border-white/10">
                <p className="text-sm opacity-80">📆 Meses</p>
                <p className="text-2xl font-bold">{Object.keys(grouped).length}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 backdrop-blur-sm border border-white/10">
                <p className="text-sm opacity-80">📊 Promedio</p>
                <p className="text-2xl font-bold">{receipts.length > 0 ? formatCurrency(totalGeneral / receipts.length) : formatCurrency(0)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20 backdrop-blur-sm border border-white/10">
                <p className="text-sm opacity-80">🏷️ Categorías</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>

            {/* Resumen Anual DARK */}
            {Object.keys(annualSummary).length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-white">📊 Resumen Anual</h2>
                  <button onClick={exportCSV} className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">
                    📥 Exportar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(annualSummary).map((s: any) => (
                    <div key={s.year} className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <h3 className="font-bold text-white">📅 {s.year}</h3>
                      <p className="text-2xl font-bold text-cyan-400">{formatCurrency(s.total)}</p>
                      <p className="text-sm text-gray-400">{s.count} recibos</p>
                      <div className="mt-2 text-sm space-y-1">
                        {Object.entries(s.months).map(([month, total]: [string, any]) => (
                          <div key={month} className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-gray-400">{getMonthName(parseInt(month))}</span>
                            <span className="font-medium text-white">{formatCurrency(total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Últimos recibos DARK */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4">📋 Últimos recibos</h2>
              {receipts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-400">No hay recibos aún</p>
                  <button onClick={() => setShowForm(true)} className="mt-4 bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all">
                    + Subir tu primer recibo
                  </button>
                </div>
              ) : (
                receipts.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="font-medium text-white">{r.title}</p>
                      <p className="text-sm text-gray-400">{new Date(r.date).toLocaleDateString("es-DO")}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-300">{r.category || "Sin categoría"}</span>
                      <span className="font-bold text-cyan-400">{formatCurrency(r.amount)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {viewMode === "lista" && (
          <>
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/10">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="🔍 Buscar recibos..."
                  className="flex-1 min-w-[200px] px-4 py-2 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="" className="text-gray-900">Todos los años</option>
                  {years.map(y => (
                    <option key={y} value={y} className="text-gray-900">{y}</option>
                  ))}
                </select>
                {categories.length > 0 && (
                  <select
                    className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="" className="text-gray-900">Todas las categorías</option>
                    {categories.map(c => (
                      <option key={c} value={c} className="text-gray-900">{c}</option>
                    ))}
                  </select>
                )}
                <button onClick={exportCSV} className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 text-sm">
                  📊 CSV
                </button>
              </div>
            </div>

            {groupedArray.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-16 text-center border-2 border-dashed border-white/20">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-white mb-2">No hay recibos</h3>
                <p className="text-gray-400 mb-4">Sube tu primer recibo</p>
                <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all">
                  + Subir Recibo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedArray.map((group) => {
                  const isExpanded = expandedMonth === group.key;
                  return (
                    <div key={group.key} className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
                      <button onClick={() => toggleMonth(group.key)} className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">📆</span>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-white">{getMonthName(group.month)} {group.year}</h3>
                            <p className="text-sm text-gray-400">{group.receipts.length} recibos</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-cyan-400">{formatCurrency(group.total)}</span>
                          <span className="text-gray-400 text-xl">{isExpanded ? "▼" : "▶"}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-white/10">
                          <div className="overflow-x-auto p-4">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Título</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Categoría</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Monto</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Archivo</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {group.receipts.map((receipt: Receipt) => (
                                  <tr key={receipt.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-300">{new Date(receipt.date).toLocaleDateString("es-DO")}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="font-medium text-white">{receipt.title}</div>
                                      {receipt.description && <div className="text-xs text-gray-400">{receipt.description}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300">{receipt.category || "Sin categoría"}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-cyan-400">{formatCurrency(receipt.amount)}</td>
                                    <td className="px-4 py-3 text-sm">
                                      {receipt.fileData ? (
                                        <a href={receipt.fileData} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">📎 Ver</a>
                                      ) : (
                                        <span className="text-gray-500 text-xs">Sin archivo</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => editReceipt(receipt)} className="text-cyan-400 hover:text-cyan-300">✏️</button>
                                        <button onClick={() => deleteReceipt(receipt.id)} className="text-red-400 hover:text-red-300">🗑️</button>
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
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal DARK */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{editingId ? "✏️ Editar Recibo" : "📤 Nuevo Recibo"}</h2>
                <p className="text-sm text-gray-400">{editingId ? "Actualiza los datos" : "Ingresa los datos del recibo"}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-3xl leading-none">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Título *</label>
                  <input type="text" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500" placeholder="Ej: Pago Cliente" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Monto (DOP) *</label>
                  <input type="number" required step="0.01" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500" placeholder="1000.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha *</label>
                <input type="date" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                  <select className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    <option value="" className="text-gray-900">Seleccionar</option>
                    <option value="Servicios" className="text-gray-900">Servicios</option>
                    <option value="Ventas" className="text-gray-900">Ventas</option>
                    <option value="Honorarios" className="text-gray-900">Honorarios</option>
                    <option value="Alquileres" className="text-gray-900">Alquileres</option>
                    <option value="Otros" className="text-gray-900">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ITBIS</label>
                  <input type="number" step="0.01" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500" placeholder="0.00" value={formData.itbis} onChange={(e) => setFormData({ ...formData, itbis: e.target.value })} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                <textarea className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500" placeholder="Detalles adicionales..." rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">📎 Archivo (PDF, JPG, PNG)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-400/20 file:text-cyan-400 hover:file:bg-cyan-400/30 cursor-pointer" onChange={handleFileChange} />
                {previewUrl && (
                  <div className="mt-3">
                    {selectedFile && <p className="text-sm text-gray-400">✅ {selectedFile.name}</p>}
                    {selectedFile?.type.startsWith('image/') && (
                      <img src={previewUrl} alt="Vista previa" className="mt-2 max-h-40 rounded-lg border border-white/10" />
                    )}
                  </div>
                )}
              </div>
              
              <button type="submit" className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all">
                {editingId ? "💾 Actualizar" : "💾 Guardar Recibo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
