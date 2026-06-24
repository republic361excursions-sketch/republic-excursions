"use client";

import { useState, useEffect } from "react";

// ============================================
// INTERFACES
// ============================================
interface Excursion {
  id: string;
  nombre: string;
  precioProveedorRD: number; // Precio en PESOS para el proveedor
  precioClienteUSD: number; // Precio en DÓLARES para el cliente
  gananciaUSD: number;
  gananciaRD: number;
}

interface Proveedor {
  id: string;
  nombre: string;
  telefono: string;
  excursionId: string;
  excursionNombre: string;
  precioCompraRD: number; // En PESOS
  metodoPago: "efectivo" | "transferencia" | "paypal";
  pagoStatus: "pendiente" | "pagado";
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
  clienteNombre: string;
  clienteWhatsapp: string;
  clienteEmail: string;
  excursionId: string;
  excursionNombre: string;
  fechaExcursion: string;
  precioClienteUSD: number; // Cliente paga en DÓLARES
  precioProveedorRD: number; // Proveedor cobra en PESOS
  gananciaUSD: number;
  gananciaRD: number;
  pagoCliente: "completo" | "deposito_25" | "pago_dia";
  montoPagadoUSD: number;
  saldoPendienteUSD: number;
  metodoPagoCliente: "efectivo" | "tarjeta" | "transferencia" | "paypal";
  proveedorId: string;
  proveedorNombre: string;
  proveedorPagado: "pendiente" | "pagado";
  metodoPagoProveedor: "efectivo" | "transferencia" | "paypal";
  nota: string;
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
  // FORMULARIO
  // ============================================
  const [formData, setFormData] = useState({
    clienteNombre: "",
    clienteWhatsapp: "",
    clienteEmail: "",
    excursionId: "",
    excursionNombre: "",
    fechaExcursion: "",
    precioClienteUSD: "", // Cliente paga en DÓLARES
    precioProveedorRD: "", // Proveedor cobra en PESOS
    gananciaUSD: "",
    gananciaRD: "",
    pagoCliente: "completo" as "completo" | "deposito_25" | "pago_dia",
    montoPagadoUSD: "",
    saldoPendienteUSD: "",
    metodoPagoCliente: "efectivo" as "efectivo" | "tarjeta" | "transferencia" | "paypal",
    proveedorId: "",
    proveedorNombre: "",
    proveedorPagado: "pendiente" as "pendiente" | "pagado",
    metodoPagoProveedor: "efectivo" as "efectivo" | "transferencia" | "paypal",
    nota: "",
  });

  // ============================================
  // CARGAR DATOS
  // ============================================
  useEffect(() => {
    const savedVentas = localStorage.getItem("excursiones_ventas_v3");
    const savedClientes = localStorage.getItem("excursiones_clientes_v3");
    const savedProveedores = localStorage.getItem("excursiones_proveedores_v3");
    const savedExcursiones = localStorage.getItem("excursiones_excursiones_v3");
    
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
    localStorage.setItem("excursiones_ventas_v3", JSON.stringify(data));
  };

  const saveClientes = (data: Cliente[]) => {
    setClientes(data);
    localStorage.setItem("excursiones_clientes_v3", JSON.stringify(data));
  };

  const saveProveedores = (data: Proveedor[]) => {
    setProveedores(data);
    localStorage.setItem("excursiones_proveedores_v3", JSON.stringify(data));
  };

  const saveExcursiones = (data: Excursion[]) => {
    setExcursiones(data);
    localStorage.setItem("excursiones_excursiones_v3", JSON.stringify(data));
  };

  // ============================================
  // AGREGAR EXCURSIÓN
  // ============================================
  const handleExcursionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    
    const precioProveedorRD = parseFloat(data.get("precioProveedorRD") as string);
    const precioClienteUSD = parseFloat(data.get("precioClienteUSD") as string);
    
    const nuevaExcursion: Excursion = {
      id: Date.now().toString(),
      nombre: data.get("nombre") as string,
      precioProveedorRD,
      precioClienteUSD,
      gananciaUSD: precioClienteUSD,
      gananciaRD: -precioProveedorRD,
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
      precioCompraRD: excursion?.precioProveedorRD || 0,
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
  // CALCULAR GANANCIA
  // ============================================
  const calcularGanancia = (usd: string, rd: string) => {
    const u = parseFloat(usd) || 0;
    const r = parseFloat(rd) || 0;
    return { gananciaUSD: u.toString(), gananciaRD: r.toString() };
  };

  // ============================================
  // GUARDAR VENTA
  // ============================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const precioClienteUSD = parseFloat(formData.precioClienteUSD);
    const precioProveedorRD = parseFloat(formData.precioProveedorRD);
    const montoPagadoUSD = parseFloat(formData.montoPagadoUSD) || 0;
    
    let saldoPendienteUSD = 0;
    if (formData.pagoCliente === "completo") {
      saldoPendienteUSD = 0;
    } else if (formData.pagoCliente === "deposito_25") {
      saldoPendienteUSD = precioClienteUSD * 0.75;
    } else if (formData.pagoCliente === "pago_dia") {
      saldoPendienteUSD = precioClienteUSD;
    }

    const nuevaVenta: Venta = {
      id: editingId || Date.now().toString(),
      clienteNombre: formData.clienteNombre,
      clienteWhatsapp: formData.clienteWhatsapp,
      clienteEmail: formData.clienteEmail,
      excursionId: formData.excursionId,
      excursionNombre: formData.excursionNombre,
      fechaExcursion: formData.fechaExcursion,
      precioClienteUSD,
      precioProveedorRD,
      gananciaUSD: precioClienteUSD,
      gananciaRD: -precioProveedorRD,
      pagoCliente: formData.pagoCliente,
      montoPagadoUSD,
      saldoPendienteUSD,
      metodoPagoCliente: formData.metodoPagoCliente,
      proveedorId: formData.proveedorId,
      proveedorNombre: formData.proveedorNombre,
      proveedorPagado: formData.proveedorPagado,
      metodoPagoProveedor: formData.metodoPagoProveedor,
      nota: formData.nota,
    };

    if (editingId) {
      const updated = ventas.map(v => v.id === editingId ? nuevaVenta : v);
      saveVentas(updated);
    } else {
      saveVentas([...ventas, nuevaVenta]);
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
      precioClienteUSD: "",
      precioProveedorRD: "",
      gananciaUSD: "",
      gananciaRD: "",
      pagoCliente: "completo",
      montoPagadoUSD: "",
      saldoPendienteUSD: "",
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
  // SELECCIONAR EXCURSIÓN
  // ============================================
  const selectExcursion = (excursionId: string) => {
    const excursion = excursiones.find(e => e.id === excursionId);
    if (excursion) {
      const proveedor = proveedores.find(p => p.excursionId === excursionId);
      
      setFormData({
        ...formData,
        excursionId: excursion.id,
        excursionNombre: excursion.nombre,
        precioClienteUSD: excursion.precioClienteUSD.toString(),
        precioProveedorRD: excursion.precioProveedorRD.toString(),
        gananciaUSD: excursion.precioClienteUSD.toString(),
        gananciaRD: excursion.precioProveedorRD.toString(),
        proveedorId: proveedor?.id || "",
        proveedorNombre: proveedor?.nombre || "",
      });
    }
  };

  const handlePrecioChange = (campo: "precioClienteUSD" | "precioProveedorRD", valor: string) => {
    const newFormData = { ...formData, [campo]: valor };
    const usd = campo === "precioClienteUSD" ? valor : formData.precioClienteUSD;
    const rd = campo === "precioProveedorRD" ? valor : formData.precioProveedorRD;
    const ganancias = calcularGanancia(usd, rd);
    newFormData.gananciaUSD = ganancias.gananciaUSD;
    newFormData.gananciaRD = ganancias.gananciaRD;
    setFormData(newFormData);
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
      precioClienteUSD: venta.precioClienteUSD.toString(),
      precioProveedorRD: venta.precioProveedorRD.toString(),
      gananciaUSD: venta.gananciaUSD.toString(),
      gananciaRD: venta.gananciaRD.toString(),
      pagoCliente: venta.pagoCliente,
      montoPagadoUSD: venta.montoPagadoUSD.toString(),
      saldoPendienteUSD: venta.saldoPendienteUSD.toString(),
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
    filtered = filtered.filter(v => new Date(v.fechaExcursion).getFullYear().toString() === filterYear);
  }
  if (searchTerm) {
    filtered = filtered.filter(v => 
      v.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.excursionNombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const grouped = filtered.reduce((acc: any, venta) => {
    const fecha = new Date(venta.fechaExcursion);
    const year = fecha.getFullYear();
    const month = fecha.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    
    if (!acc[key]) {
      acc[key] = { year, month, totalUSD: 0, totalRD: 0, ventas: [] };
    }
    acc[key].totalUSD += venta.precioClienteUSD;
    acc[key].totalRD += venta.precioProveedorRD;
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
  const totalVentasUSD = filtered.reduce((sum, v) => sum + v.precioClienteUSD, 0);
  const totalGastosRD = filtered.reduce((sum, v) => sum + v.precioProveedorRD, 0);
  const totalPendienteUSD = filtered.reduce((sum, v) => sum + v.saldoPendienteUSD, 0);
  const proveedoresPendientes = proveedores.filter(p => p.pagoStatus === "pendiente").length;
  
  const years = [...new Set(ventas.map(v => new Date(v.fechaExcursion).getFullYear().toString()))].sort().reverse();

  // ============================================
  // FORMATO DE MONEDA
  // ============================================
  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatRD = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
      completo: "✅ Pago completo (USD)",
      deposito_25: "🏦 Depósito 25% (USD)",
      pago_dia: "📅 Pago el día (USD)"
    };
    return map[tipo] || tipo;
  };

  const getStatusColor = (status: string) => {
    return status === "pagado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
  };

  const exportCSV = () => {
    if (ventas.length === 0) { alert("No hay datos"); return; }
    let csv = "Fecha,Cliente,Excursión,Precio Cliente (USD),Precio Proveedor (RD$),Pago Cliente,Saldo Pendiente (USD),Método Pago,Proveedor,Pago Proveedor,Nota\n";
    ventas.forEach(v => {
      csv += `"${v.fechaExcursion}","${v.clienteNombre}","${v.excursionNombre}",${v.precioClienteUSD},${v.precioProveedorRD},"${getPagoClienteText(v.pagoCliente)}",${v.saldoPendienteUSD},"${v.metodoPagoCliente}","${v.proveedorNombre}","${v.proveedorPagado}","${v.nota || ""}"\n`;
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
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-xl text-white">🏝️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Republic Excursions</h1>
                <p className="text-xs text-gray-400">Cliente paga en USD • Proveedor cobra en RD$</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setViewMode("dashboard")} className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === "dashboard" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" : "text-gray-600 hover:bg-gray-100"}`}>📊 Dashboard</button>
              <button onClick={() => setViewMode("ventas")} className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === "ventas" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" : "text-gray-600 hover:bg-gray-100"}`}>🧾 Ventas</button>
              <button onClick={() => setViewMode("clientes")} className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === "clientes" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" : "text-gray-600 hover:bg-gray-100"}`}>👤 Clientes</button>
              <button onClick={() => setViewMode("proveedores")} className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === "proveedores" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" : "text-gray-600 hover:bg-gray-100"}`}>🏢 Proveedores</button>
              <button onClick={() => setViewMode("excursiones")} className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === "excursiones" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" : "text-gray-600 hover:bg-gray-100"}`}>🏝️ Excursiones</button>
              <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-blue-500/25">+ Nueva Venta</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* DASHBOARD */}
        {viewMode === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <p className="text-sm text-gray-400">💰 Total Ventas (USD)</p>
                <p className="text-2xl font-bold text-blue-600">{formatUSD(totalVentasUSD)}</p>
                <p className="text-xs text-gray-400">{ventas.length} ventas</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <p className="text-sm text-gray-400">💸 Total Gastos (RD$)</p>
                <p className="text-2xl font-bold text-red-600">{formatRD(totalGastosRD)}</p>
                <p className="text-xs text-gray-400">Pagos a proveedores</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <p className="text-sm text-gray-400">⏳ Por Cobrar (USD)</p>
                <p className="text-2xl font-bold text-orange-600">{formatUSD(totalPendienteUSD)}</p>
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

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Últimas ventas</h2>
              {ventas.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏝️</div>
                  <p className="text-gray-400">No hay ventas registradas</p>
                  <button onClick={() => setShowForm(true)} className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all">+ Registrar primera venta</button>
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
                      <span className="text-sm font-bold text-blue-600">{formatUSD(v.precioClienteUSD)}</span>
                      <span className="text-xs text-red-600">{formatRD(v.precioProveedorRD)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* EXCURSIONES */}
        {viewMode === "excursiones" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">🏝️ Excursiones</h2>
              <button onClick={() => setShowExcursionForm(true)} className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-all text-sm">+ Agregar Excursión</button>
            </div>
            {excursiones.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No hay excursiones registradas</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Excursión</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Precio Cliente (USD)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Precio Proveedor (RD$)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excursiones.map((e) => (
                      <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{e.nombre}</td>
                        <td className="px-4 py-3 text-sm text-blue-600 font-medium">{formatUSD(e.precioClienteUSD)}</td>
                        <td className="px-4 py-3 text-sm text-red-600 font-medium">{formatRD(e.precioProveedorRD)}</td>
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

        {/* CLIENTES */}
        {viewMode === "clientes" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">👤 Clientes</h2>
              <button onClick={() => setShowClienteForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all text-sm">+ Agregar Cliente</button>
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

        {/* PROVEEDORES */}
        {viewMode === "proveedores" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">🏢 Proveedores</h2>
              <button onClick={() => setShowProveedorForm(true)} className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-all text-sm">+ Agregar Proveedor</button>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Precio (RD$)</th>
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
                        <td className="px-4 py-3 text-sm font-bold text-red-600">{formatRD(p.precioCompraRD)}</td>
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

        {/* VENTAS */}
        {viewMode === "ventas" && (
          <>
            <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-gray-100">
              <div className="flex flex-wrap items-center gap-3">
                <input type="text" placeholder="🔍 Buscar..." className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                  <option value="">Todos los años</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 text-sm">📊 CSV</button>
              </div>
            </div>

            {groupedArray.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-16 text-center border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">🧾</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No hay ventas</h3>
                <button onClick={() => setShowForm(true)} className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all">+ Registrar primera venta</button>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedArray.map((group) => {
                  const isExpanded = expandedMonth === group.key;
                  return (
                    <div key={group.key} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                      <button onClick={() => toggleMonth(group.key)} className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">📆</span>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-800">{getMonthName(group.month)} {group.year}</h3>
                            <p className="text-sm text-gray-400">{group.ventas.length} ventas</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-blue-600">{formatUSD(group.totalUSD)}</span>
                          <span className="text-sm text-red-600">{formatRD(group.totalRD)}</span>
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
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">USD</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">RD$</th>
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
                                    <td className="px-4 py-3 text-sm font-bold text-blue-600">{formatUSD(v.precioClienteUSD)}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-red-600">{formatRD(v.precioProveedorRD)}</td>
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
                                  <td className="px-4 py-3 font-bold text-blue-600">{formatUSD(group.totalUSD)}</td>
                                  <td className="px-4 py-3 font-bold text-red-600">{formatRD(group.totalRD)}</td>
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
                <h2 className="text-2xl font-bold text-gray-800">{editingId ? "✏️ Editar Venta" : "📝 Nueva Venta"}</h2>
                <p className="text-sm text-gray-400">Cliente paga en USD • Proveedor cobra en RD$</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-600 text-3xl leading-none">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Excursión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🏝️ Excursión *</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.excursionId}
                    onChange={(e) => selectExcursion(e.target.value)}
                  >
                    <option value="">Seleccionar excursión</option>
                    {excursiones.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.nombre} - USD {e.precioClienteUSD} / RD$ {e.precioProveedorRD}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="O escribe nombre"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.excursionNombre}
                    onChange={(e) => setFormData({ ...formData, excursionNombre: e.target.value })}
                  />
                </div>
              </div>

              {/* Precios - DUAL MONEDA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🇺🇸 Precio Cliente (USD) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    value={formData.precioClienteUSD}
                    onChange={(e) => handlePrecioChange("precioClienteUSD", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🇩🇴 Precio Proveedor (RD$) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    value={formData.precioProveedorRD}
                    onChange={(e) => handlePrecioChange("precioProveedorRD", e.target.value)}
                  />
                </div>
              </div>

              {/* Resumen de Ganancias */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">💰 Ingreso (USD)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white font-bold text-blue-600"
                    value={formData.gananciaUSD}
                    readOnly
                  />
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">💸 Gasto (RD$)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white font-bold text-red-600"
                    value={formData.gananciaRD}
                    readOnly
                  />
                </div>
              </div>

              {/* Cliente */}
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

              {/* Fecha y Proveedor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📅 Fecha Excursión *</label>
                  <input type="date" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" value={formData.fechaExcursion} onChange={(e) => setFormData({ ...formData, fechaExcursion: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🏢 Proveedor</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" value={formData.proveedorId} onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}>
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre} - {p.excursionNombre}</option>)}
                  </select>
                </div>
              </div>

              {/* Método de Pago Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">💳 Método de Pago del Cliente *</label>
                <select required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" value={formData.metodoPagoCliente} onChange={(e) => setFormData({ ...formData, metodoPagoCliente: e.target.value as any })}>
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta">💳 Tarjeta</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="paypal">📱 PayPal</option>
                </select>
              </div>

              {/* Estado Pago Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📋 Estado del Pago del Cliente *</label>
                <select required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" value={formData.pagoCliente} onChange={(e) => setFormData({ ...formData, pagoCliente: e.target.value as any })}>
                  <option value="completo">✅ Pago completo (USD)</option>
                  <option value="deposito_25">🏦 Depósito del 25% (USD)</option>
                  <option value="pago_dia">📅 Paga el día de la excursión (USD)</option>
                </select>
              </div>

              {/* Monto Pagado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">💵 Monto Pagado (USD)</label>
                <input type="number" step="0.01" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="0.00" value={formData.montoPagadoUSD} onChange={(e) => setFormData({ ...formData, montoPagadoUSD: e.target.value })} />
              </div>

              {/* Nota */}
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

      {/* MODAL EXCURSIÓN */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">🇺🇸 Precio Cliente (USD) *</label>
                <input type="number" name="precioClienteUSD" required step="0.01" className="w-full px-4 py-3 border border-gray-200 rounded-xl" placeholder="85.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🇩🇴 Precio Proveedor (RD$) *</label>
                <input type="number" name="precioProveedorRD" required step="0.01" className="w-full px-4 py-3 border border-gray-200 rounded-xl" placeholder="4000.00" />
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all">💾 Guardar Excursión</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PROVEEDOR */}
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
                  {excursiones.map(e => <option key={e.id} value={e.id}>{e.nombre} - RD$ {e.precioProveedorRD}</option>)}
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
              <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all">💾 Guardar Proveedor</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CLIENTE */}
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
                  {excursiones.map(e => <option key={e.id} value={e.id}>{e.nombre} - USD {e.precioClienteUSD}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📅 Fecha de la Excursión *</label>
                <input type="date" name="fechaExcursion" required className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all">💾 Guardar Cliente</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
