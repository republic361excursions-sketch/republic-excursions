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
  zona: string;
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
  monedaCuenta: "USD" | "RD$";
  tipoCuenta: ("corriente" | "ahorros")[];
  tipoBeneficiario: "personal" | "empresarial";
  beneficiario: string;
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
// LISTA DE ZONAS DE PUNTA CANA
// ============================================
const ZONAS_PUNTA_CANA = [
  "Jellyfish",
  "Macao",
  "Los Corales Beach",
  "Bavaro",
  "Punta Cana Village",
  "Cap Cana",
  "Uvero Alto",
  "Cabeza de Toro",
  "El Cortecito",
  "Los Corales",
  "Bibijagua",
  "Arena Gorda",
  "Melia",
  "Riu",
  "Hard Rock",
  "Iberostar",
  "Bahia Principe",
  "Sirenis",
  "Dreams",
  "Excellence",
  "San Juan",
  "Veron",
  "Frias",
  "La Otra Banda",
  "Los Prados",
  "Los Maestros",
  "Los Jardines",
  "Villa Baya",
  "Brisas del Mar",
  "Playa Los Corales",
  "Playa Macao",
  "Playa Bavaro",
  "Playa Uvero Alto"
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<"raul" | "gabrielle" | "republic" | null>(null);
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

  // Buscadores y filtros por sección
  const [searchClientes, setSearchClientes] = useState("");
  const [filterClienteExcursion, setFilterClienteExcursion] = useState("");

  const [searchProveedores, setSearchProveedores] = useState("");
  const [filterProveedorMetodo, setFilterProveedorMetodo] = useState("todos");

  const [searchExcursiones, setSearchExcursiones] = useState("");
  const [filterExcursionProveedor, setFilterExcursionProveedor] = useState("");

  const [searchBancos, setSearchBancos] = useState("");
  const [filterBancoTipo, setFilterBancoTipo] = useState("todos");
  const [filterBancoMoneda, setFilterBancoMoneda] = useState("todas");
  const [filterBancoBeneficiario, setFilterBancoBeneficiario] = useState("todos");

  const [searchReservas, setSearchReservas] = useState("");
  const [filterReservaEstado, setFilterReservaEstado] = useState("todas");
  const [filterReservaFecha, setFilterReservaFecha] = useState("");

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
    zona: "",
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
    monedaCuenta: "RD$" as "USD" | "RD$",
    tipoCuenta: [] as ("corriente" | "ahorros")[],
    tipoBeneficiario: "personal" as "personal" | "empresarial",
    beneficiario: "",
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
    if (username === "Republic" && password === "Admin2026") {
      setIsLoggedIn(true);
      setCurrentUser("republic");
      setLoginError("");
      return true;
    } else if (username === "Raul" && password === "Republ1c$$") {
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
        monedaCuenta: "RD$",
        tipoCuenta: ["corriente"],
        tipoBeneficiario: "personal",
        beneficiario: "",
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
      zona: nuevaExcursionDesdeVenta.zona || "Bavaro",
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
      zona: nuevaExcursion.zona,
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
    alert("Excursion creada correctamente");
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
              monedaCuenta: proveedorFormData.monedaCuenta,
              tipoCuenta: proveedorFormData.tipoCuenta,
              tipoBeneficiario: proveedorFormData.tipoBeneficiario,
              beneficiario: proveedorFormData.beneficiario,
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
      monedaCuenta: "RD$",
      tipoCuenta: [],
      tipoBeneficiario: "personal",
      beneficiario: "",
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
      monedaCuenta: proveedor.monedaCuenta || "RD$",
      tipoCuenta: proveedor.tipoCuenta || [],
      tipoBeneficiario: proveedor.tipoBeneficiario || "personal",
      beneficiario: proveedor.beneficiario,
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
  // MANEJAR TIPO DE CUENTA (Corriente / Ahorros)
  // ============================================
  const toggleTipoCuenta = (tipo: "corriente" | "ahorros") => {
    setProveedorFormData(prev => {
      const tipos = prev.tipoCuenta;
      if (tipos.includes(tipo)) {
        return { ...prev, tipoCuenta: tipos.filter(t => t !== tipo) };
      } else {
        return { ...prev, tipoCuenta: [...tipos, tipo] };
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
        zona: tempExcursionForm.zona || "Bavaro",
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
              zona: excursionFormData.zona || "Bavaro",
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
        zona: excursionFormData.zona || "Bavaro",
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

    const excursion = excursiones.find(e => e.id === formData.excursionId);

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
      zona: "",
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
        zona: excursion.zona || "",
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
      zona: excursion?.zona || "",
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
  // COMPONENTE DE LOGIN
  // ============================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-amber-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl hover:shadow-amber-500/10 transition-all duration-500">
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
            <p className="text-white/40 text-sm mt-1">Sistema de Gestion de Excursiones</p>
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
              <label className="block text-sm font-medium text-white/70 mb-1">Contrasena</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔒</span>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 transition-all"
                  placeholder="Ingresa tu contrasena"
                />
              </div>
            </div>
            {loginError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all shadow-lg shadow-amber-500/25"
            >
              Iniciar Sesion
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-xs text-white/30">
                Usuarios: <span className="text-white/50 font-medium">Republic</span> <span className="text-white/30">|</span> <span className="text-white/50 font-medium">Raul</span> <span className="text-white/30">|</span> <span className="text-white/50 font-medium">Gabrielle</span>
              </p>
              <p className="text-xs text-white/30 mt-1">
                Contrasena: <span className="text-white/50 font-mono">Admin2026</span> <span className="text-white/30">|</span> <span className="text-white/50 font-mono">Republ1c$$</span>
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[10px] text-white/20">v2.6.0 • Republic Excursions © 2026</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  const isAdmin = currentUser === "republic";
  const isRaul = currentUser === "raul";
  const isGabrielle = currentUser === "gabrielle";
  
  const bgGradient = isAdmin 
    ? "from-slate-900 via-slate-800 to-slate-900"
    : isRaul 
      ? "from-slate-900 via-blue-900 to-slate-900"
      : "from-purple-900 via-pink-800 to-rose-900";
  
  const accentColor = isAdmin ? "amber" : isRaul ? "blue" : "pink";
  const headerBg = isAdmin ? "bg-white/5" : "bg-white/10";
  const cardBg = isAdmin ? "bg-white/5" : "bg-white/10";
  const buttonGradient = isAdmin 
    ? "from-amber-500 to-amber-600"
    : isRaul
      ? "from-blue-500 to-indigo-600"
      : "from-pink-500 to-purple-500";

  const getUserRole = () => {
    if (isAdmin) return "Administrador";
    if (isRaul) return "Vendedor";
    if (isGabrielle) return "Vendedora";
    return "Usuario";
  };

  // ============================================
  // FUNCION PARA RENDERIZAR CADA VISTA
  // ============================================
  const renderView = () => {
    switch(viewMode) {
      case "dashboard":
        return renderDashboard();
      case "ventas":
        return renderVentas();
      case "reservas":
        return renderReservas();
      case "clientes":
        return renderClientes();
      case "proveedores":
        return renderProveedores();
      case "bancos":
        return renderBancos();
      case "calendario":
        return renderCalendario();
      case "excursiones":
        return renderExcursiones();
      default:
        return renderDashboard();
    }
  };

  // ============================================
  // RENDER DASHBOARD - CON FECHA Y HORA
  // ============================================
  const renderDashboard = () => {
    const totalVentas = ventas.reduce((sum, v) => sum + v.precioVentaUSD, 0);
    const totalComisiones = ventas.reduce((sum, v) => sum + v.comisionUSD, 0);
    const totalPendiente = ventas.reduce((sum, v) => sum + v.saldoPendienteUSD, 0);
    const totalClientes = clientes.length;
    const totalProveedores = proveedores.length;
    const totalExcursiones = excursiones.length;
    
    const ventasHoy = ventas.filter(v => {
      const hoy = new Date();
      const fechaV = new Date(v.fechaExcursion);
      return fechaV.getDate() === hoy.getDate() &&
             fechaV.getMonth() === hoy.getMonth() &&
             fechaV.getFullYear() === hoy.getFullYear();
    });
    
    const ventasPendientes = ventas.filter(v => v.estado === "pendiente");
    const ventasConfirmadas = ventas.filter(v => v.estado === "confirmada");
    const ventasCompletadas = ventas.filter(v => v.estado === "completada");

    // Fecha y hora actual
    const fechaActual = currentTime.toLocaleDateString("es-DO", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const horaActual = currentTime.toLocaleTimeString("es-DO", {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return (
      <div className="space-y-6">
        {/* Reloj y Fecha en el Dashboard */}
        <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center`}>
          <div className="text-4xl font-bold text-white font-mono tracking-wider">
            {horaActual}
          </div>
          <div className="text-sm text-white/50 mt-1">
            {fechaActual}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-${accentColor}-500/20 flex items-center justify-center`}>
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-white/40 text-sm">Total Ventas</p>
                <p className="text-white font-bold text-xl">{formatUSD(totalVentas)}</p>
              </div>
            </div>
          </div>
          
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center`}>
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <p className="text-white/40 text-sm">Comisiones</p>
                <p className="text-white font-bold text-xl">{formatUSD(totalComisiones)}</p>
              </div>
            </div>
          </div>
          
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center`}>
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="text-white/40 text-sm">Pendiente Cobrar</p>
                <p className="text-white font-bold text-xl">{formatUSD(totalPendiente)}</p>
              </div>
            </div>
          </div>
          
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center`}>
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-white/40 text-sm">Clientes</p>
                <p className="text-white font-bold text-xl">{totalClientes}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <h3 className="text-white font-semibold mb-3">Resumen de Ventas</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Hoy</span>
                <span className="text-white font-medium">{formatUSD(ventasHoy.reduce((s, v) => s + v.precioVentaUSD, 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Pendientes</span>
                <span className="text-yellow-400 font-medium">{ventasPendientes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Confirmadas</span>
                <span className="text-blue-400 font-medium">{ventasConfirmadas.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Completadas</span>
                <span className="text-green-400 font-medium">{ventasCompletadas.length}</span>
              </div>
            </div>
          </div>

          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <h3 className="text-white font-semibold mb-3">Excursiones</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Total Excursiones</span>
                <span className="text-white font-medium">{totalExcursiones}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Proveedores</span>
                <span className="text-white font-medium">{totalProveedores}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Ventas Totales</span>
                <span className="text-white font-medium">{ventas.length}</span>
              </div>
            </div>
          </div>

          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
            <h3 className="text-white font-semibold mb-3">Ultimas Ventas</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {ventas.slice(-5).reverse().map(v => (
                <div key={v.id} className="flex justify-between text-sm border-b border-white/5 pb-1">
                  <span className="text-white/60 truncate">{v.clienteNombre}</span>
                  <span className="text-white font-medium">{formatUSD(v.precioVentaUSD)}</span>
                </div>
              ))}
              {ventas.length === 0 && (
                <p className="text-white/40 text-sm text-center">No hay ventas registradas</p>
              )}
            </div>
          </div>
        </div>

        {ventas.length === 0 && (
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-12 border border-white/10 text-center`}>
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-white text-xl font-semibold mb-2">Comienza tu primera venta!</h3>
            <p className="text-white/40">Haz clic en "Nueva Venta" para registrar tu primera excursion</p>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // RENDER VENTAS
  // ============================================
  const renderVentas = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar ventas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todos los años</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterYear("");
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all"
            >
              Limpiar
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-all"
            >
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-4 border border-white/10`}>
            <p className="text-white/40 text-sm">Total Ventas</p>
            <p className="text-white text-2xl font-bold">{formatUSD(totalVentasUSD)}</p>
          </div>
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-4 border border-white/10`}>
            <p className="text-white/40 text-sm">Comision Total</p>
            <p className="text-green-400 text-2xl font-bold">{formatUSD(totalComision)}</p>
          </div>
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-4 border border-white/10`}>
            <p className="text-white/40 text-sm">Pendiente Cobrar</p>
            <p className="text-yellow-400 text-2xl font-bold">{formatUSD(totalPendienteUSD)}</p>
          </div>
        </div>

        <div className="space-y-2">
          {groupedArray.length === 0 ? (
            <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-12 border border-white/10 text-center`}>
              <p className="text-white/40">No hay ventas registradas</p>
            </div>
          ) : (
            groupedArray.map((group: any) => (
              <div key={group.key} className={`${cardBg} backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden`}>
                <button
                  onClick={() => toggleMonth(group.key)}
                  className="w-full px-6 py-4 flex flex-wrap items-center justify-between hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-white font-semibold text-lg">
                      {getMonthName(group.month - 1)} {group.year}
                    </span>
                    <span className="text-white/40 text-sm">
                      {group.ventas.length} ventas
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-white font-bold">{formatUSD(group.totalUSD)}</span>
                    <span className="text-green-400 text-sm">{formatUSD(group.totalComision)}</span>
                    <span className={`transform transition-transform ${expandedMonth === group.key ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </button>
                
                {expandedMonth === group.key && (
                  <div className="px-6 pb-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-white/40 border-b border-white/10">
                          <th className="text-left py-2 px-2">Fecha</th>
                          <th className="text-left py-2 px-2">Cliente</th>
                          <th className="text-left py-2 px-2">Excursion</th>
                          <th className="text-left py-2 px-2">Adultos</th>
                          <th className="text-left py-2 px-2">Ninos</th>
                          <th className="text-right py-2 px-2">Precio</th>
                          <th className="text-right py-2 px-2">Comision</th>
                          <th className="text-left py-2 px-2">Estado</th>
                          <th className="text-left py-2 px-2">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.ventas.map((venta: Venta) => (
                          <tr key={venta.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-2 px-2 text-white/60 text-xs">
                              {new Date(venta.fechaExcursion).toLocaleDateString("es-DO")}
                            </td>
                            <td className="py-2 px-2 text-white">{venta.clienteNombre}</td>
                            <td className="py-2 px-2 text-white/80 text-xs max-w-[100px] truncate">
                              {venta.excursionNombre}
                            </td>
                            <td className="py-2 px-2 text-white/60">{venta.cantidadAdultos}</td>
                            <td className="py-2 px-2 text-white/60">{venta.cantidadNinos || 0}</td>
                            <td className="py-2 px-2 text-right text-white font-medium">
                              {formatUSD(venta.precioVentaUSD)}
                            </td>
                            <td className="py-2 px-2 text-right text-green-400">
                              {formatUSD(venta.comisionUSD)}
                            </td>
                            <td className="py-2 px-2">
                              <span className={`px-2 py-1 rounded-lg text-xs ${getEstadoColor(venta.estado)}`}>
                                {getEstadoText(venta.estado)}
                              </span>
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => editVenta(venta)}
                                  className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-xs transition-all"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => deleteVenta(venta.id)}
                                  className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs transition-all"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER RESERVAS - CORREGIDO
  // ============================================
  const renderReservas = () => {
    const reservasFiltradas = ventas.filter(v => {
      const matchesSearch = v.clienteNombre.toLowerCase().includes(searchReservas.toLowerCase()) ||
                            v.excursionNombre.toLowerCase().includes(searchReservas.toLowerCase());
      const matchesEstado = filtroEstadoReserva === "todas" || v.estado === filtroEstadoReserva;
      const matchesFecha = !filterReservaFecha || v.fechaExcursion === filterReservaFecha;
      return matchesSearch && matchesEstado && matchesFecha;
    });

    const totalReservas = reservasFiltradas.length;
    const totalMonto = reservasFiltradas.reduce((s, v) => s + v.precioVentaUSD, 0);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar reservas..."
              value={searchReservas}
              onChange={(e) => setSearchReservas(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filtroEstadoReserva}
            onChange={(e) => setFiltroEstadoReserva(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <option value="todas">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <input
            type="date"
            value={filterReservaFecha}
            onChange={(e) => setFilterReservaFecha(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
          />
          <button
            onClick={() => {
              setSearchReservas("");
              setFiltroEstadoReserva("todas");
              setFilterReservaFecha("");
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white"
          >
            Limpiar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-4 border border-white/10`}>
            <p className="text-white/40 text-sm">Total Reservas</p>
            <p className="text-white text-2xl font-bold">{totalReservas}</p>
          </div>
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-4 border border-white/10`}>
            <p className="text-white/40 text-sm">Monto Total</p>
            <p className="text-white text-2xl font-bold">{formatUSD(totalMonto)}</p>
          </div>
          <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-4 border border-white/10`}>
            <p className="text-white/40 text-sm">Pendientes</p>
            <p className="text-yellow-400 text-2xl font-bold">
              {reservasFiltradas.filter(v => v.estado === "pendiente").length}
            </p>
          </div>
        </div>

        <div className={`${cardBg} backdrop-blur-lg rounded-2xl border border-white/10 overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-left py-3 px-4">Excursion</th>
                <th className="text-left py-3 px-4">Contacto</th>
                <th className="text-right py-3 px-4">Monto</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-white/40">
                    No hay reservas
                  </td>
                </tr>
              ) : (
                reservasFiltradas.map(v => (
                  <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white/60 text-xs">
                      {new Date(v.fechaExcursion).toLocaleDateString("es-DO")}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{v.clienteNombre}</td>
                    <td className="py-3 px-4 text-white/80 max-w-[150px] truncate">
                      {v.excursionNombre}
                    </td>
                    <td className="py-3 px-4 text-white/60 text-xs">
                      <div>{v.clienteWhatsapp}</div>
                      <div className="text-xs text-white/40">{v.clienteEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-white font-medium">
                      {formatUSD(v.precioVentaUSD)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-lg text-xs ${getEstadoColor(v.estado)}`}>
                        {getEstadoText(v.estado)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => editVenta(v)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-xs transition-all"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER CLIENTES
  // ============================================
  const renderClientes = () => {
    const clientesFiltrados = clientes.filter(c => {
      const matchesSearch = c.nombre.toLowerCase().includes(searchClientes.toLowerCase()) ||
                            c.whatsapp.includes(searchClientes);
      const matchesExcursion = !filterClienteExcursion || c.excursionId === filterClienteExcursion;
      return matchesSearch && matchesExcursion;
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchClientes}
              onChange={(e) => setSearchClientes(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filterClienteExcursion}
            onChange={(e) => setFilterClienteExcursion(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <option value="">Todas las excursiones</option>
            {excursiones.map(e => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
          <button
            onClick={() => setShowClienteForm(true)}
            className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 shadow-lg shadow-${accentColor}-500/25`}
          >
            <span className="text-lg leading-none">+</span> Nuevo Cliente
          </button>
        </div>

        <div className={`${cardBg} backdrop-blur-lg rounded-2xl border border-white/10 overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="text-left py-3 px-4">Nombre</th>
                <th className="text-left py-3 px-4">WhatsApp</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Excursion</th>
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-white/40">
                    No hay clientes registrados
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium">{c.nombre}</td>
                    <td className="py-3 px-4 text-white/60">{c.whatsapp}</td>
                    <td className="py-3 px-4 text-white/60 text-xs">{c.email}</td>
                    <td className="py-3 px-4 text-white/80 max-w-[120px] truncate">
                      {c.excursionNombre}
                    </td>
                    <td className="py-3 px-4 text-white/60 text-xs">
                      {c.fechaExcursion ? new Date(c.fechaExcursion).toLocaleDateString("es-DO") : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteCliente(c.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs transition-all"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER PROVEEDORES
  // ============================================
  const renderProveedores = () => {
    const proveedoresFiltrados = proveedores.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchProveedores.toLowerCase()) ||
                            p.empresa.toLowerCase().includes(searchProveedores.toLowerCase());
      const matchesMetodo = filterProveedorMetodo === "todos" || 
                            p.metodosPago.includes(filterProveedorMetodo as any);
      return matchesSearch && matchesMetodo;
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar proveedores..."
              value={searchProveedores}
              onChange={(e) => setSearchProveedores(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filterProveedorMetodo}
            onChange={(e) => setFilterProveedorMetodo(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <option value="todos">Todos los metodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="paypal">PayPal</option>
          </select>
          <button
            onClick={() => {
              setEditingProveedorId(null);
              setProveedorFormData({
                nombre: "",
                empresa: "",
                telefono: "",
                email: "",
                metodosPago: [],
                banco: "",
                numeroCuenta: "",
                monedaCuenta: "RD$",
                tipoCuenta: [],
                tipoBeneficiario: "personal",
                beneficiario: "",
                documentos: "",
                nota: "",
              });
              setTempExcursiones([]);
              setShowProveedorForm(true);
            }}
            className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 shadow-lg shadow-${accentColor}-500/25`}
          >
            <span className="text-lg leading-none">+</span> Nuevo Proveedor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedoresFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12 text-white/40">
              No hay proveedores registrados
            </div>
          ) : (
            proveedoresFiltrados.map(p => (
              <div key={p.id} className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{p.nombre}</h3>
                    <p className="text-white/40 text-sm">{p.empresa || "Sin empresa"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editProveedor(p)}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-xs transition-all"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteProveedor(p.id)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <span>Telefono</span> {p.telefono || "Sin telefono"}
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <span>Email</span> {p.email || "Sin email"}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.metodosPago.map(m => (
                      <span key={m} className="px-2 py-1 bg-white/10 rounded-lg text-white/60 text-xs">
                        {m === "efectivo" ? "Efectivo" : m === "transferencia" ? "Transferencia" : "PayPal"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 text-xs text-white/40 border-t border-white/5 pt-2">
                  {excursiones.filter(e => e.proveedorId === p.id).length} excursiones
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER BANCOS
  // ============================================
  const renderBancos = () => {
    const bancosFiltrados = proveedores.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchBancos.toLowerCase()) ||
                            p.banco.toLowerCase().includes(searchBancos.toLowerCase()) ||
                            p.beneficiario.toLowerCase().includes(searchBancos.toLowerCase());
      const matchesTipo = filterBancoTipo === "todos" || p.tipoCuenta.includes(filterBancoTipo as any);
      const matchesMoneda = filterBancoMoneda === "todas" || p.monedaCuenta === filterBancoMoneda;
      const matchesBeneficiario = filterBancoBeneficiario === "todos" || p.tipoBeneficiario === filterBancoBeneficiario;
      return matchesSearch && matchesTipo && matchesMoneda && matchesBeneficiario;
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar bancos..."
              value={searchBancos}
              onChange={(e) => setSearchBancos(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filterBancoTipo}
            onChange={(e) => setFilterBancoTipo(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <option value="todos">Todos los tipos</option>
            <option value="corriente">Corriente</option>
            <option value="ahorros">Ahorros</option>
          </select>
          <select
            value={filterBancoMoneda}
            onChange={(e) => setFilterBancoMoneda(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <option value="todas">Todas las monedas</option>
            <option value="USD">USD</option>
            <option value="RD$">RD$</option>
          </select>
          <select
            value={filterBancoBeneficiario}
            onChange={(e) => setFilterBancoBeneficiario(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <option value="todos">Todos los beneficiarios</option>
            <option value="personal">Personal</option>
            <option value="empresarial">Empresarial</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bancosFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12 text-white/40">
              No hay informacion bancaria registrada
            </div>
          ) : (
            bancosFiltrados.map(p => (
              <div key={p.id} className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{p.nombre}</h3>
                    <p className="text-white/40 text-sm">{p.empresa || "Proveedor"}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs ${
                    p.tipoBeneficiario === "personal" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                  }`}>
                    {p.tipoBeneficiario === "personal" ? "Personal" : "Empresarial"}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <span>Banco</span> {p.banco || "Sin banco"}
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <span>Cuenta</span> {p.numeroCuenta || "Sin cuenta"}
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <span>Moneda</span> {p.monedaCuenta || "RD$"}
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <span>Beneficiario</span> {p.beneficiario || "Sin beneficiario"}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.tipoCuenta.map(t => (
                      <span key={t} className="px-2 py-1 bg-white/10 rounded-lg text-white/60 text-xs">
                        {t === "corriente" ? "Corriente" : "Ahorros"}
                      </span>
                    ))}
                  </div>
                  {p.documentos && (
                    <div className="text-xs text-white/40">
                      Documentos: {p.documentos}
                    </div>
                  )}
                  {p.nota && (
                    <div className="text-xs text-white/40 mt-1">
                      Nota: {p.nota}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER CALENDARIO
  // ============================================
  const renderCalendario = () => {
    const days = getDaysInMonth(currentDate);
    const monthName = getMonthName(currentDate.getMonth());
    const year = currentDate.getFullYear();

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => cambiarMes(-1)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
            >
              ◀
            </button>
            <h2 className="text-white text-xl font-bold">{monthName} {year}</h2>
            <button
              onClick={() => cambiarMes(1)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
            >
              ▶
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              Hoy
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCalendarioView("mes")}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${
                calendarioView === "mes" 
                  ? `bg-gradient-to-r ${buttonGradient} text-slate-900` 
                  : "text-white/60 hover:text-white"
              }`}
            >
              Mes
            </button>
          </div>
        </div>

        <div className={`${cardBg} backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden`}>
          <div className="grid grid-cols-7 gap-1 p-4">
            {["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"].map(day => (
              <div key={day} className="text-center text-white/40 text-sm py-2 font-medium">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const ventasDelDia = getVentasDelDia(day.date);
              const hasVentas = ventasDelDia.length > 0;
              const isToday = new Date().toDateString() === day.date.toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-2 rounded-xl border transition-all ${
                    day.isCurrentMonth 
                      ? isToday 
                        ? `border-${accentColor}-500/50 bg-${accentColor}-500/10`
                        : "border-white/5 hover:border-white/20 bg-white/5"
                      : "border-white/5 bg-white/5 opacity-40"
                  }`}
                >
                  <div className="text-xs text-white/60 text-right">
                    {day.date.getDate()}
                  </div>
                  {hasVentas && (
                    <div className="mt-1 space-y-1">
                      <div className="text-[10px] text-green-400 font-medium">
                        {formatUSD(ventasDelDia.reduce((s, v) => s + v.precioVentaUSD, 0))}
                      </div>
                      <div className="text-[10px] text-white/40">
                        {ventasDelDia.length} {ventasDelDia.length === 1 ? "venta" : "ventas"}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-4 border border-white/10`}>
          <h3 className="text-white font-semibold mb-3">Eventos del dia</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {getVentasDelDia(currentDate).length === 0 ? (
              <p className="text-white/40 text-sm text-center py-4">No hay ventas para este dia</p>
            ) : (
              getVentasDelDia(currentDate).map(v => (
                <div key={v.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">{v.clienteNombre}</p>
                    <p className="text-white/40 text-xs">{v.excursionNombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatUSD(v.precioVentaUSD)}</p>
                    <span className={`px-2 py-0.5 rounded-lg text-xs ${getEstadoColor(v.estado)}`}>
                      {getEstadoText(v.estado)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER EXCURSIONES
  // ============================================
  const renderExcursiones = () => {
    const excursionesFiltradas = excursiones.filter(e => {
      const matchesSearch = e.nombre.toLowerCase().includes(searchExcursiones.toLowerCase());
      const matchesProveedor = !filterExcursionProveedor || e.proveedorId === filterExcursionProveedor;
      return matchesSearch && matchesProveedor;
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar excursiones..."
              value={searchExcursiones}
              onChange={(e) => setSearchExcursiones(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filterExcursionProveedor}
            onChange={(e) => setFilterExcursionProveedor(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <option value="">Todos los proveedores</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          <button
            onClick={() => {
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
            }}
            className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 shadow-lg shadow-${accentColor}-500/25`}
          >
            <span className="text-lg leading-none">+</span> Nueva Excursion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {excursionesFiltradas.length === 0 ? (
            <div className="col-span-full text-center py-12 text-white/40">
              No hay excursiones registradas
            </div>
          ) : (
            excursionesFiltradas.map(e => (
              <div key={e.id} className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{e.nombre}</h3>
                    <p className="text-white/40 text-sm">{e.proveedorNombre}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editExcursion(e)}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-xs transition-all"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteExcursion(e.id)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Adulto</span>
                    <span className="text-white font-medium">{formatUSD(e.precioAdultoUSD)}</span>
                  </div>
                  {e.precioNinoUSD !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Nino</span>
                      <span className="text-white font-medium">{formatUSD(e.precioNinoUSD)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t border-white/5 pt-2 mt-2">
                    <span className="text-white/40">Costo Proveedor</span>
                    <span className="text-white/60">{formatUSD(e.costoProveedorAdultoUSD)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Comision</span>
                    <span className="text-green-400">{formatUSD(e.comisionAdultoUSD)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Zona</span>
                    <span className="text-white/60">{e.zona || "Sin zona"}</span>
                  </div>
                  {e.capacidad && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Capacidad</span>
                      <span className="text-white/60">{e.capacidad}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // FORMULARIOS MODALES
  // ============================================
  const renderFormularios = () => {
    return (
      <>
        {/* Formulario de Venta */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className={`${cardBg} backdrop-blur-2xl rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingVentaId ? "Editar Venta" : "Nueva Venta"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-white/40 hover:text-white transition-all text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Cliente */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Nombre del Cliente *</label>
                    <input
                      type="text"
                      value={formData.clienteNombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, clienteNombre: e.target.value }))}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={formData.clienteWhatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, clienteWhatsapp: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.clienteEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, clienteEmail: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Excursion */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Excursion *</label>
                    <select
                      value={formData.excursionId}
                      onChange={(e) => selectExcursionForVenta(e.target.value)}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Seleccionar excursion</option>
                      {excursiones.map(e => (
                        <option key={e.id} value={e.id}>{e.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Zona</label>
                    <input
                      type="text"
                      value={formData.zona}
                      readOnly
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Fecha y Hora */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Fecha de Excursion *</label>
                    <input
                      type="date"
                      value={formData.fechaExcursion}
                      onChange={(e) => setFormData(prev => ({ ...prev, fechaExcursion: e.target.value }))}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Hora</label>
                    <select
                      value={formData.horaExcursion}
                      onChange={(e) => setFormData(prev => ({ ...prev, horaExcursion: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    >
                      {["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"].map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Precios y Cantidades */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Precio Adulto (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precioAdultoUSD}
                      onChange={handlePrecioAdultoChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Precio Nino (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precioNinoUSD}
                      onChange={handlePrecioNinoChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Costo Proveedor (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costoProveedorAdultoUSD}
                      onChange={handleCostoAdultoChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Comision (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.comisionAdultoUSD}
                      readOnly
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-green-400 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Cant. Adultos</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.cantidadAdultos}
                      onChange={handleCantidadAdultosChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Cant. Ninos</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.cantidadNinos}
                      onChange={handleCantidadNinosChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Precio Total</label>
                    <input
                      type="text"
                      value={formData.precioTotalUSD}
                      readOnly
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-bold cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Comision Total</label>
                    <input
                      type="text"
                      value={formData.comisionTotalUSD}
                      readOnly
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-green-400 font-bold cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Pago y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Pago</label>
                    <select
                      value={formData.pagoCliente}
                      onChange={(e) => {
                        const val = e.target.value as "completo" | "deposito_25" | "pago_dia";
                        setFormData(prev => ({ ...prev, pagoCliente: val }));
                        setTimeout(() => {
                          const { precioTotal } = calcularTotalesVenta();
                          let saldo = 0;
                          if (val === "completo") saldo = 0;
                          else if (val === "deposito_25") saldo = precioTotal * 0.75;
                          else if (val === "pago_dia") saldo = precioTotal;
                          setFormData(prev => ({
                            ...prev,
                            saldoPendienteUSD: saldo.toFixed(2)
                          }));
                        }, 10);
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="completo">Pago Completo</option>
                      <option value="deposito_25">Deposito 25%</option>
                      <option value="pago_dia">Pago el Dia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Monto Pagado (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.montoPagadoUSD}
                      onChange={(e) => setFormData(prev => ({ ...prev, montoPagadoUSD: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Saldo Pendiente (USD)</label>
                    <input
                      type="text"
                      value={formData.saldoPendienteUSD}
                      readOnly
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-yellow-400 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Metodo Pago Cliente</label>
                    <select
                      value={formData.metodoPagoCliente}
                      onChange={(e) => setFormData(prev => ({ ...prev, metodoPagoCliente: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Proveedor</label>
                    <input
                      type="text"
                      value={formData.proveedorNombre}
                      readOnly
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Servicio y Recogida */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Servicio</label>
                    <select
                      value={formData.tipoServicio}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipoServicio: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="compartido">Compartido</option>
                      <option value="privado">Privado</option>
                      <option value="grupo">Grupo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Nombre del Grupo</label>
                    <input
                      type="text"
                      value={formData.nombreGrupo}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombreGrupo: e.target.value }))}
                      disabled={formData.tipoServicio !== "grupo"}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Recogida</label>
                    <select
                      value={formData.tipoRecogida}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipoRecogida: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="hotel">Hotel</option>
                      <option value="airbnb">Airbnb</option>
                      <option value="sin_recogida">Sin Recogida</option>
                    </select>
                  </div>
                </div>

                {/* Transporte y Nota */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Transporte</label>
                    <select
                      value={formData.transporte}
                      onChange={(e) => setFormData(prev => ({ ...prev, transporte: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="no">No</option>
                      <option value="si">Si</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Nota</label>
                    <input
                      type="text"
                      value={formData.nota}
                      onChange={(e) => setFormData(prev => ({ ...prev, nota: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className={`flex-1 bg-gradient-to-r ${buttonGradient} text-slate-900 py-3 rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg shadow-${accentColor}-500/25`}
                  >
                    {editingVentaId ? "Actualizar Venta" : "Registrar Venta"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-white/10 text-white/60 rounded-xl hover:bg-white/20 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Formulario de Cliente */}
        {showClienteForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`${cardBg} backdrop-blur-2xl rounded-3xl p-8 max-w-lg w-full border border-white/20`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Nuevo Cliente</h2>
                <button
                  onClick={() => setShowClienteForm(false)}
                  className="text-white/40 hover:text-white transition-all text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleClienteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    name="whatsapp"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Excursion</label>
                  <select
                    name="excursionId"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Seleccionar excursion</option>
                    {excursiones.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Fecha Excursion</label>
                  <input
                    type="date"
                    name="fechaExcursion"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className={`flex-1 bg-gradient-to-r ${buttonGradient} text-slate-900 py-3 rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg shadow-${accentColor}-500/25`}
                  >
                    Agregar Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClienteForm(false)}
                    className="px-6 py-3 bg-white/10 text-white/60 rounded-xl hover:bg-white/20 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Formulario de Proveedor */}
        {showProveedorForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className={`${cardBg} backdrop-blur-2xl rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingProveedorId ? "Editar Proveedor" : "Nuevo Proveedor"}
                </h2>
                <button
                  onClick={() => {
                    setShowProveedorForm(false);
                    setEditingProveedorId(null);
                  }}
                  className="text-white/40 hover:text-white transition-all text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleProveedorSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Nombre *</label>
                    <input
                      type="text"
                      value={proveedorFormData.nombre}
                      onChange={(e) => setProveedorFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Empresa</label>
                    <input
                      type="text"
                      value={proveedorFormData.empresa}
                      onChange={(e) => setProveedorFormData(prev => ({ ...prev, empresa: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Telefono</label>
                    <input
                      type="text"
                      value={proveedorFormData.telefono}
                      onChange={(e) => setProveedorFormData(prev => ({ ...prev, telefono: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                    <input
                      type="email"
                      value={proveedorFormData.email}
                      onChange={(e) => setProveedorFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Metodos de Pago</label>
                  <div className="flex flex-wrap gap-2">
                    {["efectivo", "transferencia", "paypal"].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMetodoPago(m as any)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all ${
                          proveedorFormData.metodosPago.includes(m as any)
                            ? `bg-gradient-to-r ${buttonGradient} text-slate-900`
                            : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                      >
                        {m === "efectivo" ? "Efectivo" : m === "transferencia" ? "Transferencia" : "PayPal"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Banco</label>
                    <input
                      type="text"
                      value={proveedorFormData.banco}
                      onChange={(e) => setProveedorFormData(prev => ({ ...prev, banco: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Numero de Cuenta</label>
                    <input
                      type="text"
                      value={proveedorFormData.numeroCuenta}
                      onChange={(e) => setProveedorFormData(prev => ({ ...prev, numeroCuenta: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Moneda</label>
                    <select
                      value={proveedorFormData.monedaCuenta}
                      onChange={(e) => setProveedorFormData(prev => ({ ...prev, monedaCuenta: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="USD">USD</option>
                      <option value="RD$">RD$</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Cuenta</label>
                    <div className="flex gap-2">
                      {["corriente", "ahorros"].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTipoCuenta(t as any)}
                          className={`px-4 py-2 rounded-xl text-sm transition-all flex-1 ${
                            proveedorFormData.tipoCuenta.includes(t as any)
                              ? `bg-gradient-to-r ${buttonGradient} text-slate-900`
                              : "bg-white/10 text-white/60 hover:bg-white/20"
                          }`}
                        >
                          {t === "corriente" ? "Corriente" : "Ahorros"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Beneficiario</label>
                    <select
                      value={proveedorFormData.tipoBeneficiario}
                      onChange={(e) => setProveedorFormData(prev => ({ ...prev, tipoBeneficiario: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="personal">Personal</option>
                      <option value="empresarial">Empresarial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Beneficiario</label>
                    <input
                      type="text"
                      value={proveedorFormData.beneficiario}
                      onChange={(e) => setProveedorFormData(prev => ({ ...prev, beneficiario: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Documentos</label>
                  <input
                    type="text"
                    value={proveedorFormData.documentos}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, documentos: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Nota</label>
                  <input
                    type="text"
                    value={proveedorFormData.nota}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, nota: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className={`flex-1 bg-gradient-to-r ${buttonGradient} text-slate-900 py-3 rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg shadow-${accentColor}-500/25`}
                  >
                    {editingProveedorId ? "Actualizar Proveedor" : "Agregar Proveedor"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProveedorForm(false);
                      setEditingProveedorId(null);
                    }}
                    className="px-6 py-3 bg-white/10 text-white/60 rounded-xl hover:bg-white/20 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Formulario de Excursion */}
        {showExcursionForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className={`${cardBg} backdrop-blur-2xl rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingExcursionId ? "Editar Excursion" : "Nueva Excursion"}
                </h2>
                <button
                  onClick={() => {
                    setShowExcursionForm(false);
                    setEditingExcursionId(null);
                  }}
                  className="text-white/40 hover:text-white transition-all text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleExcursionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={excursionFormData.nombre}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Proveedor *</label>
                  <select
                    value={excursionFormData.proveedorId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const proveedor = proveedores.find(p => p.id === id);
                      setExcursionFormData(prev => ({
                        ...prev,
                        proveedorId: id,
                        proveedorNombre: proveedor?.nombre || ""
                      }));
                    }}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Precio Adulto (USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={excursionFormData.precioAdultoUSD}
                      onChange={(e) => setExcursionFormData(prev => ({ ...prev, precioAdultoUSD: e.target.value }))}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Costo Proveedor Adulto (USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={excursionFormData.costoProveedorAdultoUSD}
                      onChange={(e) => setExcursionFormData(prev => ({ ...prev, costoProveedorAdultoUSD: e.target.value }))}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={excursionFormData.tienePrecioNino}
                    onChange={(e) => setExcursionFormData(prev => ({
                      ...prev,
                      tienePrecioNino: e.target.checked
                    }))}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <label className="text-white/70 text-sm">Tiene precio para ninos</label>
                </div>

                {excursionFormData.tienePrecioNino && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Precio Nino (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={excursionFormData.precioNinoUSD}
                        onChange={(e) => setExcursionFormData(prev => ({ ...prev, precioNinoUSD: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Costo Proveedor Nino (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={excursionFormData.costoProveedorNinoUSD}
                        onChange={(e) => setExcursionFormData(prev => ({ ...prev, costoProveedorNinoUSD: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Zona</label>
                    <select
                      value={excursionFormData.zona}
                      onChange={(e) => setExcursionFormData(prev => ({ ...prev, zona: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Seleccionar zona</option>
                      {ZONAS_PUNTA_CANA.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Capacidad</label>
                    <input
                      type="text"
                      value={excursionFormData.capacidad}
                      onChange={(e) => setExcursionFormData(prev => ({ ...prev, capacidad: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className={`flex-1 bg-gradient-to-r ${buttonGradient} text-slate-900 py-3 rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg shadow-${accentColor}-500/25`}
                  >
                    {editingExcursionId ? "Actualizar Excursion" : "Agregar Excursion"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExcursionForm(false);
                      setEditingExcursionId(null);
                    }}
                    className="px-6 py-3 bg-white/10 text-white/60 rounded-xl hover:bg-white/20 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  // ============================================
  // RENDER PRINCIPAL (continuación)
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
                  {currentUser === "republic" ? "Administrador" : currentUser === "raul" ? "Vendedor" : "Vendedora"} - {getUserRole()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 ${isAdmin ? 'bg-amber-500/10 border-amber-500/20' : isRaul ? 'bg-blue-500/10 border-blue-500/20' : 'bg-pink-500/20 border-pink-500/20'} rounded-xl border`}>
                <span className={`text-sm ${isAdmin ? 'text-amber-400' : isRaul ? 'text-blue-400' : 'text-pink-300'} font-medium`}>
                  {isAdmin ? "Admin" : "Vendedor"}
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
                zona: "",
              });
              setShowForm(true);
            }} 
            className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-${accentColor}-500/25`}
          >
            <span className="text-lg leading-none">+</span> Nueva Venta
          </button>
        </div>

        {renderView()}
        {renderFormularios()}
      </main>
    </div>
  );
}
