"use client";

import { useState, useEffect } from "react";

// ============================================
// INTERFACES
// ============================================
interface Excursion {
  id: string;
  nombre: string;
  precioProveedor: number; // Lo que pagas al proveedor
  precioCliente: number; // Lo que cobras al cliente
  ganancia: number; // Calculado automáticamente
}

interface Proveedor {
  id: string;
  nombre: string;
  telefono: string;
  excursionId: string;
  excursionNombre: string;
  precioCompra: number;
  metodoPago: "efectivo" | "transferencia" | "paypal";
  pagoStatus: "pendiente" | "pagado";
  fechaPago?: string;
  nota: string;
}

interface Cliente {
  id: string;
  nombre: string;
  whatsapp: string;
  email: string;
  excursionId: string;
  excursionNombre: string;
  fechaExcursion: string;
}

interface Venta {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteWhatsapp: string;
  clienteEmail: string;
  excursionId: string;
  excursionNombre: string;
  fechaExcursion: string;
  precioVenta: number;
  precioCompra: number;
  ganancia: number;
  // Pago del cliente
  pagoCliente: "completo" | "deposito_25" | "pago_dia";
  montoPagado: number;
  saldoPendiente: number;
  metodoPagoCliente: "efectivo" | "tarjeta" | "transferencia" | "paypal";
  // Pago al proveedor
  proveedorId: string;
  proveedorNombre: string;
  proveedorPagado: "pendiente" | "pagado";
  metodoPagoProveedor: "efectivo" | "transferencia" | "paypal";
  nota: string;
  mes: number;
  year: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Home() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [excursiones, setExcursiones] = useState<Excursion[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [showProveedorForm, setShowProveedorForm] = useState(false);
  const [showExcursionForm, setShowExcursionForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"dashboard" | "ventas" | "clientes" | "proveedores" | "excursiones">("dashboard");

  // ============================================
  // FORMULARIO DE VENTA
  // ============================================
  const [formData, setFormData] = useState({
    clienteNombre: "",
    clienteWhatsapp: "",
    clienteEmail: "",
    excursionId: "",
    excursionNombre: "",
    fechaExcursion: "",
    precioVenta: "",
    precioCompra: "",
    ganancia: "",
    pagoCliente: "completo" as "completo" | "deposito_25" | "pago_dia",
    montoPagado: "",
    metodoPagoCliente: "efectivo" as "efectivo" | "tarjeta" | "transferencia" | "paypal",
    proveedorId: "",
    proveedorNombre: "",
    proveedorPagado: "pendiente" as "pendiente" | "pagado",
    metodoPagoProveedor: "efectivo" as "efectivo" | "transferencia" | "paypal",
    nota: "",
  });

  // ============================================
  // CARGAR DATOS DESDE LOCALSTORAGE
  // ============================================
  useEffect(() => {
    const savedVentas = localStorage.getItem("excursiones_ventas");
    const savedClientes = localStorage.getItem("excursiones_clientes");
    const savedProveedores = localStorage.getItem("excursiones_proveedores");
    const savedExcursiones = localStorage.getItem("excursiones_excursiones");
    
    if (savedVentas) setVentas(JSON.parse(savedVentas));
    if (savedClientes) setClientes(JSON.parse(savedClientes));
    if (savedProveedores) setProveedores(JSON.parse(savedProveedores));
    if (savedExcursiones) setExcursiones(JSON.parse(savedExcursiones));
  }, []);

  // ============================================
  // GUARDAR DATOS
  // ============================================
  const saveVentas = (data: Venta[]) => {
    setVentas(data);
    localStorage.setItem("excursiones_ventas", JSON.stringify(data));
  };

  const saveClientes = (data: Cliente[]) => {
    setClientes(data);
    localStorage.setItem("excursiones_clientes", JSON.stringify(data));
  };

  const saveProveedores = (data: Proveedor[]) => {
    setProveedores(data);
    localStorage.setItem("excursiones_proveedores", JSON.stringify(data));
  };

  const saveExcursiones = (data: Excursion[]) => {
    setExcursiones(data);
    localStorage.setItem("excursiones_excursiones", JSON.stringify(data));
  };

  // ============================================
  // AGREGAR EXCURSIÓN
  // ============================================
  const handleExcursionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    
    const precioProveedor = parseFloat(data.get("precioProveedor") as string);
    const precioCliente = parseFloat(data.get("precioCliente") as string);
    
    const nuevaExcursion: Excursion = {
      id: Date.now().toString(),
      nombre: data.get("nombre") as string,
      precioProveedor,
      precioCliente,
      ganancia: precioCliente - precioProveedor,
    };
    
    saveExcursiones([...excursiones, nuevaExcursion]);
    setShowExcursionForm(false);
    alert("✅ Excursión agregada");
  };

  // ============================================
  // AGREGAR PROVEEDOR
  // ============================================
  const handleProveedorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    
    const excursionId = data.get("excursionId") as string;
    const excursion = excursiones.find(e => e.id === excursionId);
    
    const nuevoProveedor: Proveedor = {
      id: Date.now().toString(),
      nombre: data.get("nombre") as string,
      telefono: data.get("telefono") as string,
      excursionId,
      excursionNombre: excursion?.nombre || "",
      precioCompra: excursion?.precioProveedor || 0,
      metodoPago: data.get("metodoPago") as "efectivo" | "transferencia" | "paypal",
      pagoStatus: "pendiente",
      nota: data.get("nota") as string || "",
    };
    
    saveProveedores([...proveedores, nuevoProveedor]);
    setShowProveedorForm(false);
    alert("✅ Proveedor agregado");
  };

  // ============================================
  // AGREGAR CLIENTE
  // ============================================
  const handleClienteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    
    const excursionId = data.get("excursionId") as string;
    const excursion = excursiones.find(e => e.id === excursionId);
    
    const nuevoCliente: Cliente = {
      id: Date.now().toString(),
      nombre: data.get("nombre") as string,
      whatsapp: data.get("whatsapp") as string,
      email: data.get("email") as string,
      excursionId,
      excursionNombre: excursion?.nombre || "",
      fechaExcursion: data.get("fechaExcursion") as string,
    };
    
    saveClientes([...clientes, nuevoCliente]);
    setShowClienteForm(false);
    alert("✅ Cliente agregado");
  };

  // ============================================
  // GUARDAR VENTA
  // ============================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateObj = new Date(formData.fechaExcursion);
    const precioVenta = parseFloat(formData.precioVenta);
    const precioCompra = parseFloat(formData.precioCompra);
    const ganancia = precioVenta - precioCompra;
    const montoPagado = parseFloat(formData.montoPagado) || 0;
    
    let saldoPendiente = 0;
    if (formData.pagoCliente === "completo") {
      saldoPendiente = 0;
    } else if (formData.pagoCliente === "deposito_25") {
      saldoPendiente = precioVenta * 0.75;
    } else if (formData.pagoCliente === "pago_dia") {
      saldoPendiente = precioVenta;
    }

    const excursion = excursiones.find(e => e.id === formData.excursionId);
    const proveedor = proveedores.find(p => p.id === formData.proveedorId);

    const nuevaVenta: Venta = {
      id: editingId || Date.now().toString(),
      clienteId: "",
      clienteNombre: formData.clienteNombre,
      clienteWhatsapp: formData.clienteWhatsapp,
      clienteEmail: formData.clienteEmail,
      excursionId: formData.excursionId,
      excursionNombre: excursion?.nombre || formData.excursionNombre,
      fechaExcursion: formData.fechaExcursion,
      precioVenta,
      precioCompra,
      ganancia,
      pagoCliente: formData.pagoCliente,
      montoPagado,
      saldoPendiente,
      metodoPagoCliente: formData.metodoPagoCliente,
      proveedorId: formData.proveedorId,
      proveedorNombre: proveedor?.nombre || formData.proveedorNombre,
      proveedorPagado: formData.proveedorPagado,
      metodoPagoProveedor: formData.metodoPagoProveedor,
      nota: formData.nota,
      mes: dateObj.getMonth() + 1,
      year: dateObj.getFullYear(),
    };

    if (editingId) {
      const updated = ventas.map(v => v.id === editingId ? nuevaVenta : v);
      saveVentas(updated);
    } else {
      saveVentas([...ventas, nuevaVenta]);
    }

    // Guardar cliente automáticamente
    const clienteExistente = clientes.find(c => c.nombre === formData.clienteNombre);
    if (!clienteExistente && formData.clienteNombre) {
      const nuevoCliente: Cliente = {
        id: Date.now().toString(),
        nombre: formData.clienteNombre,
        whatsapp: formData.clienteWhatsapp,
        email: formData.clienteEmail,
        excursionId: formData.excursionId,
        excursionNombre: excursion?.nombre || formData.excursionNombre,
        fechaExcursion: formData.fechaExcursion,
      };
      saveClientes([...clientes, nuevoCliente]);
    }

    resetForm();
    alert("✅ Venta registrada");
  };

  const resetForm = () => {
    setFormData({
      clienteNombre: "",
      clienteWhatsapp: "",
      clienteEmail: "",
      excursionId: "",
      excursionNombre: "",
      fechaExcursion: "",
      precioVenta: "",
      precioCompra: "",
      ganancia: "",
      pagoCliente: "completo",
      montoPagado: "",
      metodoPagoCliente: "efectivo",
      proveedorId: "",
      proveedorNombre: "",
      proveedorPagado: "pendiente",
      metodoPagoProveedor: "efectivo",
      nota: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  // ============================================
  // SELECCIONAR EXCURSIÓN (carga automática de precios)
  // ============================================
  const selectExcursion = (excursionId: string) => {
    const excursion = excursiones.find(e => e.id === excursionId);
    if (excursion) {
      // Buscar proveedor para esta excursión
      const proveedor = proveedores.find(p => p.excursionId === excursionId);
      
      setFormData({
        ...formData,
        excursionId: excursion.id,
        excursionNombre: excursion.nombre,
        precioVenta: excursion.precioCliente.toString(),
        precioCompra: excursion.precioProveedor.toString(),
        ganancia: (excursion.precioCliente - excursion.precioProveedor).toString(),
        proveedorId: proveedor?.id || "",
        proveedorNombre: proveedor?.nombre || "",
      });
    }
  };

  const editVenta = (venta: Venta) => {
    setEditingId(venta.id);
    setFormData({
      clienteNombre: venta.clienteNombre,
      clienteWhatsapp: venta.clienteWhatsapp,
      clienteEmail: venta.clienteEmail,
      excursionId: venta.excursionId,
      excursionNombre: venta.excursionNombre,
      fechaExcursion: venta.fechaExcursion,
      precioVenta: venta.precioVenta.toString(),
      precioCompra: venta.precioCompra.toString(),
      ganancia: venta.ganancia.toString(),
      pagoCliente: venta.pagoCliente,
      montoPagado: venta.montoPagado.toString(),
      metodoPagoCliente: venta.metodoPagoCliente,
      proveedorId: venta.proveedorId,
      proveedorNombre: venta.proveedorNombre,
      proveedorPagado: venta.proveedorPagado,
      metodoPagoProveedor: venta.metodoPagoProveedor,
      nota: venta.nota,
    });
    setShowForm(true);
  };

  // ============================================
  // ELIMINAR
  // ============================================
  const deleteVenta = (id: string) => {
    if (!confirm("¿Eliminar esta venta?")) return;
    const updated = ventas.filter(v => v.id !== id);
    saveVentas(updated);
  };

  const deleteCliente = (id: string) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    const updated = clientes.filter(c => c.id !== id);
    saveClientes(updated);
  };

  const deleteProveedor = (id: string) => {
    if (!confirm("¿Eliminar este proveedor?")) return;
    const updated = proveedores.filter(p => p.id !== id);
    saveProveedores(updated);
  };

  const deleteExcursion = (id: string) => {
    if (!confirm("¿Eliminar esta excursión?")) return;
    const updated = excursiones.filter(e => e.id !== id);
    saveExcursiones(updated);
  };

  // ============================================
  // FILTROS
  // ============================================
  let filtered = ventas;
  if (filterYear) {
    filtered = filtered.filter(v => v.year.toString() === filterYear);
  }
  if (searchTerm) {
    filtered = filtered.filter(v => 
      v.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.excursionNombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const grouped = filtered.reduce((acc: any, venta) => {
    const key = `${venta.year}-${String(venta.month).padStart(2, "0")}`;
    if (!acc[key]) {
      acc[key] = { year: venta.year, month: venta.month, total: 0, ventas: [], ganancias: 0 };
    }
    acc[key].total += venta.precioVenta;
    acc[key].ganancias += venta.ganancia;
    acc[key].ventas.push(venta);
    return acc;
  }, {});

  let groupedArray = Object.entries(grouped)
    .map(([key, value]: [string, any]) => ({ ...value, key }))
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

  // ============================================
  // CÁLCULOS
  // ============================================
  const totalVentas = filtered.reduce((sum, v) => sum + v.precioVenta, 0);
  const totalGanancia = filtered.reduce((sum, v) => sum + v.ganancia, 0);
  const totalPendiente = filtered.reduce((sum, v) => sum + v.saldoPendiente, 0);
  const proveedoresPendientes = proveedores.filter(p => p.pagoStatus === "pendiente").length;
  
  const years = [...new Set(ventas.map(v => v.year.toString()))].sort().reverse();

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

  const getPagoClienteText = (tipo: string) => {
    const map: any = {
      completo: "✅ Pago completo",
      deposito_25: "🏦 Depósito 25%",
      pago_dia: "📅 Pago el día"
    };
    return map[tipo] || tipo;
  };

  const getStatusColor = (status: string) => {
    return status === "pagado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
  };

  // ============================================
  // EXPORTAR
  // ============================================
  const exportCSV = () => {
    if (ventas.length === 0) { alert("No hay datos"); return; }
    let csv = "Fecha,Cliente,Excursión,Precio Venta,Precio Compra,Ganancia,Pago Cliente,Saldo Pendiente,Método Pago,Proveedor,Pago Proveedor,Nota\n";
    ventas.forEach(v => {
      csv += `"${v.fechaExcursion}","${v.clienteNombre}","${v.excursionNombre}",${v.precioVenta},${v.precioCompra},${v.ganancia},"${getPagoClienteText(v.pagoCliente)}",${v.saldoPendiente},"${v.metodoPagoCliente}","${v.proveedorNombre}","${v.proveedorPagado}","${v.nota || ""}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `excursiones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-xl text-white">🏝️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Excursiones Pro</h1>
                <p className="text-xs text-gray-400">Clientes • Proveedores • Ganancias</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setViewMode("dashboard")}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "dashboard" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setViewMode("ventas")}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "ventas" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                🧾 Ventas
              </button>
              <button
                onClick={() => setViewMode("clientes")}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "clientes" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                👤 Clientes
              </button>
              <button
                onClick={() => setViewMode("proveedores")}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "proveedores" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                🏢 Proveedores
              </button>
              <button
                onClick={() => setViewMode("excursiones")}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "excursiones" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                🏝️ Excursiones
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-blue-500/25"
              >
                <span>+</span> Nueva Venta
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ============================================
            DASHBOARD
        ============================================ */}
        {viewMode === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <p className="text-sm text-gray-400">💰 Total Ventas</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalVentas)}</p>
                <p className="text-xs text-gray-400">{ventas.length} ventas</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <p className="text-sm text-gray-400">📈 Ganancia Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalGanancia)}</p>
                <p className="text-xs text-gray-400">Venta - Costo</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <p className="text-sm text-gray-400">⏳ Por Cobrar</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPendiente)}</p>
                <p className="text-xs text-gray-400">Saldo de clientes</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <p className="text-sm text-gray-400">🏝️ Excursiones</p>
                <p className="text-2xl font-bold text-purple-600">{excursiones.length}</p>
                <p className="text-xs text-gray-400">Productos</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <p className="text-sm text-gray-400">🏢 Proveedores</p>
                <p className="text-2xl font-bold text-red-600">{proveedoresPendientes}</p>
                <p className="text-xs text-gray-400">Pagos pendientes</p>
              </div>
            </div>

            {/* Últimas ventas */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Últimas ventas</h2>
              {ventas.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏝️</div>
                  <p className="text-gray-400">No hay ventas registradas</p>
                  <button onClick={() => setShowForm(true)} className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all">
                    + Registrar primera venta
                  </button>
                </div>
              ) : (
                ventas.slice(0, 5).map((v) => (
                  <div key={v.id} className="flex flex-wrap items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{v.clienteNombre}</p>
                      <p className="text-sm text-gray-400">{v.excursionNombre} • {new Date(v.fechaExcursion).toLocaleDateString("es-DO")}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${v.pagoCliente === 'completo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {getPagoClienteText(v.pagoCliente)}
                      </span>
                      <span className="text-sm font-bold text-blue-600">{formatCurrency(v.precioVenta)}</span>
                      <span className="text-xs text-green-600">+{formatCurrency(v.ganancia)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ============================================
            EXCURSIONES
        ============================================ */}
        {viewMode === "excursiones" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">🏝️ Excursiones</h2>
              <button onClick={() => setShowExcursionForm(true)} className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-all text-sm">
                + Agregar Excursión
              </button>
            </div>
            {excursiones.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No hay excursiones registradas</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Excursión</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Precio Proveedor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Precio Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">💰 Ganancia</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excursiones.map((e) => (
                      <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{e.nombre}</td>
                        <td className="px-4 py-3 text-sm text-red-600 font-medium">{formatCurrency(e.precioProveedor)}</td>
                        <td className="px-4 py-3 text-sm text-blue-600 font-medium">{formatCurrency(e.precioCliente)}</td>
                        <td className="px-4 py-3 text-sm text-green-600 font-bold">{formatCurrency(e.ganancia)}</td>
                        <td className="px-4 py-3 text-sm">
                          <button onClick={() => deleteExcursion(e.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            CLIENTES
        ============================================ */}
        {viewMode === "clientes" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">👤 Clientes</h2>
              <button onClick={() => setShowClienteForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all text-sm">
                + Agregar Cliente
              </button>
            </div>
            {clientes.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No hay clientes registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">WhatsApp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Excursión</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((c) => (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{c.whatsapp}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{c.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{c.excursionNombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(c.fechaExcursion).toLocaleDateString("es-DO")}</td>
                        <td className="px-4 py-3 text-sm">
                          <button onClick={() => deleteCliente(c.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            PROVEEDORES
        ============================================ */}
        {viewMode === "proveedores" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">🏢 Proveedores</h2>
              <button onClick={() => setShowProveedorForm(true)} className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-all text-sm">
                + Agregar Proveedor
              </button>
            </div>
            {proveedores.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No hay proveedores registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Teléfono</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Excursión</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Precio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Método</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.telefono}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.excursionNombre}</td>
                        <td className="px-4 py-3 text-sm font-bold text-red-600">{formatCurrency(p.precioCompra)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.metodoPago}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(p.pagoStatus)}`}>
                            {p.pagoStatus === "pagado" ? "✅ Pagado" : "⏳ Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button onClick={() => deleteProveedor(p.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            VENTAS
        ============================================ */}
        {viewMode === "ventas" && (
          <>
            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-gray-100">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="🔍 Buscar por cliente o excursión..."
                  className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="">Todos los años</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 text-sm">
                  📊 CSV
                </button>
              </div>
            </div>

            {/* Lista de ventas por mes */}
            {groupedArray.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-16 text-center border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">🧾</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No hay ventas</h3>
                <p className="text-gray-400 mb-4">Registra tu primera venta</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedArray.map((group) => {
                  const isExpanded = expandedMonth === group.key;
                  return (
                    <div key={group.key} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                      <button
                        onClick={() => toggleMonth(group.key)}
                        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">📆</span>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-800">
                              {getMonthName(group.month)} {group.year}
                            </h3>
                            <p className="text-sm text-gray-400">{group.ventas.length} ventas</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-blue-600">{formatCurrency(group.total)}</span>
                          <span className="text-sm text-green-600">+{formatCurrency(group.ganancias)}</span>
                          <span className="text-gray-400 text-xl">{isExpanded ? "▼" : "▶"}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-100">
                          <div className="overflow-x-auto p-4">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cliente</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Excursión</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pago</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Venta</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Ganancia</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {group.ventas.map((v: Venta) => (
                                  <tr key={v.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(v.fechaExcursion).toLocaleDateString("es-DO")}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{v.clienteNombre}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{v.excursionNombre}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className={`text-xs px-2 py-1 rounded-full ${v.pagoCliente === 'completo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {getPagoClienteText(v.pagoCliente)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-blue-600">{formatCurrency(v.precioVenta)}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-green-600">+{formatCurrency(v.ganancia)}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => editVenta(v)} className="text-blue-600 hover:text-blue-800">✏️</button>
                                        <button onClick={() => deleteVenta(v.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-700">Totales del mes:</td>
                                  <td className="px-4 py-3 font-bold text-blue-600">{formatCurrency(group.total)}</td>
                                  <td className="px-4 py-3 font-bold text-green-600">+{formatCurrency(group.ganancias)}</td>
                                  <td></td>
                                </tr>
                              </tfoot>
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

      {/* ============================================
          MODAL DE VENTA
      ============================================ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? "✏️ Editar Venta" : "📝 Nueva Venta"}
                </h2>
                <p className="text-sm text-gray-400">Registra una venta de excursión</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-600 text-3xl leading-none">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seleccionar Excursión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🏝️ Excursión *</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.excursionId}
                  onChange={(e) => selectExcursion(e.target.value)}
                >
                  <option value="">Seleccionar excursión</option>
                  {excursiones.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} - Cliente: {formatCurrency(e.precioCliente)} | Proveedor: {formatCurrency(e.precioProveedor)} | Ganancia: {formatCurrency(e.ganancia)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">💰 Precio Venta</label>
                  <input type="number" required className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50" value={formData.precioVenta} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">💸 Precio Compra</label>
                  <input type="number" required className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50" value={formData.precioCompra} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📈 Ganancia</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-green-50 text-green-600 font-bold" value={formData.ganancia} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">👤 Cliente *</label>
                  <input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Nombre del cliente" value={formData.clienteNombre} onChange={(e) => setFormData({ ...formData, clienteNombre: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📱 WhatsApp</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="849-000-0000" value={formData.clienteWhatsapp} onChange={(e) => setFormData({ ...formData, clienteWhatsapp: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📅 Fecha Excursión *</label>
                  <input type="date" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" value={formData.fechaExcursion} onChange={(e) => setFormData({ ...formData, fechaExcursion: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🏢 Proveedor</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" value={formData.proveedorId} onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}>
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} - {p.excursionNombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">💳 Método de Pago del Cliente *</label>
                <select required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" value={formData.metodoPagoCliente} onChange={(e) => setFormData({ ...formData, metodoPagoCliente: e.target.value as any })}>
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta">💳 Tarjeta</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="paypal">📱 PayPal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📋 Estado del Pago del Cliente *</label>
                <select required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" value={formData.pagoCliente} onChange={(e) => setFormData({ ...formData, pagoCliente: e.target.value as any })}>
                  <option value="completo">✅ Pago completo (todo hoy)</option>
                  <option value="deposito_25">🏦 Depósito del 25% (reserva)</option>
                  <option value="pago_dia">📅 Paga el día de la excursión</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">💵 Monto Pagado</label>
                <input type="number" step="0.01" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="0.00" value={formData.montoPagado} onChange={(e) => setFormData({ ...formData, montoPagado: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📝 Nota</label>
                <textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Detalles adicionales..." rows={2} value={formData.nota} onChange={(e) => setFormData({ ...formData, nota: e.target.value })} />
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all">
                {editingId ? "💾 Actualizar Venta" : "💾 Guardar Venta"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL DE EXCURSIÓN
      ============================================ */}
      {showExcursionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🏝️ Nueva Excursión</h2>
              <button onClick={() => setShowExcursionForm(false)} className="text-gray-300 hover:text-gray-600 text-3xl leading-none">×</button>
            </div>
            <form onSubmit={handleExcursionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Excursión *</label>
                <input type="text" name="nombre" required className="w-full px-4 py-3 border border-gray-200 rounded-xl" placeholder="Ej: Tour Samaná" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">💰 Precio al Proveedor *</label>
                <input type="number" name="precioProveedor" required step="0.01" className="w-full px-4 py-3 border border-gray-200 rounded-xl" placeholder="70.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">💰 Precio al Cliente *</label>
                <input type="number" name="precioCliente" required step="0.01" className="w-full px-4 py-3 border border-gray-200 rounded-xl" placeholder="85.00" />
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all">
                💾 Guardar Excursión
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL DE PROVEEDOR
      ============================================ */}
      {showProveedorForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🏢 Nuevo Proveedor</h2>
              <button onClick={() => setShowProveedorForm(false)} className="text-gray-300 hover:text-gray-600 text-3xl leading-none">×</button>
            </div>
            <form onSubmit={handleProveedorSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proveedor *</label>
                <input type="text" name="nombre" required className="w-full px-4 py-3 border border-gray-200 rounded-xl" placeholder="Ej: Samaná Tours" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" name="telefono" className="w-full px-4 py-3 border border-gray-200 rounded-xl" placeholder="809-000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🏝️ Excursión *</label>
                <select name="excursionId" required className="w-full px-4 py-3 border border-gray-200 rounded-xl">
                  <option value="">Seleccionar excursión</option>
                  {excursiones.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre} - Precio: {formatCurrency(e.precioProveedor)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">💳 Método de Pago</label>
                <select name="metodoPago" className="w-full px-4 py-3 border border-gray-200 rounded-xl">
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="paypal">📱 PayPal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📝 Nota</label>
                <textarea name="nota" className="w-full px-4 py-3 border border-gray-200 rounded-xl" placeholder="Detalles del proveedor..." rows={2}></textarea>
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all">
                💾 Guardar Proveedor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL DE CLIENTE
      ============================================ */}
      {showClienteForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">👤 Nuevo Cliente</h2>
              <button onClick={() => setShowClienteForm(false)} className="text-gray-300 hover:text-gray-600 text-3xl leading-none">×</button>
            </div>
            <form onSubmit={handleClienteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente *</label>
                <input type="text" name="nombre" required className="w-full px-4 py-3 border border-gray-200 rounded-xl" placeholder="Ej: Juan Pérez" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📱 WhatsApp</label>
                <input type="text" name="whatsapp" className="w-full px-4 py-3 border border-gray-200 rounded-xl" placeholder="849-000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📧 Email</label>
                <input type="email" name="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl" placeholder="cliente@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🏝️ Excursión *</label>
                <select name="excursionId" required className="w-full px-4 py-3 border border-gray-200 rounded-xl">
                  <option value="">Seleccionar excursión</option>
                  {excursiones.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre} - {formatCurrency(e.precioCliente)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📅 Fecha de la Excursión *</label>
                <input type="date" name="fechaExcursion" required className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all">
                💾 Guardar Cliente
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
