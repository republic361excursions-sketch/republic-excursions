"use client";

import { useState, useEffect } from "react";

// ============================================
// INTERFACES
// ============================================
interface Excursion {
  id: string;
  nombre: string; 
  proveedorId: string;
  proveedorNombre: string;
  precioAdultoUSD: number;
  precioNinoUSD: number | null;
  costoProveedorAdultoUSD: number;
  costoProveedorNinoUSD: number | null;
  comisionAdultoUSD: number;
  comisionNinoUSD: number | null;
  zona?: string;
  capacidad?: string;
}

interface Proveedor {
  id: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  metodosPago: ("efectivo" | "transferencia" | "paypal")[];
  banco: string;
  numeroCuenta: string;
  beneficiario: string;
  tipoCuenta: "corriente" | "ahorros" | "nomina";
  documentos: string;
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
  horaExcursion: string;
  precioVentaUSD: number;
  costoProveedorUSD: number;
  comisionUSD: number;
  pagoCliente: "completo" | "deposito_25" | "pago_dia";
  montoPagadoUSD: number;
  saldoPendienteUSD: number;
  metodoPagoCliente: "efectivo" | "tarjeta" | "transferencia" | "paypal";
  proveedorId: string;
  proveedorNombre: string;
  proveedorPagado: "pendiente" | "pagado";
  metodoPagoProveedor: "efectivo" | "transferencia" | "paypal";
  cantidadAdultos: number;
  cantidadNinos: number;
  tipoServicio: "compartido" | "privado" | "grupo";
  nombreGrupo?: string;
  tipoRecogida: "hotel" | "airbnb" | "sin_recogida";
  transporte: "si" | "no";
  precioAdultoPersonalizado: number;
  precioNinoPersonalizado: number;
  costoAdultoPersonalizado: number;
  costoNinoPersonalizado: number;
  nota: string;
  estado: "pendiente" | "confirmada" | "cancelada" | "completada";
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<"raul" | "gabrielle" | null>(null);
  const [loginError, setLoginError] = useState("");
  
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [excursiones, setExcursiones] = useState<Excursion[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [showProveedorForm, setShowProveedorForm] = useState(false);
  const [showExcursionForm, setShowExcursionForm] = useState(false);
  const [showCrearExcursionDesdeVenta, setShowCrearExcursionDesdeVenta] = useState(false);
  const [editingVentaId, setEditingVentaId] = useState<string | null>(null);
  const [editingExcursionId, setEditingExcursionId] = useState<string | null>(null);
  const [editingProveedorId, setEditingProveedorId] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"dashboard" | "ventas" | "clientes" | "proveedores" | "excursiones" | "bancos" | "calendario" | "reservas">("dashboard");
  const [selectedExcursionForVenta, setSelectedExcursionForVenta] = useState<Excursion | null>(null);
  const [calendarioView, setCalendarioView] = useState<"dia" | "semana" | "mes">("mes");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filtroEstadoReserva, setFiltroEstadoReserva] = useState<string>("todas");

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [tempExcursiones, setTempExcursiones] = useState<any[]>([]);
  const [tempExcursionForm, setTempExcursionForm] = useState({
    nombre: "",
    precioAdultoUSD: "",
    precioNinoUSD: "",
    costoProveedorAdultoUSD: "",
    costoProveedorNinoUSD: "",
    comisionAdultoUSD: "",
    comisionNinoUSD: "",
    zona: "",
    capacidad: "",
    tienePrecioNino: false,
  });

  const [formData, setFormData] = useState({
    clienteNombre: "",
    clienteWhatsapp: "",
    clienteEmail: "",
    excursionId: "",
    excursionNombre: "",
    fechaExcursion: "",
    horaExcursion: "02:00 PM",
    precioAdultoUSD: "",
    precioNinoUSD: "",
    costoProveedorAdultoUSD: "",
    costoProveedorNinoUSD: "",
    comisionAdultoUSD: "",
    comisionNinoUSD: "",
    cantidadAdultos: 1,
    cantidadNinos: 0,
    precioTotalUSD: "",
    costoTotalUSD: "",
    comisionTotalUSD: "",
    pagoCliente: "completo" as "completo" | "deposito_25" | "pago_dia",
    montoPagadoUSD: "",
    saldoPendienteUSD: "",
    metodoPagoCliente: "efectivo" as "efectivo" | "tarjeta" | "transferencia" | "paypal",
    proveedorId: "",
    proveedorNombre: "",
    proveedorPagado: "pendiente" as "pendiente" | "pagado",
    metodoPagoProveedor: "efectivo" as "efectivo" | "transferencia" | "paypal",
    tipoServicio: "compartido" as "compartido" | "privado" | "grupo",
    nombreGrupo: "",
    tipoRecogida: "sin_recogida" as "hotel" | "airbnb" | "sin_recogida",
    transporte: "no" as "si" | "no",
    estado: "pendiente" as "pendiente" | "confirmada" | "cancelada" | "completada",
    nota: "",
  });

  const [excursionFormData, setExcursionFormData] = useState({
    nombre: "",
    proveedorId: "",
    proveedorNombre: "",
    precioAdultoUSD: "",
    precioNinoUSD: "",
    costoProveedorAdultoUSD: "",
    costoProveedorNinoUSD: "",
    comisionAdultoUSD: "",
    comisionNinoUSD: "",
    zona: "",
    capacidad: "",
    tienePrecioNino: false,
  });

  const [proveedorFormData, setProveedorFormData] = useState({
    nombre: "",
    empresa: "",
    telefono: "",
    email: "",
    metodosPago: [] as ("efectivo" | "transferencia" | "paypal")[],
    banco: "",
    numeroCuenta: "",
    beneficiario: "",
    tipoCuenta: "corriente" as "corriente" | "ahorros" | "nomina",
    documentos: "",
    nota: "",
  });

  const [nuevaExcursionDesdeVenta, setNuevaExcursionDesdeVenta] = useState({
    nombre: "",
    precioAdultoUSD: "",
    precioNinoUSD: "",
    costoProveedorAdultoUSD: "",
    costoProveedorNinoUSD: "",
    tienePrecioNino: false,
    proveedorId: "",
    proveedorNombre: "",
    zona: "",
    capacidad: "",
  });

  // ============================================
  // FUNCIONES DE HORA
  // ============================================
  const formatearHora = (hora24: string) => {
    if (!hora24) return "02:00 PM";
    const partes = hora24.split(":");
    let hora = parseInt(partes[0]);
    const minutos = partes[1] || "00";
    const ampm = hora >= 12 ? "PM" : "AM";
    hora = hora % 12 || 12;
    return `${hora.toString().padStart(2, "0")}:${minutos} ${ampm}`;
  };

  const convertirHora24 = (hora12: string) => {
    if (!hora12) return "14:00";
    const partes = hora12.split(" ");
    if (partes.length !== 2) return "14:00";
    const horaMin = partes[0].split(":");
    const ampm = partes[1];
    let hora = parseInt(horaMin[0]);
    const minutos = horaMin[1] || "00";
    if (ampm === "PM" && hora < 12) hora += 12;
    if (ampm === "AM" && hora === 12) hora = 0;
    return `${hora.toString().padStart(2, "0")}:${minutos}`;
  };

  // ============================================
  // LOGIN
  // ============================================
  const handleLogin = (username: string, password: string) => {
    if (username === "Raul" && password === "Republ1c$$") {
      setIsLoggedIn(true);
      setCurrentUser("raul");
      setLoginError("");
      return true;
    } else if (username === "Gabrielle" && password === "Republ1c$$") {
      setIsLoggedIn(true);
      setCurrentUser("gabrielle");
      setLoginError("");
      return true;
    } else {
      setLoginError("Usuario o contrasena incorrectos");
      return false;
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginError("");
  };

  // ============================================
  // LOAD DATA
  // ============================================
  useEffect(() => {
    const savedVentas = localStorage.getItem("excursiones_ventas_v24");
    const savedClientes = localStorage.getItem("excursiones_clientes_v24");
    const savedProveedores = localStorage.getItem("excursiones_proveedores_v24");
    const savedExcursiones = localStorage.getItem("excursiones_excursiones_v24");
    
    if (savedVentas) setVentas(JSON.parse(savedVentas));
    if (savedClientes) setClientes(JSON.parse(savedClientes));
    if (savedProveedores) setProveedores(JSON.parse(savedProveedores));
    if (savedExcursiones) setExcursiones(JSON.parse(savedExcursiones));
  }, []);

  const saveVentas = (data: Venta[]) => {
    setVentas(data);
    localStorage.setItem("excursiones_ventas_v24", JSON.stringify(data));
  };

  const saveClientes = (data: Cliente[]) => {
    setClientes(data);
    localStorage.setItem("excursiones_clientes_v24", JSON.stringify(data));
  };

  const saveProveedores = (data: Proveedor[]) => {
    setProveedores(data);
    localStorage.setItem("excursiones_proveedores_v24", JSON.stringify(data));
  };

  const saveExcursiones = (data: Excursion[]) => {
    setExcursiones(data);
    localStorage.setItem("excursiones_excursiones_v24", JSON.stringify(data));
  };

  // ============================================
  // CALCULAR COMISION
  // ============================================
  const calcularComision = (precioVenta: number, costoProveedor: number) => {
    return precioVenta - costoProveedor;
  };

  // ============================================
  // CALCULAR TOTALES DE VENTA
  // ============================================
  const calcularTotalesVenta = () => {
    const precioAdulto = parseFloat(formData.precioAdultoUSD) || 0;
    const precioNino = parseFloat(formData.precioNinoUSD) || 0;
    const costoAdulto = parseFloat(formData.costoProveedorAdultoUSD) || 0;
    const costoNino = parseFloat(formData.costoProveedorNinoUSD) || 0;
    const cantAdultos = formData.cantidadAdultos || 0;
    const cantNinos = formData.cantidadNinos || 0;
    
    const precioTotal = (precioAdulto * cantAdultos) + (precioNino * cantNinos);
    const costoTotal = (costoAdulto * cantAdultos) + (costoNino * cantNinos);
    const comisionTotal = precioTotal - costoTotal;
    
    return { precioTotal, costoTotal, comisionTotal };
  };

  // ============================================
  // CREAR EXCURSION DESDE VENTA
  // ============================================
  const handleCrearExcursionDesdeVenta = (e: React.FormEvent) => {
    e.preventDefault();
    
    const precioAdultoUSD = parseFloat(nuevaExcursionDesdeVenta.precioAdultoUSD) || 0;
    const costoProveedorAdultoUSD = parseFloat(nuevaExcursionDesdeVenta.costoProveedorAdultoUSD) || 0;
    const comisionAdultoUSD = calcularComision(precioAdultoUSD, costoProveedorAdultoUSD);
    
    let precioNinoUSD: number | null = null;
    let costoProveedorNinoUSD: number | null = null;
    let comisionNinoUSD: number | null = null;
    
    if (nuevaExcursionDesdeVenta.tienePrecioNino) {
      precioNinoUSD = parseFloat(nuevaExcursionDesdeVenta.precioNinoUSD) || 0;
      costoProveedorNinoUSD = parseFloat(nuevaExcursionDesdeVenta.costoProveedorNinoUSD) || 0;
      comisionNinoUSD = calcularComision(precioNinoUSD, costoProveedorNinoUSD);
    }
    
    let proveedorId = nuevaExcursionDesdeVenta.proveedorId;
    let proveedorNombre = nuevaExcursionDesdeVenta.proveedorNombre;
    
    if (!proveedorId) {
      const nuevoProveedor: Proveedor = {
        id: Date.now().toString(),
        nombre: proveedorNombre || "Proveedor Temporal",
        empresa: "",
        telefono: "",
        email: "",
        metodosPago: [],
        banco: "",
        numeroCuenta: "",
        beneficiario: "",
        tipoCuenta: "corriente",
        documentos: "",
        nota: "",
      };
      saveProveedores([...proveedores, nuevoProveedor]);
      proveedorId = nuevoProveedor.id;
      proveedorNombre = nuevoProveedor.nombre;
    }
    
    const nuevaExcursion: Excursion = {
      id: Date.now().toString(),
      nombre: nuevaExcursionDesdeVenta.nombre,
      proveedorId: proveedorId,
      proveedorNombre: proveedorNombre,
      precioAdultoUSD,
      precioNinoUSD,
      costoProveedorAdultoUSD,
      costoProveedorNinoUSD,
      comisionAdultoUSD,
      comisionNinoUSD,
      zona: nuevaExcursionDesdeVenta.zona || undefined,
      capacidad: nuevaExcursionDesdeVenta.capacidad || undefined,
    };
    
    saveExcursiones([...excursiones, nuevaExcursion]);
    
    setFormData({
      ...formData,
      excursionId: nuevaExcursion.id,
      excursionNombre: nuevaExcursion.nombre,
      precioAdultoUSD: nuevaExcursion.precioAdultoUSD.toString(),
      precioNinoUSD: (nuevaExcursion.precioNinoUSD || 0).toString(),
      costoProveedorAdultoUSD: nuevaExcursion.costoProveedorAdultoUSD.toString(),
      costoProveedorNinoUSD: (nuevaExcursion.costoProveedorNinoUSD || 0).toString(),
      comisionAdultoUSD: nuevaExcursion.comisionAdultoUSD.toString(),
      comisionNinoUSD: (nuevaExcursion.comisionNinoUSD || 0).toString(),
      proveedorId: nuevaExcursion.proveedorId,
      proveedorNombre: nuevaExcursion.proveedorNombre,
    });
    
    setShowCrearExcursionDesdeVenta(false);
    setNuevaExcursionDesdeVenta({
      nombre: "",
      precioAdultoUSD: "",
      precioNinoUSD: "",
      costoProveedorAdultoUSD: "",
      costoProveedorNinoUSD: "",
      tienePrecioNino: false,
      proveedorId: "",
      proveedorNombre: "",
      zona: "",
      capacidad: "",
    });
    
    setTimeout(updateCantidades, 50);
    alert("Excursión creada correctamente");
  };

  // ============================================
  // HANDLE PROVEEDOR
  // ============================================
  const handleProveedorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const proveedorId = editingProveedorId || Date.now().toString();
    
    if (editingProveedorId) {
      const updated = proveedores.map(p => 
        p.id === editingProveedorId 
          ? { 
              ...p, 
              nombre: proveedorFormData.nombre,
              empresa: proveedorFormData.empresa,
              telefono: proveedorFormData.telefono,
              email: proveedorFormData.email,
              metodosPago: proveedorFormData.metodosPago,
              banco: proveedorFormData.banco,
              numeroCuenta: proveedorFormData.numeroCuenta,
              beneficiario: proveedorFormData.beneficiario,
              tipoCuenta: proveedorFormData.tipoCuenta,
              documentos: proveedorFormData.documentos,
              nota: proveedorFormData.nota,
            }
          : p
      );
      saveProveedores(updated);
      
      const excursionesSinViejas = excursiones.filter(e => e.proveedorId !== editingProveedorId);
      
      const nuevasExcursiones = tempExcursiones.map((e, index) => ({
        id: Date.now().toString() + index,
        ...e,
        proveedorId: editingProveedorId,
        proveedorNombre: proveedorFormData.nombre,
      }));
      
      saveExcursiones([...excursionesSinViejas, ...nuevasExcursiones]);
      alert("Proveedor y excursiones actualizados correctamente");
    } else {
      const nuevoProveedor: Proveedor = {
        id: proveedorId,
        ...proveedorFormData,
      };
      saveProveedores([...proveedores, nuevoProveedor]);
      
      const nuevasExcursiones = tempExcursiones.map((e, index) => ({
        id: Date.now().toString() + index,
        ...e,
        proveedorId: proveedorId,
        proveedorNombre: proveedorFormData.nombre,
      }));
      
      if (nuevasExcursiones.length > 0) {
        saveExcursiones([...excursiones, ...nuevasExcursiones]);
      }
      
      alert("Proveedor y excursiones agregados correctamente");
    }
    
    setShowProveedorForm(false);
    setEditingProveedorId(null);
    setProveedorFormData({
      nombre: "",
      empresa: "",
      telefono: "",
      email: "",
      metodosPago: [],
      banco: "",
      numeroCuenta: "",
      beneficiario: "",
      tipoCuenta: "corriente",
      documentos: "",
      nota: "",
    });
    setTempExcursiones([]);
    setTempExcursionForm({
      nombre: "",
      precioAdultoUSD: "",
      precioNinoUSD: "",
      costoProveedorAdultoUSD: "",
      costoProveedorNinoUSD: "",
      comisionAdultoUSD: "",
      comisionNinoUSD: "",
      zona: "",
      capacidad: "",
      tienePrecioNino: false,
    });
  };

  const editProveedor = (proveedor: Proveedor) => {
    setEditingProveedorId(proveedor.id);
    setProveedorFormData({
      nombre: proveedor.nombre,
      empresa: proveedor.empresa || "",
      telefono: proveedor.telefono,
      email: proveedor.email,
      metodosPago: proveedor.metodosPago,
      banco: proveedor.banco,
      numeroCuenta: proveedor.numeroCuenta,
      beneficiario: proveedor.beneficiario,
      tipoCuenta: proveedor.tipoCuenta,
      documentos: proveedor.documentos,
      nota: proveedor.nota,
    });
    
    const excursionesDelProveedor = excursiones.filter(e => e.proveedorId === proveedor.id);
    setTempExcursiones(excursionesDelProveedor.map(e => ({
      nombre: e.nombre,
      precioAdultoUSD: e.precioAdultoUSD,
      precioNinoUSD: e.precioNinoUSD,
      costoProveedorAdultoUSD: e.costoProveedorAdultoUSD,
      costoProveedorNinoUSD: e.costoProveedorNinoUSD,
      comisionAdultoUSD: e.comisionAdultoUSD,
      comisionNinoUSD: e.comisionNinoUSD,
      zona: e.zona || "",
      capacidad: e.capacidad || "",
    })));
    
    setShowProveedorForm(true);
  };

  const deleteProveedor = (id: string) => {
    if (!confirm("Eliminar este proveedor y todas sus excursiones?")) return;
    const updated = proveedores.filter(p => p.id !== id);
    saveProveedores(updated);
    const excursionesActualizadas = excursiones.filter(e => e.proveedorId !== id);
    saveExcursiones(excursionesActualizadas);
  };

  // ============================================
  // MANEJAR METODOS DE PAGO DEL PROVEEDOR
  // ============================================
  const toggleMetodoPago = (metodo: "efectivo" | "transferencia" | "paypal") => {
    setProveedorFormData(prev => {
      const metodos = prev.metodosPago;
      if (metodos.includes(metodo)) {
        return { ...prev, metodosPago: metodos.filter(m => m !== metodo) };
      } else {
        return { ...prev, metodosPago: [...metodos, metodo] };
      }
    });
  };

  // ============================================
  // MANEJAR EXCURSIONES TEMPORALES
  // ============================================
  const agregarTempExcursion = () => {
    if (!tempExcursionForm.nombre) {
      alert("Debes escribir el nombre de la excursion");
      return;
    }
    
    const precioAdultoUSD = parseFloat(tempExcursionForm.precioAdultoUSD) || 0;
    const costoProveedorAdultoUSD = parseFloat(tempExcursionForm.costoProveedorAdultoUSD) || 0;
    const comisionAdultoUSD = calcularComision(precioAdultoUSD, costoProveedorAdultoUSD);
    
    let precioNinoUSD: number | null = null;
    let costoProveedorNinoUSD: number | null = null;
    let comisionNinoUSD: number | null = null;
    
    if (tempExcursionForm.tienePrecioNino) {
      precioNinoUSD = parseFloat(tempExcursionForm.precioNinoUSD) || 0;
      costoProveedorNinoUSD = parseFloat(tempExcursionForm.costoProveedorNinoUSD) || 0;
      comisionNinoUSD = calcularComision(precioNinoUSD, costoProveedorNinoUSD);
    }
    
    setTempExcursiones([
      ...tempExcursiones,
      {
        nombre: tempExcursionForm.nombre,
        precioAdultoUSD,
        precioNinoUSD,
        costoProveedorAdultoUSD,
        costoProveedorNinoUSD,
        comisionAdultoUSD,
        comisionNinoUSD,
        zona: tempExcursionForm.zona || undefined,
        capacidad: tempExcursionForm.capacidad || undefined,
      }
    ]);
    
    setTempExcursionForm({
      nombre: "",
      precioAdultoUSD: "",
      precioNinoUSD: "",
      costoProveedorAdultoUSD: "",
      costoProveedorNinoUSD: "",
      comisionAdultoUSD: "",
      comisionNinoUSD: "",
      zona: "",
      capacidad: "",
      tienePrecioNino: false,
    });
  };

  const eliminarTempExcursion = (index: number) => {
    setTempExcursiones(tempExcursiones.filter((_, i) => i !== index));
  };

  // ============================================
  // HANDLE EXCURSION
  // ============================================
  const handleExcursionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const precioAdultoUSD = parseFloat(excursionFormData.precioAdultoUSD) || 0;
    const costoProveedorAdultoUSD = parseFloat(excursionFormData.costoProveedorAdultoUSD) || 0;
    const comisionAdultoUSD = calcularComision(precioAdultoUSD, costoProveedorAdultoUSD);
    
    let precioNinoUSD: number | null = null;
    let costoProveedorNinoUSD: number | null = null;
    let comisionNinoUSD: number | null = null;
    
    if (excursionFormData.tienePrecioNino) {
      precioNinoUSD = parseFloat(excursionFormData.precioNinoUSD) || 0;
      costoProveedorNinoUSD = parseFloat(excursionFormData.costoProveedorNinoUSD) || 0;
      comisionNinoUSD = calcularComision(precioNinoUSD, costoProveedorNinoUSD);
    }
    
    const proveedor = proveedores.find(p => p.id === excursionFormData.proveedorId);
    
    if (editingExcursionId) {
      const updated = excursiones.map(e => 
        e.id === editingExcursionId 
          ? { 
              ...e, 
              nombre: excursionFormData.nombre,
              proveedorId: excursionFormData.proveedorId,
              proveedorNombre: proveedor?.nombre || "",
              precioAdultoUSD,
              precioNinoUSD,
              costoProveedorAdultoUSD,
              costoProveedorNinoUSD,
              comisionAdultoUSD,
              comisionNinoUSD,
              zona: excursionFormData.zona || undefined,
              capacidad: excursionFormData.capacidad || undefined,
            }
          : e
      );
      saveExcursiones(updated);
      alert("Excursion actualizada correctamente");
    } else {
      const nuevaExcursion: Excursion = {
        id: Date.now().toString(),
        nombre: excursionFormData.nombre,
        proveedorId: excursionFormData.proveedorId,
        proveedorNombre: proveedor?.nombre || "",
        precioAdultoUSD,
        precioNinoUSD,
        costoProveedorAdultoUSD,
        costoProveedorNinoUSD,
        comisionAdultoUSD,
        comisionNinoUSD,
        zona: excursionFormData.zona || undefined,
        capacidad: excursionFormData.capacidad || undefined,
      };
      saveExcursiones([...excursiones, nuevaExcursion]);
      alert("Excursion agregada correctamente");
    }
    
    setShowExcursionForm(false);
    setEditingExcursionId(null);
    setExcursionFormData({
      nombre: "",
      proveedorId: "",
      proveedorNombre: "",
      precioAdultoUSD: "",
      precioNinoUSD: "",
      costoProveedorAdultoUSD: "",
      costoProveedorNinoUSD: "",
      comisionAdultoUSD: "",
      comisionNinoUSD: "",
      zona: "",
      capacidad: "",
      tienePrecioNino: false,
    });
  };

  const editExcursion = (excursion: Excursion) => {
    setEditingExcursionId(excursion.id);
    setExcursionFormData({
      nombre: excursion.nombre,
      proveedorId: excursion.proveedorId,
      proveedorNombre: excursion.proveedorNombre,
      precioAdultoUSD: excursion.precioAdultoUSD.toString(),
      precioNinoUSD: excursion.precioNinoUSD?.toString() || "",
      costoProveedorAdultoUSD: excursion.costoProveedorAdultoUSD.toString(),
      costoProveedorNinoUSD: excursion.costoProveedorNinoUSD?.toString() || "",
      comisionAdultoUSD: excursion.comisionAdultoUSD.toString(),
      comisionNinoUSD: excursion.comisionNinoUSD?.toString() || "",
      zona: excursion.zona || "",
      capacidad: excursion.capacidad || "",
      tienePrecioNino: excursion.precioNinoUSD !== null,
    });
    setShowExcursionForm(true);
  };

  const deleteExcursion = (id: string) => {
    if (!confirm("Eliminar esta excursion?")) return;
    const updated = excursiones.filter(e => e.id !== id);
    saveExcursiones(updated);
  };

  // ============================================
  // HANDLE CLIENTE
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
      excursionId: excursionId || "",
      excursionNombre: excursion?.nombre || "Sin excursión asignada",
      fechaExcursion: data.get("fechaExcursion") as string || "",
    };
    
    saveClientes([...clientes, nuevoCliente]);
    setShowClienteForm(false);
    alert("Cliente agregado correctamente");
  };

  const deleteCliente = (id: string) => {
    if (!confirm("Eliminar este cliente?")) return;
    const updated = clientes.filter(c => c.id !== id);
    saveClientes(updated);
  };

  // ============================================
  // HANDLE VENTA
  // ============================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { precioTotal, costoTotal, comisionTotal } = calcularTotalesVenta();
    const montoPagadoUSD = parseFloat(formData.montoPagadoUSD) || 0;
    
    let saldoPendienteUSD = 0;
    if (formData.pagoCliente === "completo") {
      saldoPendienteUSD = 0;
    } else if (formData.pagoCliente === "deposito_25") {
      saldoPendienteUSD = precioTotal * 0.75;
    } else if (formData.pagoCliente === "pago_dia") {
      saldoPendienteUSD = precioTotal;
    }

    const nuevaVenta: Venta = {
      id: editingVentaId || Date.now().toString(),
      clienteNombre: formData.clienteNombre,
      clienteWhatsapp: formData.clienteWhatsapp,
      clienteEmail: formData.clienteEmail,
      excursionId: formData.excursionId,
      excursionNombre: formData.excursionNombre,
      fechaExcursion: formData.fechaExcursion,
      horaExcursion: formData.horaExcursion,
      precioVentaUSD: precioTotal,
      costoProveedorUSD: costoTotal,
      comisionUSD: comisionTotal,
      pagoCliente: formData.pagoCliente,
      montoPagadoUSD: montoPagadoUSD,
      saldoPendienteUSD: saldoPendienteUSD,
      metodoPagoCliente: formData.metodoPagoCliente,
      proveedorId: formData.proveedorId,
      proveedorNombre: formData.proveedorNombre,
      proveedorPagado: formData.proveedorPagado,
      metodoPagoProveedor: formData.metodoPagoProveedor,
      cantidadAdultos: formData.cantidadAdultos,
      cantidadNinos: formData.cantidadNinos,
      tipoServicio: formData.tipoServicio,
      nombreGrupo: formData.tipoServicio === "grupo" ? formData.nombreGrupo : undefined,
      tipoRecogida: formData.tipoRecogida,
      transporte: formData.transporte,
      precioAdultoPersonalizado: parseFloat(formData.precioAdultoUSD) || 0,
      precioNinoPersonalizado: parseFloat(formData.precioNinoUSD) || 0,
      costoAdultoPersonalizado: parseFloat(formData.costoProveedorAdultoUSD) || 0,
      costoNinoPersonalizado: parseFloat(formData.costoProveedorNinoUSD) || 0,
      estado: formData.estado,
      nota: formData.nota,
    };

    if (editingVentaId) {
      const updated = ventas.map(v => v.id === editingVentaId ? nuevaVenta : v);
      saveVentas(updated);
    } else {
      saveVentas([...ventas, nuevaVenta]);
    }

    resetForm();
    alert("Venta registrada correctamente");
  };

  const resetForm = () => {
    setFormData({
      clienteNombre: "",
      clienteWhatsapp: "",
      clienteEmail: "",
      excursionId: "",
      excursionNombre: "",
      fechaExcursion: "",
      horaExcursion: "02:00 PM",
      precioAdultoUSD: "",
      precioNinoUSD: "",
      costoProveedorAdultoUSD: "",
      costoProveedorNinoUSD: "",
      comisionAdultoUSD: "",
      comisionNinoUSD: "",
      cantidadAdultos: 1,
      cantidadNinos: 0,
      precioTotalUSD: "",
      costoTotalUSD: "",
      comisionTotalUSD: "",
      pagoCliente: "completo",
      montoPagadoUSD: "",
      saldoPendienteUSD: "",
      metodoPagoCliente: "efectivo",
      proveedorId: "",
      proveedorNombre: "",
      proveedorPagado: "pendiente",
      metodoPagoProveedor: "efectivo",
      tipoServicio: "compartido",
      nombreGrupo: "",
      tipoRecogida: "sin_recogida",
      transporte: "no",
      estado: "pendiente",
      nota: "",
    });
    setShowForm(false);
    setEditingVentaId(null);
    setSelectedExcursionForVenta(null);
  };

  // ============================================
  // SELECCIONAR EXCURSION PARA VENTA
  // ============================================
  const selectExcursionForVenta = (excursionId: string) => {
    const excursion = excursiones.find(e => e.id === excursionId);
    if (excursion) {
      setSelectedExcursionForVenta(excursion);
      
      const precioAdulto = excursion.precioAdultoUSD;
      const precioNino = excursion.precioNinoUSD || 0;
      const costoAdulto = excursion.costoProveedorAdultoUSD;
      const costoNino = excursion.costoProveedorNinoUSD || 0;
      const comisionAdulto = excursion.comisionAdultoUSD;
      const comisionNino = excursion.comisionNinoUSD || 0;
      
      setFormData({
        ...formData,
        excursionId: excursion.id,
        excursionNombre: excursion.nombre,
        precioAdultoUSD: precioAdulto.toString(),
        precioNinoUSD: precioNino.toString(),
        costoProveedorAdultoUSD: costoAdulto.toString(),
        costoProveedorNinoUSD: costoNino.toString(),
        comisionAdultoUSD: comisionAdulto.toString(),
        comisionNinoUSD: comisionNino.toString(),
        proveedorId: excursion.proveedorId,
        proveedorNombre: excursion.proveedorNombre,
      });
      
      setTimeout(updateCantidades, 50);
    }
  };

  // ============================================
  // ACTUALIZAR CANTIDADES Y TOTALES
  // ============================================
  const updateCantidades = () => {
    const { precioTotal, costoTotal, comisionTotal } = calcularTotalesVenta();
    setFormData(prev => ({
      ...prev,
      precioTotalUSD: precioTotal.toFixed(2),
      costoTotalUSD: costoTotal.toFixed(2),
      comisionTotalUSD: comisionTotal.toFixed(2),
    }));
  };

  // ============================================
  // HANDLE CAMBIOS EN PRECIOS
  // ============================================
  const handlePrecioAdultoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, precioAdultoUSD: val }));
    setTimeout(updateCantidades, 10);
  };

  const handlePrecioNinoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, precioNinoUSD: val }));
    setTimeout(updateCantidades, 10);
  };

  const handleCostoAdultoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, costoProveedorAdultoUSD: val }));
    setTimeout(updateCantidades, 10);
  };

  const handleCostoNinoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, costoProveedorNinoUSD: val }));
    setTimeout(updateCantidades, 10);
  };

  const handleCantidadAdultosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setFormData(prev => ({ ...prev, cantidadAdultos: val }));
    setTimeout(updateCantidades, 10);
  };

  const handleCantidadNinosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setFormData(prev => ({ ...prev, cantidadNinos: val }));
    setTimeout(updateCantidades, 10);
  };

  // ============================================
  // HANDLE VENTA EDIT
  // ============================================
  const editVenta = (venta: Venta) => {
    setEditingVentaId(venta.id);
    const excursion = excursiones.find(e => e.id === venta.excursionId);
    
    setFormData({
      clienteNombre: venta.clienteNombre,
      clienteWhatsapp: venta.clienteWhatsapp,
      clienteEmail: venta.clienteEmail,
      excursionId: venta.excursionId,
      excursionNombre: venta.excursionNombre,
      fechaExcursion: venta.fechaExcursion,
      horaExcursion: venta.horaExcursion || "02:00 PM",
      precioAdultoUSD: venta.precioAdultoPersonalizado?.toString() || excursion?.precioAdultoUSD?.toString() || "0",
      precioNinoUSD: venta.precioNinoPersonalizado?.toString() || excursion?.precioNinoUSD?.toString() || "0",
      costoProveedorAdultoUSD: venta.costoAdultoPersonalizado?.toString() || excursion?.costoProveedorAdultoUSD?.toString() || "0",
      costoProveedorNinoUSD: venta.costoNinoPersonalizado?.toString() || excursion?.costoProveedorNinoUSD?.toString() || "0",
      comisionAdultoUSD: excursion?.comisionAdultoUSD?.toString() || "0",
      comisionNinoUSD: excursion?.comisionNinoUSD?.toString() || "0",
      cantidadAdultos: venta.cantidadAdultos,
      cantidadNinos: venta.cantidadNinos,
      precioTotalUSD: venta.precioVentaUSD.toFixed(2),
      costoTotalUSD: venta.costoProveedorUSD.toFixed(2),
      comisionTotalUSD: venta.comisionUSD.toFixed(2),
      pagoCliente: venta.pagoCliente,
      montoPagadoUSD: venta.montoPagadoUSD.toString(),
      saldoPendienteUSD: venta.saldoPendienteUSD.toString(),
      metodoPagoCliente: venta.metodoPagoCliente,
      proveedorId: venta.proveedorId,
      proveedorNombre: venta.proveedorNombre,
      proveedorPagado: venta.proveedorPagado,
      metodoPagoProveedor: venta.metodoPagoProveedor,
      tipoServicio: venta.tipoServicio,
      nombreGrupo: venta.nombreGrupo || "",
      tipoRecogida: venta.tipoRecogida,
      transporte: venta.transporte,
      estado: venta.estado || "pendiente",
      nota: venta.nota,
    });
    setShowForm(true);
  };

  const deleteVenta = (id: string) => {
    if (!confirm("Eliminar esta venta?")) return;
    const updated = ventas.filter(v => v.id !== id);
    saveVentas(updated);
  };

  // ============================================
  // FUNCIONES DEL CALENDARIO
  // ============================================
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }
    
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }
    
    return days;
  };

  const getVentasDelDia = (date: Date) => {
    return ventas.filter(v => {
      const vDate = new Date(v.fechaExcursion);
      return vDate.getDate() === date.getDate() &&
             vDate.getMonth() === date.getMonth() &&
             vDate.getFullYear() === date.getFullYear();
    });
  };

  const cambiarMes = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const getMonthName = (month: number) => {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return months[month];
  };

  const getDayName = (day: number) => {
    const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    return days[day];
  };

  // ============================================
  // FILTROS Y AGRUPACIONES
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
      acc[key] = { year, month, totalUSD: 0, totalComision: 0, totalCosto: 0, ventas: [] };
    }
    acc[key].totalUSD += venta.precioVentaUSD;
    acc[key].totalComision += venta.comisionUSD;
    acc[key].totalCosto += venta.costoProveedorUSD;
    acc[key].ventas.push(venta);
    return acc;
  }, {});

  let groupedArray = Object.entries(grouped)
    .map(([key, value]: [string, any]) => ({ ...value, key }))
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

  const totalVentasUSD = filtered.reduce((sum, v) => sum + v.precioVentaUSD, 0);
  const totalComision = filtered.reduce((sum, v) => sum + v.comisionUSD, 0);
  const totalCosto = filtered.reduce((sum, v) => sum + v.costoProveedorUSD, 0);
  const totalPendienteUSD = filtered.reduce((sum, v) => sum + v.saldoPendienteUSD, 0);
  
  const years = [...new Set(ventas.map(v => new Date(v.fechaExcursion).getFullYear().toString()))].sort().reverse();

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const toggleMonth = (key: string) => {
    setExpandedMonth(expandedMonth === key ? null : key);
  };

  const getPagoClienteText = (tipo: string) => {
    const map: any = {
      completo: "Pago completo (USD)",
      deposito_25: "Deposito 25% (USD)",
      pago_dia: "Pago el dia (USD)"
    };
    return map[tipo] || tipo;
  };

  const getTipoRecogidaText = (tipo: string) => {
    const map: any = {
      hotel: "Hotel",
      airbnb: "Airbnb",
      sin_recogida: "Sin recogida"
    };
    return map[tipo] || tipo;
  };

  const getTransporteText = (valor: string) => {
    return valor === "si" ? "Si" : "No";
  };

  const getEstadoText = (estado: string) => {
    const map: any = {
      pendiente: "Pendiente",
      confirmada: "Confirmada",
      cancelada: "Cancelada",
      completada: "Completada"
    };
    return map[estado] || estado;
  };

  const getEstadoColor = (estado: string) => {
    const map: any = {
      pendiente: "bg-yellow-500/20 text-yellow-400",
      confirmada: "bg-blue-500/20 text-blue-400",
      cancelada: "bg-red-500/20 text-red-400",
      completada: "bg-green-500/20 text-green-400"
    };
    return map[estado] || "bg-gray-500/20 text-gray-400";
  };

  const exportCSV = () => {
    if (ventas.length === 0) { alert("No hay datos"); return; }
    let csv = "Fecha,Hora,Cliente,Excursion,Adultos,Ninos,Servicio,Grupo,Recogida,Transporte,Estado,Precio Venta (USD),Costo Proveedor (USD),Comision (USD),Pago Cliente,Saldo Pendiente (USD),Metodo Pago,Proveedor,Pago Proveedor,Nota\n";
    ventas.forEach(v => {
      csv += `"${v.fechaExcursion}","${v.horaExcursion}","${v.clienteNombre}","${v.excursionNombre}",${v.cantidadAdultos},${v.cantidadNinos},"${v.tipoServicio}","${v.nombreGrupo || ""}","${getTipoRecogidaText(v.tipoRecogida)}","${getTransporteText(v.transporte)}","${getEstadoText(v.estado)}",${v.precioVentaUSD},${v.costoProveedorUSD},${v.comisionUSD},"${getPagoClienteText(v.pagoCliente)}",${v.saldoPendienteUSD},"${v.metodoPagoCliente}","${v.proveedorNombre}","${v.proveedorPagado}","${v.nota || ""}"\n`;
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
  // COMPONENTE DE LOGIN MEJORADO
  // ============================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-amber-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl hover:shadow-amber-500/10 transition-all duration-500">
          {/* Reloj y Fecha */}
          <div className="text-center mb-6 pb-6 border-b border-white/10">
            <div className="text-4xl font-bold text-white font-mono tracking-wider">
              {currentTime.toLocaleTimeString("es-DO", { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </div>
            <div className="text-sm text-white/50 mt-1">
              {currentTime.toLocaleDateString("es-DO", { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25 animate-pulse">
              <span className="text-3xl text-slate-900 font-bold">RE</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-4 tracking-tight">Republic Excursions</h1>
            <p className="text-white/40 text-sm mt-1">Sistema de Gestión de Excursiones</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const username = formData.get("username") as string;
            const password = formData.get("password") as string;
            handleLogin(username, password);
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Usuario</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">👤</span>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 transition-all"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔒</span>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 transition-all"
                  placeholder="Ingresa tu contraseña"
                />
              </div>
            </div>
            {loginError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center animate-shake">
                ❌ {loginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all shadow-lg shadow-amber-500/25"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-xs text-white/30">
                <span className="text-amber-400/50">👤</span> Usuarios: <span className="text-white/50 font-medium">Raul</span> <span className="text-white/30">|</span> <span className="text-white/50 font-medium">Gabrielle</span>
              </p>
              <p className="text-xs text-white/30 mt-1">
                <span className="text-amber-400/50">🔑</span> Contraseña: <span className="text-white/50 font-mono">Republ1c$$</span>
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[10px] text-white/20">v2.4.0 • Republic Excursions © 2026</p>
          </div>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  const isRaul = currentUser === "raul";
  const bgGradient = isRaul 
    ? "from-slate-900 via-slate-800 to-slate-900"
    : "from-purple-900 via-pink-800 to-rose-900";
  const accentColor = isRaul ? "amber" : "pink";
  const headerBg = isRaul ? "bg-white/5" : "bg-white/10";
  const cardBg = isRaul ? "bg-white/5" : "bg-white/10";
  const buttonGradient = isRaul 
    ? "from-amber-500 to-amber-600"
    : "from-pink-500 to-purple-500";

  // ============================================
  // RENDER DE VISTAS
  // ============================================
  const renderView = () => {
    switch(viewMode) {
      case "dashboard":
        return (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Dashboard</h2>
                <p className="text-white/40 text-sm">Resumen de tus ventas y comisiones</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/10">
                <div className="text-2xl font-bold text-amber-400 font-mono">
                  {currentTime.toLocaleTimeString("es-DO", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-xs text-white/40 text-center">
                  {currentTime.toLocaleDateString("es-DO", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all`}>
                <p className="text-sm text-white/60">Total Ventas (USD)</p>
                <p className={`text-2xl font-bold ${isRaul ? 'text-amber-400' : 'text-pink-300'}`}>{formatUSD(totalVentasUSD)}</p>
                <p className="text-xs text-white/40">{ventas.length} ventas</p>
              </div>
              <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all`}>
                <p className="text-sm text-white/60">Total Comision (USD)</p>
                <p className="text-2xl font-bold text-green-400">{formatUSD(totalComision)}</p>
                <p className="text-xs text-white/40">Tu ganancia</p>
              </div>
              <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all`}>
                <p className="text-sm text-white/60">Total Costo (USD)</p>
                <p className={`text-2xl font-bold ${isRaul ? 'text-red-400' : 'text-rose-300'}`}>{formatUSD(totalCosto)}</p>
                <p className="text-xs text-white/40">Pago a proveedores</p>
              </div>
              <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all`}>
                <p className="text-sm text-white/60">Por Cobrar (USD)</p>
                <p className="text-2xl font-bold text-orange-400">{formatUSD(totalPendienteUSD)}</p>
                <p className="text-xs text-white/40">Saldo de clientes</p>
              </div>
            </div>

            <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Proximas Reservas</h3>
                <button 
                  onClick={() => setViewMode("reservas")}
                  className="text-sm text-amber-400 hover:text-amber-300 transition-all"
                >
                  Ver todas →
                </button>
              </div>
              {ventas.length === 0 ? (
                <p className="text-white/40 text-center py-4">No hay reservas programadas</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {ventas.slice(0, 5).map((v) => (
                    <div key={v.id} className="flex justify-between items-center py-2 border-b border-white/5">
                      <div>
                        <p className="text-white font-medium">{v.clienteNombre}</p>
                        <p className="text-xs text-white/40">{v.excursionNombre}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-amber-400">
                          {new Date(v.fechaExcursion).toLocaleDateString("es-DO")}
                        </p>
                        <p className="text-xs text-white/40">{v.horaExcursion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
              <h2 className="text-lg font-bold text-white mb-4">Ultimas ventas</h2>
              {ventas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/40">No hay ventas registradas</p>
                  <button onClick={() => {
                    setEditingVentaId(null);
                    setSelectedExcursionForVenta(null);
                    setFormData({
                      clienteNombre: "",
                      clienteWhatsapp: "",
                      clienteEmail: "",
                      excursionId: "",
                      excursionNombre: "",
                      fechaExcursion: "",
                      horaExcursion: "02:00 PM",
                      precioAdultoUSD: "",
                      precioNinoUSD: "",
                      costoProveedorAdultoUSD: "",
                      costoProveedorNinoUSD: "",
                      comisionAdultoUSD: "",
                      comisionNinoUSD: "",
                      cantidadAdultos: 1,
                      cantidadNinos: 0,
                      precioTotalUSD: "",
                      costoTotalUSD: "",
                      comisionTotalUSD: "",
                      pagoCliente: "completo",
                      montoPagadoUSD: "",
                      saldoPendienteUSD: "",
                      metodoPagoCliente: "efectivo",
                      proveedorId: "",
                      proveedorNombre: "",
                      proveedorPagado: "pendiente",
                      metodoPagoProveedor: "efectivo",
                      tipoServicio: "compartido",
                      nombreGrupo: "",
                      tipoRecogida: "sin_recogida",
                      transporte: "no",
                      estado: "pendiente",
                      nota: "",
                    });
                    setShowForm(true);
                  }} className={`mt-4 bg-gradient-to-r ${buttonGradient} text-slate-900 px-6 py-3 rounded-xl hover:shadow-xl transition-all font-medium`}>Registrar primera venta</button>
                </div>
              ) : (
                ventas.slice(0, 5).map((v) => (
                  <div key={v.id} className="flex flex-wrap items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="font-medium text-white">{v.clienteNombre}</p>
                      <p className="text-sm text-white/40">{v.excursionNombre} - {v.cantidadAdultos + v.cantidadNinos} personas - {new Date(v.fechaExcursion).toLocaleDateString("es-DO")} {v.horaExcursion}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(v.estado)}`}>
                        {getEstadoText(v.estado)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${v.tipoServicio === 'compartido' ? 'bg-purple-500/20 text-purple-400' : v.tipoServicio === 'privado' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                        {v.tipoServicio === 'compartido' ? 'Compartido' : v.tipoServicio === 'privado' ? 'Privado' : 'Grupo'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${v.pagoCliente === 'completo' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {getPagoClienteText(v.pagoCliente)}
                      </span>
                      <span className={`text-sm font-bold ${isRaul ? 'text-amber-400' : 'text-pink-300'}`}>{formatUSD(v.precioVentaUSD)}</span>
                      <span className="text-xs text-green-400">+{formatUSD(v.comisionUSD)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        );

      case "reservas":
        const reservasFiltradas = filtroEstadoReserva === "todas" 
          ? ventas 
          : ventas.filter(v => v.estado === filtroEstadoReserva);
        
        return (
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Gestion de Reservas</h2>
              <div className="flex items-center gap-3">
                <select 
                  value={filtroEstadoReserva}
                  onChange={(e) => setFiltroEstadoReserva(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white text-sm"
                >
                  <option value="todas" className="text-slate-900">Todas</option>
                  <option value="pendiente" className="text-slate-900">Pendientes</option>
                  <option value="confirmada" className="text-slate-900">Confirmadas</option>
                  <option value="completada" className="text-slate-900">Completadas</option>
                  <option value="cancelada" className="text-slate-900">Canceladas</option>
                </select>
                <button 
                  onClick={() => setViewMode("calendario")}
                  className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all text-sm font-medium`}
                >
                  Ver Calendario
                </button>
              </div>
            </div>
            
            {reservasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/40">No hay reservas {filtroEstadoReserva !== "todas" ? `con estado "${getEstadoText(filtroEstadoReserva)}"` : "registradas"}</p>
                <button onClick={() => {
                  setEditingVentaId(null);
                  setSelectedExcursionForVenta(null);
                  setFormData({
                    clienteNombre: "",
                    clienteWhatsapp: "",
                    clienteEmail: "",
                    excursionId: "",
                    excursionNombre: "",
                    fechaExcursion: "",
                    horaExcursion: "02:00 PM",
                    precioAdultoUSD: "",
                    precioNinoUSD: "",
                    costoProveedorAdultoUSD: "",
                    costoProveedorNinoUSD: "",
                    comisionAdultoUSD: "",
                    comisionNinoUSD: "",
                    cantidadAdultos: 1,
                    cantidadNinos: 0,
                    precioTotalUSD: "",
                    costoTotalUSD: "",
                    comisionTotalUSD: "",
                    pagoCliente: "completo",
                    montoPagadoUSD: "",
                    saldoPendienteUSD: "",
                    metodoPagoCliente: "efectivo",
                    proveedorId: "",
                    proveedorNombre: "",
                    proveedorPagado: "pendiente",
                    metodoPagoProveedor: "efectivo",
                    tipoServicio: "compartido",
                    nombreGrupo: "",
                    tipoRecogida: "sin_recogida",
                    transporte: "no",
                    estado: "pendiente",
                    nota: "",
                  });
                  setShowForm(true);
                }} className={`mt-4 bg-gradient-to-r ${buttonGradient} text-slate-900 px-6 py-3 rounded-xl hover:shadow-xl transition-all font-medium`}>Crear nueva reserva</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Hora</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Excursion</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Personas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservasFiltradas.sort((a, b) => new Date(a.fechaExcursion).getTime() - new Date(b.fechaExcursion).getTime()).map((v) => (
                      <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 text-sm text-white/60">{new Date(v.fechaExcursion).toLocaleDateString("es-DO")}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{v.horaExcursion}</td>
                        <td className="px-4 py-3 text-sm font-medium text-white">{v.clienteNombre}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{v.excursionNombre}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{v.cantidadAdultos + v.cantidadNinos}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(v.estado)}`}>
                            {getEstadoText(v.estado)}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm font-bold ${isRaul ? 'text-amber-400' : 'text-pink-300'}`}>{formatUSD(v.precioVentaUSD)}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <button onClick={() => editVenta(v)} className={`${isRaul ? 'text-amber-400 hover:text-amber-300' : 'text-pink-300 hover:text-pink-200'}`}>Editar</button>
                            <button onClick={() => deleteVenta(v.id)} className={`${isRaul ? 'text-red-400 hover:text-red-300' : 'text-rose-300 hover:text-rose-200'}`}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "ventas":
        return (
          <>
            <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/10`}>
              <div className="flex flex-wrap items-center gap-3">
                <input type="text" placeholder="Buscar..." className="flex-1 min-w-[200px] px-4 py-2 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white text-sm" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                  <option value="" className="text-slate-900">Todos los anos</option>
                  {years.map(y => <option key={y} value={y} className="text-slate-900">{y}</option>)}
                </select>
                <button onClick={exportCSV} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium`}>Exportar CSV</button>
              </div>
            </div>

            {groupedArray.length === 0 ? (
              <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-16 text-center border-2 border-dashed border-white/10`}>
                <p className="text-white/40 text-xl mb-4">No hay ventas registradas</p>
                <button onClick={() => {
                  setEditingVentaId(null);
                  setSelectedExcursionForVenta(null);
                  setFormData({
                    clienteNombre: "",
                    clienteWhatsapp: "",
                    clienteEmail: "",
                    excursionId: "",
                    excursionNombre: "",
                    fechaExcursion: "",
                    horaExcursion: "02:00 PM",
                    precioAdultoUSD: "",
                    precioNinoUSD: "",
                    costoProveedorAdultoUSD: "",
                    costoProveedorNinoUSD: "",
                    comisionAdultoUSD: "",
                    comisionNinoUSD: "",
                    cantidadAdultos: 1,
                    cantidadNinos: 0,
                    precioTotalUSD: "",
                    costoTotalUSD: "",
                    comisionTotalUSD: "",
                    pagoCliente: "completo",
                    montoPagadoUSD: "",
                    saldoPendienteUSD: "",
                    metodoPagoCliente: "efectivo",
                    proveedorId: "",
                    proveedorNombre: "",
                    proveedorPagado: "pendiente",
                    metodoPagoProveedor: "efectivo",
                    tipoServicio: "compartido",
                    nombreGrupo: "",
                    tipoRecogida: "sin_recogida",
                    transporte: "no",
                    estado: "pendiente",
                    nota: "",
                  });
                  setShowForm(true);
                }} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-6 py-3 rounded-xl hover:shadow-xl transition-all font-medium`}>Registrar primera venta</button>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedArray.map((group) => {
                  const isExpanded = expandedMonth === group.key;
                  return (
                    <div key={group.key} className={`${cardBg} backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden`}>
                      <button onClick={() => toggleMonth(group.key)} className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl text-white/40">📅</span>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-white">{getMonthName(group.month)} {group.year}</h3>
                            <p className="text-sm text-white/40">{group.ventas.length} ventas</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-bold ${isRaul ? 'text-amber-400' : 'text-pink-300'}`}>{formatUSD(group.totalUSD)}</span>
                          <span className="text-sm text-green-400">+{formatUSD(group.totalComision)}</span>
                          <span className={`text-sm ${isRaul ? 'text-red-400' : 'text-rose-300'}`}>-{formatUSD(group.totalCosto)}</span>
                          <span className="text-white/40 text-xl">{isExpanded ? "▼" : "▶"}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-white/10">
                          <div className="overflow-x-auto p-4">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Fecha</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Hora</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Cliente</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Excursion</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Adultos</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Ninos</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Estado</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Venta</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Comision</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {group.ventas.map((v: Venta) => (
                                  <tr key={v.id} className="hover:bg-white/5">
                                    <td className="px-4 py-3 text-sm text-white/60">{new Date(v.fechaExcursion).toLocaleDateString("es-DO")}</td>
                                    <td className="px-4 py-3 text-sm text-white/60">{v.horaExcursion}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-white">{v.clienteNombre}</td>
                                    <td className="px-4 py-3 text-sm text-white/60">{v.excursionNombre}</td>
                                    <td className="px-4 py-3 text-sm text-white/60">{v.cantidadAdultos}</td>
                                    <td className="px-4 py-3 text-sm text-white/60">{v.cantidadNinos}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(v.estado)}`}>
                                        {getEstadoText(v.estado)}
                                      </span>
                                    </td>
                                    <td className={`px-4 py-3 text-sm font-bold ${isRaul ? 'text-amber-400' : 'text-pink-300'}`}>{formatUSD(v.precioVentaUSD)}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-green-400">{formatUSD(v.comisionUSD)}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => editVenta(v)} className={`${isRaul ? 'text-amber-400 hover:text-amber-300' : 'text-pink-300 hover:text-pink-200'}`}>Editar</button>
                                        <button onClick={() => deleteVenta(v.id)} className={`${isRaul ? 'text-red-400 hover:text-red-300' : 'text-rose-300 hover:text-rose-200'}`}>Eliminar</button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-white/5">
                                <tr>
                                  <td colSpan={7} className="px-4 py-3 text-right font-medium text-white/60">Totales del mes:</td>
                                  <td className={`px-4 py-3 font-bold ${isRaul ? 'text-amber-400' : 'text-pink-300'}`}>{formatUSD(group.totalUSD)}</td>
                                  <td className="px-4 py-3 font-bold text-green-400">{formatUSD(group.totalComision)}</td>
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
        );

      case "clientes":
        return (
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Clientes</h2>
              <button onClick={() => setShowClienteForm(true)} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all text-sm font-medium`}>+ Agregar Cliente</button>
            </div>
            {clientes.length === 0 ? (
              <p className="text-center text-white/40 py-8">No hay clientes registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">WhatsApp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Excursion</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((c) => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 text-sm font-medium text-white">{c.nombre}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{c.whatsapp}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{c.email}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{c.excursionNombre}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{c.fechaExcursion ? new Date(c.fechaExcursion).toLocaleDateString("es-DO") : "-"}</td>
                        <td className="px-4 py-3 text-sm">
                          <button onClick={() => deleteCliente(c.id)} className={`${isRaul ? 'text-red-400 hover:text-red-300' : 'text-rose-300 hover:text-rose-200'}`}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "proveedores":
        return (
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Proveedores</h2>
              <button onClick={() => {
                setEditingProveedorId(null);
                setProveedorFormData({
                  nombre: "",
                  empresa: "",
                  telefono: "",
                  email: "",
                  metodosPago: [],
                  banco: "",
                  numeroCuenta: "",
                  beneficiario: "",
                  tipoCuenta: "corriente",
                  documentos: "",
                  nota: "",
                });
                setTempExcursiones([]);
                setTempExcursionForm({
                  nombre: "",
                  precioAdultoUSD: "",
                  precioNinoUSD: "",
                  costoProveedorAdultoUSD: "",
                  costoProveedorNinoUSD: "",
                  comisionAdultoUSD: "",
                  comisionNinoUSD: "",
                  zona: "",
                  capacidad: "",
                  tienePrecioNino: false,
                });
                setShowProveedorForm(true);
              }} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all text-sm font-medium`}>+ Agregar Proveedor</button>
            </div>
            {proveedores.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/40">No hay proveedores registrados</p>
                <p className="text-white/30 text-sm mt-2">Crea un proveedor para poder agregar excursiones</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Empresa</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Telefono</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Metodos Pago</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Excursiones</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map((p) => {
                      const excursionesDelProveedor = excursiones.filter(e => e.proveedorId === p.id);
                      return (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 text-sm font-medium text-white">{p.nombre}</td>
                          <td className="px-4 py-3 text-sm text-white/60">{p.empresa || "-"}</td>
                          <td className="px-4 py-3 text-sm text-white/60">{p.telefono}</td>
                          <td className="px-4 py-3 text-sm text-white/60">
                            {p.metodosPago.map(m => (
                              <span key={m} className="text-xs bg-white/10 px-2 py-1 rounded-full mr-1">
                                {m === 'efectivo' ? 'Efectivo' : m === 'transferencia' ? 'Transferencia' : 'PayPal'}
                              </span>
                            ))}
                          </td>
                          <td className="px-4 py-3 text-sm text-white/60">
                            <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                              {excursionesDelProveedor.length} excursiones
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <button onClick={() => editProveedor(p)} className={`${isRaul ? 'text-amber-400 hover:text-amber-300' : 'text-pink-300 hover:text-pink-200'}`}>Editar</button>
                              <button onClick={() => deleteProveedor(p.id)} className={`${isRaul ? 'text-red-400 hover:text-red-300' : 'text-rose-300 hover:text-rose-200'}`}>Eliminar</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "bancos":
        return (
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <h2 className="text-lg font-bold text-white mb-4">Datos Bancarios de Proveedores</h2>
            {proveedores.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/40">No hay proveedores registrados</p>
                <p className="text-white/30 text-sm mt-2">Agrega un proveedor para ver sus datos bancarios</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Proveedor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Empresa</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Banco</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Numero de Cuenta</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Beneficiario</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Documentos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 text-sm font-medium text-white">{p.nombre}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{p.empresa || "-"}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{p.banco || "-"}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{p.numeroCuenta || "-"}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{p.beneficiario || "-"}</td>
                        <td className="px-4 py-3 text-sm text-white/60">
                          {p.tipoCuenta === 'corriente' ? 'Corriente' : p.tipoCuenta === 'ahorros' ? 'Ahorros' : 'Nomina'}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/60">{p.documentos || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "calendario":
        const days = getDaysInMonth(currentDate);
        const today = new Date();
        
        return (
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Calendario de Reservas</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => cambiarMes(-1)}
                  className="px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white"
                >
                  ◀
                </button>
                <span className="text-white font-medium">
                  {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
                </span>
                <button 
                  onClick={() => cambiarMes(1)}
                  className="px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white"
                >
                  ▶
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-all text-sm"
                >
                  Hoy
                </button>
                <button 
                  onClick={() => setViewMode("reservas")}
                  className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-3 py-1 rounded-lg hover:shadow-xl transition-all text-sm font-medium`}
                >
                  Lista
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setCalendarioView("dia")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${calendarioView === "dia" ? `bg-gradient-to-r ${buttonGradient} text-slate-900` : "bg-white/10 text-white/70 hover:bg-white/20"}`}
              >
                Dia
              </button>
              <button 
                onClick={() => setCalendarioView("semana")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${calendarioView === "semana" ? `bg-gradient-to-r ${buttonGradient} text-slate-900` : "bg-white/10 text-white/70 hover:bg-white/20"}`}
              >
                Semana
              </button>
              <button 
                onClick={() => setCalendarioView("mes")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${calendarioView === "mes" ? `bg-gradient-to-r ${buttonGradient} text-slate-900` : "bg-white/10 text-white/70 hover:bg-white/20"}`}
              >
                Mes
              </button>
            </div>

            {calendarioView === "mes" && (
              <div className="grid grid-cols-7 gap-1">
                {["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-white/40 py-2">
                    {day}
                  </div>
                ))}
                {days.map((day, index) => {
                  const ventasDelDia = getVentasDelDia(day.date);
                  const isToday = day.date.getDate() === today.getDate() && 
                                  day.date.getMonth() === today.getMonth() && 
                                  day.date.getFullYear() === today.getFullYear();
                  const tieneVentas = ventasDelDia.length > 0;
                  
                  return (
                    <div 
                      key={index} 
                      className={`min-h-[80px] p-1 rounded-lg border ${day.isCurrentMonth ? 'border-white/10' : 'border-white/5'} ${isToday ? 'bg-amber-500/20 border-amber-500/30' : ''} ${tieneVentas ? 'bg-green-500/10' : ''}`}
                    >
                      <div className={`text-xs text-right ${day.isCurrentMonth ? 'text-white/80' : 'text-white/30'} ${isToday ? 'font-bold text-amber-400' : ''}`}>
                        {day.date.getDate()}
                      </div>
                      {ventasDelDia.slice(0, 3).map((v) => (
                        <div key={v.id} className="text-[8px] truncate text-white/60 px-1">
                          {v.horaExcursion} - {v.clienteNombre}
                        </div>
                      ))}
                      {ventasDelDia.length > 3 && (
                        <div className="text-[8px] text-white/40 px-1">
                          +{ventasDelDia.length - 3} mas
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {calendarioView === "dia" && (
              <div className="space-y-3">
                <p className="text-white/60 text-sm">
                  Reservas para el {currentDate.toLocaleDateString("es-DO", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {(() => {
                  const ventasDelDia = getVentasDelDia(currentDate);
                  if (ventasDelDia.length === 0) {
                    return <p className="text-white/40 text-center py-8">No hay reservas para este dia</p>;
                  }
                  return ventasDelDia.sort((a, b) => a.horaExcursion.localeCompare(b.horaExcursion)).map((v) => (
                    <div key={v.id} className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-amber-400">{v.horaExcursion}</span>
                            <p className="font-medium text-white">{v.clienteNombre}</p>
                          </div>
                          <p className="text-sm text-white/60">{v.excursionNombre}</p>
                          <p className="text-xs text-white/40">
                            {v.cantidadAdultos} Adultos, {v.cantidadNinos} Ninos • {v.tipoServicio === 'compartido' ? 'Compartido' : v.tipoServicio === 'privado' ? 'Privado' : 'Grupo'}
                            {v.nombreGrupo && ` • ${v.nombreGrupo}`}
                          </p>
                          <p className="text-xs text-white/40">
                            Recogida: {getTipoRecogidaText(v.tipoRecogida)} • Transporte: {getTransporteText(v.transporte)}
                          </p>
                          <p className="text-xs text-white/40">
                            Estado: <span className={`${getEstadoColor(v.estado)}`}>{getEstadoText(v.estado)}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-400">{formatUSD(v.precioVentaUSD)}</p>
                          <p className="text-xs text-green-400">+{formatUSD(v.comisionUSD)}</p>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}

            {calendarioView === "semana" && (
              <div className="grid grid-cols-7 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                  const d = new Date(currentDate);
                  d.setDate(d.getDate() - d.getDay() + offset);
                  const ventasDelDia = getVentasDelDia(d);
                  const isToday = d.getDate() === today.getDate() && 
                                  d.getMonth() === today.getMonth() && 
                                  d.getFullYear() === today.getFullYear();
                  
                  return (
                    <div key={offset} className={`min-h-[100px] p-2 rounded-lg border ${isToday ? 'bg-amber-500/20 border-amber-500/30' : 'border-white/10'}`}>
                      <div className={`text-xs text-center font-medium ${isToday ? 'text-amber-400' : 'text-white/60'}`}>
                        {getDayName(d.getDay())}
                        <br />
                        <span className="text-sm">{d.getDate()}</span>
                      </div>
                      {ventasDelDia.sort((a, b) => a.horaExcursion.localeCompare(b.horaExcursion)).slice(0, 2).map((v) => (
                        <div key={v.id} className="text-[8px] truncate text-white/60 mt-1">
                          {v.horaExcursion} {v.clienteNombre}
                        </div>
                      ))}
                      {ventasDelDia.length > 2 && (
                        <div className="text-[8px] text-white/40">
                          +{ventasDelDia.length - 2}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "excursiones":
        return (
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Excursiones</h2>
              <button onClick={() => {
                if (proveedores.length === 0) {
                  alert("Primero debes crear un proveedor");
                  return;
                }
                setEditingExcursionId(null);
                setExcursionFormData({
                  nombre: "",
                  proveedorId: "",
                  proveedorNombre: "",
                  precioAdultoUSD: "",
                  precioNinoUSD: "",
                  costoProveedorAdultoUSD: "",
                  costoProveedorNinoUSD: "",
                  comisionAdultoUSD: "",
                  comisionNinoUSD: "",
                  zona: "",
                  capacidad: "",
                  tienePrecioNino: false,
                });
                setShowExcursionForm(true);
              }} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all text-sm font-medium`}>+ Agregar Excursion</button>
            </div>
            {excursiones.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/40">No hay excursiones registradas</p>
                <p className="text-white/30 text-sm mt-2">Primero crea un proveedor y luego agrega sus excursiones</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Excursion</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Proveedor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Adulto Venta</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Adulto Costo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Nino Venta</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Nino Costo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Comision Adulto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excursiones.map((e) => {
                      const tieneNino = e.precioNinoUSD !== null && e.precioNinoUSD !== undefined;
                      return (
                        <tr key={e.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 text-sm font-medium text-white">{e.nombre}</td>
                          <td className="px-4 py-3 text-sm text-white/60">{e.proveedorNombre}</td>
                          <td className="px-4 py-3 text-sm text-amber-400">{formatUSD(e.precioAdultoUSD)}</td>
                          <td className="px-4 py-3 text-sm text-red-400">{formatUSD(e.costoProveedorAdultoUSD)}</td>
                          <td className="px-4 py-3 text-sm text-amber-400">{tieneNino ? formatUSD(e.precioNinoUSD!) : "-"}</td>
                          <td className="px-4 py-3 text-sm text-red-400">{tieneNino ? formatUSD(e.costoProveedorNinoUSD!) : "-"}</td>
                          <td className="px-4 py-3 text-sm text-green-400">{formatUSD(e.comisionAdultoUSD)}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <button onClick={() => editExcursion(e)} className={`${isRaul ? 'text-amber-400 hover:text-amber-300' : 'text-pink-300 hover:text-pink-200'}`}>Editar</button>
                              <button onClick={() => deleteExcursion(e.id)} className={`${isRaul ? 'text-red-400 hover:text-red-300' : 'text-rose-300 hover:text-rose-200'}`}>Eliminar</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      <header className={`${headerBg} backdrop-blur-lg border-b border-white/10 sticky top-0 z-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${buttonGradient} flex items-center justify-center shadow-lg shadow-${accentColor}-500/25`}>
                <span className="text-xl text-slate-900 font-bold">RE</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Republic Excursions</h1>
                <p className={`text-xs text-${accentColor}-400/80`}>
                  {isRaul ? "Bienvenido, Raul - Comision USD" : "Bienvenida, Gabrielle - Comision USD"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 ${isRaul ? 'bg-amber-500/10 border-amber-500/20' : 'bg-pink-500/20 border-pink-500/20'} rounded-xl border`}>
                <span className={`text-sm ${isRaul ? 'text-amber-400' : 'text-pink-300'} font-medium`}>
                  {isRaul ? "Admin" : "Manager"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all text-sm font-medium"
              >
                Cerrar Sesion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`flex flex-wrap gap-2 mb-8 ${cardBg} backdrop-blur-lg rounded-2xl p-2 border border-white/10`}>
          {["dashboard", "ventas", "reservas", "clientes", "proveedores", "bancos", "calendario", "excursiones"].map((tab) => {
            const labels: any = {
              dashboard: "Dashboard",
              ventas: "Ventas",
              reservas: "Reservas",
              clientes: "Clientes",
              proveedores: "Proveedores",
              bancos: "Bancos",
              calendario: "Calendario",
              excursiones: "Excursiones"
            };
            return (
              <button 
                key={tab}
                onClick={() => setViewMode(tab as any)} 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === tab 
                    ? `bg-gradient-to-r ${buttonGradient} text-slate-900 shadow-lg shadow-${accentColor}-500/25` 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
          <div className="flex-1"></div>
          <button 
            onClick={() => {
              setEditingVentaId(null);
              setSelectedExcursionForVenta(null);
              setFormData({
                clienteNombre: "",
                clienteWhatsapp: "",
                clienteEmail: "",
                excursionId: "",
                excursionNombre: "",
                fechaExcursion: "",
                horaExcursion: "02:00 PM",
                precioAdultoUSD: "",
                precioNinoUSD: "",
                costoProveedorAdultoUSD: "",
                costoProveedorNinoUSD: "",
                comisionAdultoUSD: "",
                comisionNinoUSD: "",
                cantidadAdultos: 1,
                cantidadNinos: 0,
                precioTotalUSD: "",
                costoTotalUSD: "",
                comisionTotalUSD: "",
                pagoCliente: "completo",
                montoPagadoUSD: "",
                saldoPendienteUSD: "",
                metodoPagoCliente: "efectivo",
                proveedorId: "",
                proveedorNombre: "",
                proveedorPagado: "pendiente",
                metodoPagoProveedor: "efectivo",
                tipoServicio: "compartido",
                nombreGrupo: "",
                tipoRecogida: "sin_recogida",
                transporte: "no",
                estado: "pendiente",
                nota: "",
              });
              setShowForm(true);
            }} 
            className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-${accentColor}-500/25`}
          >
            <span className="text-lg leading-none">+</span> Nueva Venta
          </button>
        </div>

        {renderView()}
      </main>

      {/* ============================================
          MODAL DE VENTA
      ============================================ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{editingVentaId ? "Editar Venta" : "Nueva Venta"}</h2>
                <p className="text-sm text-white/40">Cliente paga en USD - Comision automatica</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-3xl leading-none">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Excursion *</label>
                <select
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  value={formData.excursionId}
                  onChange={(e) => selectExcursionForVenta(e.target.value)}
                  required
                >
                  <option value="" className="text-slate-900">Seleccionar excursion</option>
                  {excursiones.map(e => {
                    const tieneNino = e.precioNinoUSD !== null && e.precioNinoUSD !== undefined;
                    return (
                      <option key={e.id} value={e.id} className="text-slate-900">
                        {e.nombre} - {e.proveedorNombre} - Adulto: {formatUSD(e.precioAdultoUSD)}
                        {tieneNino ? ` - Nino: ${formatUSD(e.precioNinoUSD!)}` : " (Sin precio nino)"}
                      </option>
                    );
                  })}
                </select>
                <button 
                  type="button"
                  onClick={() => setShowCrearExcursionDesdeVenta(true)}
                  className="mt-2 text-sm text-amber-400 hover:text-amber-300 transition-all"
                >
                  + Crear nueva excursion
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Fecha Excursion *</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white" 
                    value={formData.fechaExcursion} 
                    onChange={(e) => setFormData({ ...formData, fechaExcursion: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Hora Excursion *</label>
                  <input 
                    type="time" 
                    required 
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white" 
                    value={convertirHora24(formData.horaExcursion)} 
                    onChange={(e) => {
                      const hora24 = e.target.value;
                      setFormData({ ...formData, horaExcursion: formatearHora(hora24) });
                    }} 
                  />
                  <p className="text-xs text-white/40 mt-1">Formato 12h: {formData.horaExcursion}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Precio Adulto (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    value={formData.precioAdultoUSD}
                    onChange={handlePrecioAdultoChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Precio Nino (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    value={formData.precioNinoUSD}
                    onChange={handlePrecioNinoChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Adultos *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    value={formData.cantidadAdultos}
                    onChange={handleCantidadAdultosChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Ninos</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    value={formData.cantidadNinos}
                    onChange={handleCantidadNinosChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Costo Proveedor Adulto (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    value={formData.costoProveedorAdultoUSD}
                    onChange={handleCostoAdultoChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Costo Proveedor Nino (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    value={formData.costoProveedorNinoUSD}
                    onChange={handleCostoNinoChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                  <label className="block text-sm font-medium text-white/60 mb-1">Total Venta (USD)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-transparent border-0 text-amber-400 font-bold text-lg"
                    value={formData.precioTotalUSD || "0.00"}
                    readOnly
                  />
                </div>
                <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                  <label className="block text-sm font-medium text-white/60 mb-1">Total Costo (USD)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-transparent border-0 text-red-400 font-bold text-lg"
                    value={formData.costoTotalUSD || "0.00"}
                    readOnly
                  />
                </div>
                <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                  <label className="block text-sm font-medium text-white/60 mb-1">Total Comision (USD)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-transparent border-0 text-green-400 font-bold text-lg"
                    value={formData.comisionTotalUSD || "0.00"}
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Estado de la Reserva *</label>
                <select 
                  required 
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as "pendiente" | "confirmada" | "cancelada" | "completada" })}
                >
                  <option value="pendiente" className="text-slate-900">Pendiente</option>
                  <option value="confirmada" className="text-slate-900">Confirmada</option>
                  <option value="completada" className="text-slate-900">Completada</option>
                  <option value="cancelada" className="text-slate-900">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Servicio *</label>
                <select 
                  required 
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  value={formData.tipoServicio}
                  onChange={(e) => {
                    const value = e.target.value as "compartido" | "privado" | "grupo";
                    setFormData({ 
                      ...formData, 
                      tipoServicio: value,
                      nombreGrupo: value === "grupo" ? formData.nombreGrupo : ""
                    });
                  }}
                >
                  <option value="compartido" className="text-slate-900">Compartido</option>
                  <option value="privado" className="text-slate-900">Privado</option>
                  <option value="grupo" className="text-slate-900">Grupo</option>
                </select>
              </div>

              {formData.tipoServicio === "grupo" && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Nombre del Grupo</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40"
                    placeholder="Ej: Familia Perez, Grupo 10"
                    value={formData.nombreGrupo}
                    onChange={(e) => setFormData({ ...formData, nombreGrupo: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Tipo de Recogida *</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoRecogida"
                      value="hotel"
                      checked={formData.tipoRecogida === "hotel"}
                      onChange={(e) => setFormData({ ...formData, tipoRecogida: e.target.value as "hotel" | "airbnb" | "sin_recogida" })}
                      className="w-4 h-4 rounded-full border-white/20 bg-white/10 focus:ring-amber-500"
                    />
                    <span className="text-white/80 text-sm">Hotel</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoRecogida"
                      value="airbnb"
                      checked={formData.tipoRecogida === "airbnb"}
                      onChange={(e) => setFormData({ ...formData, tipoRecogida: e.target.value as "hotel" | "airbnb" | "sin_recogida" })}
                      className="w-4 h-4 rounded-full border-white/20 bg-white/10 focus:ring-amber-500"
                    />
                    <span className="text-white/80 text-sm">Airbnb</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoRecogida"
                      value="sin_recogida"
                      checked={formData.tipoRecogida === "sin_recogida"}
                      onChange={(e) => setFormData({ ...formData, tipoRecogida: e.target.value as "hotel" | "airbnb" | "sin_recogida" })}
                      className="w-4 h-4 rounded-full border-white/20 bg-white/10 focus:ring-amber-500"
                    />
                    <span className="text-white/80 text-sm">Sin Recogida</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Transporte *</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="transporte"
                      value="si"
                      checked={formData.transporte === "si"}
                      onChange={(e) => setFormData({ ...formData, transporte: e.target.value as "si" | "no" })}
                      className="w-4 h-4 rounded-full border-white/20 bg-white/10 focus:ring-amber-500"
                    />
                    <span className="text-white/80 text-sm">Si</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="transporte"
                      value="no"
                      checked={formData.transporte === "no"}
                      onChange={(e) => setFormData({ ...formData, transporte: e.target.value as "si" | "no" })}
                      className="w-4 h-4 rounded-full border-white/20 bg-white/10 focus:ring-amber-500"
                    />
                    <span className="text-white/80 text-sm">No</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Cliente *</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                    placeholder="Nombre del cliente" 
                    value={formData.clienteNombre} 
                    onChange={(e) => setFormData({ ...formData, clienteNombre: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">WhatsApp</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                    placeholder="849-000-0000" 
                    value={formData.clienteWhatsapp} 
                    onChange={(e) => setFormData({ ...formData, clienteWhatsapp: e.target.value })} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Proveedor</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white"
                  value={formData.proveedorNombre}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Metodo de Pago del Cliente *</label>
                <select 
                  required 
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white" 
                  value={formData.metodoPagoCliente} 
                  onChange={(e) => setFormData({ ...formData, metodoPagoCliente: e.target.value as any })}
                >
                  <option value="efectivo" className="text-slate-900">Efectivo</option>
                  <option value="tarjeta" className="text-slate-900">Tarjeta</option>
                  <option value="transferencia" className="text-slate-900">Transferencia</option>
                  <option value="paypal" className="text-slate-900">PayPal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Metodo de Pago al Proveedor *</label>
                <select 
                  required 
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white" 
                  value={formData.metodoPagoProveedor} 
                  onChange={(e) => setFormData({ ...formData, metodoPagoProveedor: e.target.value as any })}
                >
                  <option value="efectivo" className="text-slate-900">Efectivo</option>
                  <option value="transferencia" className="text-slate-900">Transferencia</option>
                  <option value="paypal" className="text-slate-900">PayPal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Estado del Pago del Cliente *</label>
                <select 
                  required 
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white" 
                  value={formData.pagoCliente} 
                  onChange={(e) => setFormData({ ...formData, pagoCliente: e.target.value as any })}
                >
                  <option value="completo" className="text-slate-900">Pago completo (USD)</option>
                  <option value="deposito_25" className="text-slate-900">Deposito del 25% (USD)</option>
                  <option value="pago_dia" className="text-slate-900">Paga el dia de la excursion (USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Monto Pagado (USD)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                  placeholder="0.00" 
                  value={formData.montoPagadoUSD} 
                  onChange={(e) => setFormData({ ...formData, montoPagadoUSD: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nota</label>
                <textarea 
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                  placeholder="Detalles adicionales..." 
                  rows={2} 
                  value={formData.nota} 
                  onChange={(e) => setFormData({ ...formData, nota: e.target.value })} 
                />
              </div>

              <button type="submit" className={`w-full bg-gradient-to-r ${buttonGradient} text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl transition-all`}>
                {editingVentaId ? "Actualizar Venta" : "Guardar Venta"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL CREAR EXCURSION DESDE VENTA
      ============================================ */}
      {showCrearExcursionDesdeVenta && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Crear Nueva Excursion</h2>
              <button onClick={() => setShowCrearExcursionDesdeVenta(false)} className="text-white/40 hover:text-white text-3xl leading-none">×</button>
            </div>
            <form onSubmit={handleCrearExcursionDesdeVenta} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nombre de la Excursion *</label>
                <input 
                  type="text" 
                  value={nuevaExcursionDesdeVenta.nombre}
                  onChange={(e) => setNuevaExcursionDesdeVenta({ ...nuevaExcursionDesdeVenta, nombre: e.target.value })}
                  required 
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                  placeholder="Ej: Isla Saona" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Proveedor</label>
                <select 
                  value={nuevaExcursionDesdeVenta.proveedorId}
                  onChange={(e) => {
                    const proveedor = proveedores.find(p => p.id === e.target.value);
                    setNuevaExcursionDesdeVenta({ 
                      ...nuevaExcursionDesdeVenta, 
                      proveedorId: e.target.value,
                      proveedorNombre: proveedor?.nombre || ""
                    });
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                >
                  <option value="" className="text-slate-900">Seleccionar proveedor existente</option>
                  {proveedores.map(p => <option key={p.id} value={p.id} className="text-slate-900">{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nombre del Proveedor (si no existe)</label>
                <input 
                  type="text" 
                  value={nuevaExcursionDesdeVenta.proveedorNombre}
                  onChange={(e) => setNuevaExcursionDesdeVenta({ ...nuevaExcursionDesdeVenta, proveedorNombre: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                  placeholder="Crear nuevo proveedor" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Precio Adulto (USD) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={nuevaExcursionDesdeVenta.precioAdultoUSD}
                    onChange={(e) => setNuevaExcursionDesdeVenta({ ...nuevaExcursionDesdeVenta, precioAdultoUSD: e.target.value })}
                    required 
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                    placeholder="99.00" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Costo Adulto (USD) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={nuevaExcursionDesdeVenta.costoProveedorAdultoUSD}
                    onChange={(e) => setNuevaExcursionDesdeVenta({ ...nuevaExcursionDesdeVenta, costoProveedorAdultoUSD: e.target.value })}
                    required 
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                    placeholder="55.00" 
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="tienePrecioNinoDesdeVenta"
                    checked={nuevaExcursionDesdeVenta.tienePrecioNino}
                    onChange={(e) => setNuevaExcursionDesdeVenta({ ...nuevaExcursionDesdeVenta, tienePrecioNino: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 focus:ring-amber-500"
                  />
                  <label htmlFor="tienePrecioNinoDesdeVenta" className="text-sm font-medium text-white/70">Tiene precio para Ninos</label>
                </div>
                {nuevaExcursionDesdeVenta.tienePrecioNino && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Precio Nino (USD)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={nuevaExcursionDesdeVenta.precioNinoUSD}
                        onChange={(e) => setNuevaExcursionDesdeVenta({ ...nuevaExcursionDesdeVenta, precioNinoUSD: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                        placeholder="69.00" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Costo Nino (USD)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={nuevaExcursionDesdeVenta.costoProveedorNinoUSD}
                        onChange={(e) => setNuevaExcursionDesdeVenta({ ...nuevaExcursionDesdeVenta, costoProveedorNinoUSD: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                        placeholder="35.00" 
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Zona (opcional)</label>
                  <input 
                    type="text" 
                    value={nuevaExcursionDesdeVenta.zona}
                    onChange={(e) => setNuevaExcursionDesdeVenta({ ...nuevaExcursionDesdeVenta, zona: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                    placeholder="Bavaro" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Capacidad (opcional)</label>
                  <input 
                    type="text" 
                    value={nuevaExcursionDesdeVenta.capacidad}
                    onChange={(e) => setNuevaExcursionDesdeVenta({ ...nuevaExcursionDesdeVenta, capacidad: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                    placeholder="2 personas" 
                  />
                </div>
              </div>
              <button type="submit" className={`w-full bg-gradient-to-r ${buttonGradient} text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl transition-all`}>
                Crear Excursion
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL DE PROVEEDOR
      ============================================ */}
      {showProveedorForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editingProveedorId ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
              <button onClick={() => setShowProveedorForm(false)} className="text-white/40 hover:text-white text-3xl leading-none">×</button>
            </div>
            <form onSubmit={handleProveedorSubmit} className="space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-semibold text-white/70 mb-3">Datos de la Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Nombre del Proveedor *</label>
                    <input 
                      type="text" 
                      value={proveedorFormData.nombre}
                      onChange={(e) => setProveedorFormData({ ...proveedorFormData, nombre: e.target.value })}
                      required 
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                      placeholder="Nombre del contacto" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Nombre de la Empresa</label>
                    <input 
                      type="text" 
                      value={proveedorFormData.empresa}
                      onChange={(e) => setProveedorFormData({ ...proveedorFormData, empresa: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                      placeholder="Nombre de la empresa" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white/70 mb-3">Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Telefono</label>
                    <input 
                      type="text" 
                      value={proveedorFormData.telefono}
                      onChange={(e) => setProveedorFormData({ ...proveedorFormData, telefono: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                      placeholder="(849) 656-6073" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={proveedorFormData.email}
                      onChange={(e) => setProveedorFormData({ ...proveedorFormData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                      placeholder="info@proveedor.com" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white/70 mb-2">Metodos de Pago del Proveedor</h3>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={proveedorFormData.metodosPago.includes("efectivo")}
                      onChange={() => toggleMetodoPago("efectivo")}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 focus:ring-amber-500"
                    />
                    <span className="text-white/80 text-sm">Efectivo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={proveedorFormData.metodosPago.includes("transferencia")}
                      onChange={() => toggleMetodoPago("transferencia")}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 focus:ring-amber-500"
                    />
                    <span className="text-white/80 text-sm">Transferencia</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={proveedorFormData.metodosPago.includes("paypal")}
                      onChange={() => toggleMetodoPago("paypal")}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 focus:ring-amber-500"
                    />
                    <span className="text-white/80 text-sm">PayPal</span>
                  </label>
                </div>
                <p className="text-xs text-white/40 mt-1">Selecciona todos los metodos de pago que acepta el proveedor</p>
              </div>

              <div className="border-t border-white/10 pt-4 mt-2">
                <h3 className="text-lg font-semibold text-white mb-3">Datos Bancarios del Proveedor</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Nombre del Banco</label>
                    <input 
                      type="text" 
                      value={proveedorFormData.banco}
                      onChange={(e) => setProveedorFormData({ ...proveedorFormData, banco: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                      placeholder="Ej: Banco Popular" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Numero de Cuenta</label>
                    <input 
                      type="text" 
                      value={proveedorFormData.numeroCuenta}
                      onChange={(e) => setProveedorFormData({ ...proveedorFormData, numeroCuenta: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                      placeholder="0000-0000-0000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Beneficiario</label>
                    <input 
                      type="text" 
                      value={proveedorFormData.beneficiario}
                      onChange={(e) => setProveedorFormData({ ...proveedorFormData, beneficiario: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                      placeholder="Nombre del titular de la cuenta" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Cuenta</label>
                    <select 
                      value={proveedorFormData.tipoCuenta}
                      onChange={(e) => setProveedorFormData({ ...proveedorFormData, tipoCuenta: e.target.value as "corriente" | "ahorros" | "nomina" })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    >
                      <option value="corriente" className="text-slate-900">Corriente</option>
                      <option value="ahorros" className="text-slate-900">Ahorros</option>
                      <option value="nomina" className="text-slate-900">Nomina</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Documentos</label>
                    <input 
                      type="text" 
                      value={proveedorFormData.documentos}
                      onChange={(e) => setProveedorFormData({ ...proveedorFormData, documentos: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                      placeholder="RNC, Cedula, etc." 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nota</label>
                <textarea 
                  value={proveedorFormData.nota}
                  onChange={(e) => setProveedorFormData({ ...proveedorFormData, nota: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                  placeholder="Detalles del proveedor..." 
                  rows={2}
                />
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-semibold text-white mb-3">Excursiones de este Proveedor</h3>
                
                {tempExcursiones.length > 0 && (
                  <div className="mb-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-2 py-2 text-left text-white/60">Nombre</th>
                          <th className="px-2 py-2 text-left text-white/60">Adulto Venta</th>
                          <th className="px-2 py-2 text-left text-white/60">Adulto Costo</th>
                          <th className="px-2 py-2 text-left text-white/60">Nino Venta</th>
                          <th className="px-2 py-2 text-left text-white/60">Nino Costo</th>
                          <th className="px-2 py-2 text-left text-white/60">Accion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tempExcursiones.map((e, index) => (
                          <tr key={index} className="border-b border-white/5">
                            <td className="px-2 py-2 text-white">{e.nombre}</td>
                            <td className="px-2 py-2 text-amber-400">{formatUSD(e.precioAdultoUSD)}</td>
                            <td className="px-2 py-2 text-red-400">{formatUSD(e.costoProveedorAdultoUSD)}</td>
                            <td className="px-2 py-2 text-amber-400">{e.precioNinoUSD !== null ? formatUSD(e.precioNinoUSD) : "-"}</td>
                            <td className="px-2 py-2 text-red-400">{e.costoProveedorNinoUSD !== null ? formatUSD(e.costoProveedorNinoUSD) : "-"}</td>
                            <td className="px-2 py-2">
                              <button type="button" onClick={() => eliminarTempExcursion(index)} className="text-red-400 hover:text-red-300">Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-white/60 mb-1">Nombre Excursion *</label>
                    <input 
                      type="text" 
                      value={tempExcursionForm.nombre}
                      onChange={(e) => setTempExcursionForm({ ...tempExcursionForm, nombre: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 text-sm" 
                      placeholder="Isla Saona" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Precio Adulto (USD)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={tempExcursionForm.precioAdultoUSD}
                      onChange={(e) => {
                        const valor = e.target.value;
                        const pv = parseFloat(valor) || 0;
                        const cp = parseFloat(tempExcursionForm.costoProveedorAdultoUSD) || 0;
                        const comision = calcularComision(pv, cp);
                        setTempExcursionForm({ 
                          ...tempExcursionForm, 
                          precioAdultoUSD: valor,
                          comisionAdultoUSD: comision.toString()
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 text-sm" 
                      placeholder="99.00" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Costo Adulto (USD)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={tempExcursionForm.costoProveedorAdultoUSD}
                      onChange={(e) => {
                        const valor = e.target.value;
                        const cp = parseFloat(valor) || 0;
                        const pv = parseFloat(tempExcursionForm.precioAdultoUSD) || 0;
                        const comision = calcularComision(pv, cp);
                        setTempExcursionForm({ 
                          ...tempExcursionForm, 
                          costoProveedorAdultoUSD: valor,
                          comisionAdultoUSD: comision.toString()
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 text-sm" 
                      placeholder="55.00" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Precio Nino (USD)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={tempExcursionForm.precioNinoUSD}
                      onChange={(e) => {
                        const valor = e.target.value;
                        const tienePrecioNino = valor !== "" && parseFloat(valor) > 0;
                        const pv = parseFloat(valor) || 0;
                        const cp = parseFloat(tempExcursionForm.costoProveedorNinoUSD) || 0;
                        const comision = calcularComision(pv, cp);
                        setTempExcursionForm({ 
                          ...tempExcursionForm, 
                          precioNinoUSD: valor,
                          tienePrecioNino: tienePrecioNino,
                          comisionNinoUSD: comision.toString()
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 text-sm" 
                      placeholder="Dejar vacio si no aplica" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Costo Nino (USD)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={tempExcursionForm.costoProveedorNinoUSD}
                      onChange={(e) => {
                        const valor = e.target.value;
                        const cp = parseFloat(valor) || 0;
                        const pv = parseFloat(tempExcursionForm.precioNinoUSD) || 0;
                        const comision = calcularComision(pv, cp);
                        setTempExcursionForm({ 
                          ...tempExcursionForm, 
                          costoProveedorNinoUSD: valor,
                          comisionNinoUSD: comision.toString()
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 text-sm" 
                      placeholder="Dejar vacio si no aplica" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Zona</label>
                    <input 
                      type="text" 
                      value={tempExcursionForm.zona}
                      onChange={(e) => setTempExcursionForm({ ...tempExcursionForm, zona: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 text-sm" 
                      placeholder="Bavaro" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Capacidad</label>
                    <input 
                      type="text" 
                      value={tempExcursionForm.capacidad}
                      onChange={(e) => setTempExcursionForm({ ...tempExcursionForm, capacidad: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 text-sm" 
                      placeholder="2 personas" 
                    />
                  </div>
                  <div className="col-span-2">
                    <button 
                      type="button" 
                      onClick={agregarTempExcursion}
                      className="w-full bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-medium"
                    >
                      + Agregar Excursion
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className={`w-full bg-gradient-to-r ${buttonGradient} text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl transition-all`}>
                {editingProveedorId ? "Actualizar Proveedor" : "Guardar Proveedor"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL DE EXCURSION
      ============================================ */}
      {showExcursionForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editingExcursionId ? "Editar Excursion" : "Nueva Excursion"}</h2>
              <button onClick={() => setShowExcursionForm(false)} className="text-white/40 hover:text-white text-3xl leading-none">×</button>
            </div>
            <form onSubmit={handleExcursionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nombre de la Excursion *</label>
                <input 
                  type="text" 
                  value={excursionFormData.nombre}
                  onChange={(e) => setExcursionFormData({ ...excursionFormData, nombre: e.target.value })}
                  required 
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                  placeholder="Ej: Isla Saona" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Proveedor *</label>
                <select 
                  value={excursionFormData.proveedorId}
                  onChange={(e) => setExcursionFormData({ ...excursionFormData, proveedorId: e.target.value })}
                  required 
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                >
                  <option value="" className="text-slate-900">Seleccionar proveedor</option>
                  {proveedores.map(p => <option key={p.id} value={p.id} className="text-slate-900">{p.nombre}</option>)}
                </select>
              </div>
              
              <div className="border-t border-white/10 pt-3">
                <h4 className="text-sm font-semibold text-white/70 mb-2">Precios Adulto</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Precio Venta (USD) *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={excursionFormData.precioAdultoUSD}
                      onChange={(e) => {
                        const pv = e.target.value;
                        const cp = excursionFormData.costoProveedorAdultoUSD;
                        const comision = calcularComision(parseFloat(pv) || 0, parseFloat(cp) || 0);
                        setExcursionFormData({ 
                          ...excursionFormData, 
                          precioAdultoUSD: pv,
                          comisionAdultoUSD: comision.toString()
                        });
                      }}
                      required 
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                      placeholder="99.00" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Costo Proveedor (USD) *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={excursionFormData.costoProveedorAdultoUSD}
                      onChange={(e) => {
                        const cp = e.target.value;
                        const pv = excursionFormData.precioAdultoUSD;
                        const comision = calcularComision(parseFloat(pv) || 0, parseFloat(cp) || 0);
                        setExcursionFormData({ 
                          ...excursionFormData, 
                          costoProveedorAdultoUSD: cp,
                          comisionAdultoUSD: comision.toString()
                        });
                      }}
                      required 
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                      placeholder="55.00" 
                    />
                  </div>
                </div>
                <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20 mt-2">
                  <label className="block text-sm font-medium text-white/60 mb-1">Comision Adulto (USD) - Tu Ganancia</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-transparent border-0 text-green-400 font-bold text-lg"
                    value={excursionFormData.comisionAdultoUSD}
                    readOnly
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="tienePrecioNino"
                    checked={excursionFormData.tienePrecioNino}
                    onChange={(e) => {
                      setExcursionFormData({ 
                        ...excursionFormData, 
                        tienePrecioNino: e.target.checked,
                        precioNinoUSD: e.target.checked ? excursionFormData.precioNinoUSD : "",
                        costoProveedorNinoUSD: e.target.checked ? excursionFormData.costoProveedorNinoUSD : "",
                        comisionNinoUSD: e.target.checked ? excursionFormData.comisionNinoUSD : "",
                      });
                    }}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 focus:ring-amber-500"
                  />
                  <label htmlFor="tienePrecioNino" className="text-sm font-medium text-white/70">Tiene precio para Ninos</label>
                </div>
                
                {excursionFormData.tienePrecioNino && (
                  <>
                    <h4 className="text-sm font-semibold text-white/70 mb-2">Precios Nino</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Precio Venta Nino (USD)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={excursionFormData.precioNinoUSD}
                          onChange={(e) => {
                            const pv = e.target.value;
                            const cp = excursionFormData.costoProveedorNinoUSD;
                            const comision = calcularComision(parseFloat(pv) || 0, parseFloat(cp) || 0);
                            setExcursionFormData({ 
                              ...excursionFormData, 
                              precioNinoUSD: pv,
                              comisionNinoUSD: comision.toString()
                            });
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                          placeholder="69.00" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Costo Proveedor Nino (USD)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={excursionFormData.costoProveedorNinoUSD}
                          onChange={(e) => {
                            const cp = e.target.value;
                            const pv = excursionFormData.precioNinoUSD;
                            const comision = calcularComision(parseFloat(pv) || 0, parseFloat(cp) || 0);
                            setExcursionFormData({ 
                              ...excursionFormData, 
                              costoProveedorNinoUSD: cp,
                              comisionNinoUSD: comision.toString()
                            });
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                          placeholder="35.00" 
                        />
                      </div>
                    </div>
                    <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20 mt-2">
                      <label className="block text-sm font-medium text-white/60 mb-1">Comision Nino (USD) - Tu Ganancia</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-transparent border-0 text-green-400 font-bold text-lg"
                        value={excursionFormData.comisionNinoUSD}
                        readOnly
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Zona (opcional)</label>
                  <input 
                    type="text" 
                    value={excursionFormData.zona}
                    onChange={(e) => setExcursionFormData({ ...excursionFormData, zona: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                    placeholder="Bavaro, Uvero Alto, etc." 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Capacidad (opcional)</label>
                  <input 
                    type="text" 
                    value={excursionFormData.capacidad}
                    onChange={(e) => setExcursionFormData({ ...excursionFormData, capacidad: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                    placeholder="2 personas, 4 personas, etc." 
                  />
                </div>
              </div>
              <button type="submit" className={`w-full bg-gradient-to-r ${buttonGradient} text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl transition-all`}>
                {editingExcursionId ? "Actualizar Excursion" : "Guardar Excursion"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL DE CLIENTE
      ============================================ */}
      {showClienteForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Nuevo Cliente</h2>
              <button onClick={() => setShowClienteForm(false)} className="text-white/40 hover:text-white text-3xl leading-none">×</button>
            </div>
            <form onSubmit={handleClienteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nombre del Cliente *</label>
                <input type="text" name="nombre" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="Ej: Juan Perez" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">WhatsApp</label>
                <input type="text" name="whatsapp" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="849-000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                <input type="email" name="email" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="cliente@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Excursion (opcional)</label>
                <select name="excursionId" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white">
                  <option value="" className="text-slate-900">Ninguna</option>
                  {excursiones.map(e => <option key={e.id} value={e.id} className="text-slate-900">{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Fecha de la Excursion (opcional)</label>
                <input type="date" name="fechaExcursion" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white" />
              </div>
              <button type="submit" className={`w-full bg-gradient-to-r ${buttonGradient} text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl transition-all`}>Guardar Cliente</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
