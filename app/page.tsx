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
  rncCedula: string;
  tipoDocumento: "rnc" | "cedula";
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
// LISTAS
// ============================================
const ZONAS = [
  "Bavaro", "Punta Cana Village", "Cap Cana", "Uvero Alto",
  "Cabeza de Toro", "El Cortecito", "Los Corales", "Bibijagua",
  "Arena Gorda", "Melia", "Riu", "Hard Rock", "Iberostar",
  "Bahia Principe", "Sirenis", "Dreams", "Excellence",
  "San Juan", "Veron", "La Otra Banda", "Playa Bavaro"
];

const BANCOS = [
  "Banco BHD", "Banreservas", "Banco Popular Dominicano",
  "Scotiabank", "Banco Santa Cruz", "Banco Vimenca",
  "Banco ADOPEM", "Banco Caribe", "Bancamerica",
  "Banco Activo", "Banfondesa", "Banco BDI",
  "Banco Promerica", "Banco Lafise", "Banesco"
];

const HORAS = [
  "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM",
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
  "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM",
  "10:00 PM"
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

  const [searchClientes, setSearchClientes] = useState("");
  const [filterClienteExcursion, setFilterClienteExcursion] = useState("");

  const [searchProveedores, setSearchProveedores] = useState("");
  const [filterProveedorMetodo, setFilterProveedorMetodo] = useState("todos");

  const [searchExcursiones, setSearchExcursiones] = useState("");
  const [filterExcursionProveedor, setFilterExcursionProveedor] = useState("");

  const [searchBancos, setSearchBancos] = useState("");
  const [filterBancoTipo, setFilterBancoTipo] = useState("todos");
  const [filterBancoMoneda, setFilterBancoMoneda] = useState("todas");

  const [searchReservas, setSearchReservas] = useState("");
  const [filterReservaEstado, setFilterReservaEstado] = useState("todas");
  const [filterReservaFecha, setFilterReservaFecha] = useState("");

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
    rncCedula: "",
    tipoDocumento: "cedula" as "rnc" | "cedula",
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
  // FUNCIONES DE FORMATO
  // ============================================
  const formatearTelefono = (telefono: string) => {
    const numeros = telefono.replace(/\D/g, '');
    if (numeros.length === 10) {
      return `(${numeros.slice(0, 3)}) ${numeros.slice(3, 6)}-${numeros.slice(6, 10)}`;
    }
    return numeros;
  };

  const manejarCambioTelefono = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const numeros = valor.replace(/\D/g, '');
    const numerosLimitados = numeros.slice(0, 10);
    const telefonoFormateado = formatearTelefono(numerosLimitados);
    setProveedorFormData(prev => ({
      ...prev,
      telefono: telefonoFormateado
    }));
  };

  const formatearRNC = (rnc: string) => {
    const numeros = rnc.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 9) {
      return `${numeros.slice(0, 2)}-${numeros.slice(2)}`;
    }
    return `${numeros.slice(0, 2)}-${numeros.slice(2, 9)}-${numeros.slice(9, 10)}`;
  };

  const formatearCedula = (cedula: string) => {
    const numeros = cedula.replace(/\D/g, '');
    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 10) {
      return `${numeros.slice(0, 3)}-${numeros.slice(3)}`;
    }
    return `${numeros.slice(0, 3)}-${numeros.slice(3, 10)}-${numeros.slice(10, 11)}`;
  };

  const manejarCambioRNCcedula = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const numeros = valor.replace(/\D/g, '');
    
    let formateado = numeros;
    if (proveedorFormData.tipoDocumento === "rnc") {
      const numerosLimitados = numeros.slice(0, 11);
      formateado = formatearRNC(numerosLimitados);
    } else {
      const numerosLimitados = numeros.slice(0, 11);
      formateado = formatearCedula(numerosLimitados);
    }
    
    setProveedorFormData(prev => ({
      ...prev,
      rncCedula: formateado
    }));
  };

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
    const savedVentas = localStorage.getItem("excursiones_ventas_v31");
    const savedClientes = localStorage.getItem("excursiones_clientes_v31");
    const savedProveedores = localStorage.getItem("excursiones_proveedores_v31");
    const savedExcursiones = localStorage.getItem("excursiones_excursiones_v31");
    
    if (savedVentas) setVentas(JSON.parse(savedVentas));
    if (savedClientes) setClientes(JSON.parse(savedClientes));
    if (savedProveedores) setProveedores(JSON.parse(savedProveedores));
    if (savedExcursiones) setExcursiones(JSON.parse(savedExcursiones));
  }, []);

  const saveVentas = (data: Venta[]) => {
    setVentas(data);
    localStorage.setItem("excursiones_ventas_v31", JSON.stringify(data));
  };

  const saveClientes = (data: Cliente[]) => {
    setClientes(data);
    localStorage.setItem("excursiones_clientes_v31", JSON.stringify(data));
  };

  const saveProveedores = (data: Proveedor[]) => {
    setProveedores(data);
    localStorage.setItem("excursiones_proveedores_v31", JSON.stringify(data));
  };

  const saveExcursiones = (data: Excursion[]) => {
    setExcursiones(data);
    localStorage.setItem("excursiones_excursiones_v31", JSON.stringify(data));
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
        rncCedula: "",
        tipoDocumento: "cedula",
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
              monedaCuenta: proveedorFormData.monedaCuenta,
              tipoCuenta: proveedorFormData.tipoCuenta,
              tipoBeneficiario: proveedorFormData.tipoBeneficiario,
              beneficiario: proveedorFormData.beneficiario,
              rncCedula: proveedorFormData.rncCedula,
              tipoDocumento: proveedorFormData.tipoDocumento,
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
      rncCedula: "",
      tipoDocumento: "cedula",
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
      rncCedula: proveedor.rncCedula || "",
      tipoDocumento: proveedor.tipoDocumento || "cedula",
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
  // MANEJAR METODOS DE PAGO
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
      excursionNombre: excursion?.nombre || "Sin excursion asignada",
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
  // HANDLE CAMBIOS
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
  // LOGIN MODERNO
  // ============================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl shadow-black/30">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                <span className="text-3xl font-bold text-slate-900">RE</span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-4 tracking-tight">Republic Excursions</h1>
              <p className="text-white/40 text-sm mt-1">Sistema de Gestion de Excursiones</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 bg-white/5 rounded-2xl p-2 border border-white/5">
              <div className="text-center p-2 rounded-xl bg-white/5">
                <div className="text-white/50 text-xs">Hora</div>
                <div className="text-white font-mono text-sm font-bold">
                  {currentTime.toLocaleTimeString("es-DO", { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-center p-2 rounded-xl bg-white/5">
                <div className="text-white/50 text-xs">Fecha</div>
                <div className="text-white text-sm font-medium">
                  {currentTime.toLocaleDateString("es-DO", { day: '2-digit', month: 'short' })}
                </div>
              </div>
              <div className="text-center p-2 rounded-xl bg-white/5">
                <div className="text-white/50 text-xs">Dia</div>
                <div className="text-white text-sm font-medium">
                  {currentTime.toLocaleDateString("es-DO", { weekday: 'short' })}
                </div>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const username = formData.get("username") as string;
              const password = formData.get("password") as string;
              handleLogin(username, password);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Usuario</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">👤</span>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/30 transition-all"
                    placeholder="Ingresa tu usuario"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Contraseña</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔒</span>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/30 transition-all"
                    placeholder="Ingresa tu contraseña"
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
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 py-3.5 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all shadow-lg shadow-amber-500/25"
              >
                Iniciar Sesion
              </button>
            </form>

            <div className="mt-6 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex flex-wrap justify-center gap-2 text-xs text-white/30">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Republic
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Raul
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                  Gabrielle
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-[10px] text-white/20">v3.1 • Republic Excursions © 2026</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ESTILOS DIFERENCIADOS POR USUARIO
  // ============================================
  const isAdmin = currentUser === "republic";
  const isRaul = currentUser === "raul";
  const isGabrielle = currentUser === "gabrielle";
  
  const themes = {
    admin: {
      bg: "from-gray-950 via-slate-900 to-gray-950",
      accent: "amber",
      accentLight: "amber-400",
      gradient: "from-amber-400 to-yellow-500",
      header: "bg-black/40",
      card: "bg-white/5",
      shadow: "shadow-amber-500/30",
      border: "border-amber-500/30",
      text: "text-amber-400",
      bgHover: "hover:bg-amber-500/10",
      glow: "shadow-amber-500/20",
      cardBorder: "border-amber-500/20",
      badge: "bg-amber-500/20 text-amber-400",
      iconBg: "bg-amber-500/10",
    },
    raul: {
      bg: "from-cyan-950 via-blue-950 to-indigo-950",
      accent: "cyan",
      accentLight: "cyan-400",
      gradient: "from-cyan-400 to-blue-500",
      header: "bg-white/10 backdrop-blur-xl",
      card: "bg-white/10 backdrop-blur-xl",
      shadow: "shadow-cyan-500/30",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      bgHover: "hover:bg-cyan-500/10",
      glow: "shadow-cyan-500/20",
      cardBorder: "border-cyan-500/20",
      badge: "bg-cyan-500/20 text-cyan-400",
      iconBg: "bg-cyan-500/10",
    },
    gabrielle: {
      bg: "from-pink-950 via-rose-950 to-fuchsia-950",
      accent: "pink",
      accentLight: "pink-300",
      gradient: "from-pink-400 to-rose-500",
      header: "bg-white/10 backdrop-blur-xl",
      card: "bg-white/10 backdrop-blur-xl",
      shadow: "shadow-pink-500/30",
      border: "border-pink-500/30",
      text: "text-pink-300",
      bgHover: "hover:bg-pink-500/10",
      glow: "shadow-pink-500/20",
      cardBorder: "border-pink-500/20",
      badge: "bg-pink-500/20 text-pink-300",
      iconBg: "bg-pink-500/10",
    }
  };

  const theme = isAdmin ? themes.admin : isRaul ? themes.raul : themes.gabrielle;
  const bgGradient = theme.bg;
  const accentColor = theme.accent;
  const accentLight = theme.accentLight;
  const headerBg = theme.header;
  const cardBg = theme.card;
  const buttonGradient = theme.gradient;
  const shadowColor = theme.shadow;
  const accentText = theme.text;
  const cardBorder = theme.cardBorder;
  const badgeStyle = theme.badge;
  const iconBg = theme.iconBg;

  const getUserRole = () => {
    if (isAdmin) return "Administrador";
    if (isRaul) return "Vendedor";
    if (isGabrielle) return "Vendedora";
    return "Usuario";
  };

  const getUserEmoji = () => {
    if (isAdmin) return "👑";
    if (isRaul) return "💼";
    if (isGabrielle) return "✨";
    return "👤";
  };

  // ============================================
  // FUNCION PARA RENDERIZAR VISTAS
  // ============================================
  const renderView = () => {
    switch(viewMode) {
      case "dashboard": return renderDashboard();
      case "ventas": return renderVentas();
      case "reservas": return renderReservas();
      case "clientes": return renderClientes();
      case "proveedores": return renderProveedores();
      case "bancos": return renderBancos();
      case "calendario": return renderCalendario();
      case "excursiones": return renderExcursiones();
      default: return renderDashboard();
    }
  };

  // ============================================
  // RENDER DASHBOARD
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

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
            <p className="text-white/40 text-sm">{getUserEmoji()} {getUserRole()} - {currentUser}</p>
          </div>
          <div className={`${cardBg} rounded-2xl px-6 py-3 border ${cardBorder} text-center`}>
            <div className={`text-${accentLight} text-sm font-mono font-bold`}>
              {currentTime.toLocaleTimeString("es-DO", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-white/30 text-xs">
              {currentTime.toLocaleDateString("es-DO", { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${cardBg} rounded-2xl p-6 border ${cardBorder} transition-all ${theme.bgHover} relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-${accentColor}-500/10 blur-2xl`}></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-sm">Total Ventas</p>
                <p className="text-white text-2xl font-bold">{formatUSD(totalVentas)}</p>
              </div>
              <div className={`${iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${cardBorder}`}>$</div>
            </div>
          </div>
          
          <div className={`${cardBg} rounded-2xl p-6 border ${cardBorder} transition-all ${theme.bgHover} relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-green-500/10 blur-2xl`}></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-sm">Comisiones</p>
                <p className="text-white text-2xl font-bold">{formatUSD(totalComisiones)}</p>
              </div>
              <div className="bg-green-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-green-500/30">%</div>
            </div>
          </div>
          
          <div className={`${cardBg} rounded-2xl p-6 border ${cardBorder} transition-all ${theme.bgHover} relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-yellow-500/10 blur-2xl`}></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-sm">Por Cobrar</p>
                <p className="text-white text-2xl font-bold">{formatUSD(totalPendiente)}</p>
              </div>
              <div className="bg-yellow-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-yellow-500/30">!</div>
            </div>
          </div>
          
          <div className={`${cardBg} rounded-2xl p-6 border ${cardBorder} transition-all ${theme.bgHover} relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-blue-500/10 blur-2xl`}></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-sm">Clientes</p>
                <p className="text-white text-2xl font-bold">{totalClientes}</p>
              </div>
              <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-blue-500/30">👥</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${cardBg} rounded-2xl p-6 border ${cardBorder}`}>
            <h3 className={`text-sm font-semibold ${accentText} mb-3`}>Resumen de Ventas</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Hoy</span>
                <span className="text-white font-medium">{formatUSD(ventasHoy.reduce((s, v) => s + v.precioVentaUSD, 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Pendientes</span>
                <span className="text-yellow-400">{ventas.filter(v => v.estado === "pendiente").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Confirmadas</span>
                <span className="text-blue-400">{ventas.filter(v => v.estado === "confirmada").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Completadas</span>
                <span className="text-green-400">{ventas.filter(v => v.estado === "completada").length}</span>
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl p-6 border ${cardBorder}`}>
            <h3 className={`text-sm font-semibold ${accentText} mb-3`}>Resumen General</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Excursiones</span>
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

          <div className={`${cardBg} rounded-2xl p-6 border ${cardBorder}`}>
            <h3 className={`text-sm font-semibold ${accentText} mb-3`}>Ultimas Ventas</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {ventas.slice(-4).reverse().map(v => (
                <div key={v.id} className="flex justify-between text-sm border-b border-white/5 pb-1">
                  <span className="text-white/60 truncate max-w-[120px]">{v.clienteNombre}</span>
                  <span className="text-white font-medium">{formatUSD(v.precioVentaUSD)}</span>
                </div>
              ))}
              {ventas.length === 0 && (
                <p className="text-white/40 text-sm text-center py-2">No hay ventas registradas</p>
              )}
            </div>
          </div>
        </div>

        {ventas.length === 0 && (
          <div className={`${cardBg} rounded-2xl p-12 border-2 border-dashed ${cardBorder} text-center`}>
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-white text-xl font-semibold mb-2">Comienza tu primera venta</h3>
            <p className="text-white/40 text-sm">Haz clic en "Nueva Venta" para registrar tu primera excursion</p>
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
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Todos los años</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => { setSearchTerm(""); setFilterYear(""); }} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all">
            Limpiar
          </button>
          <button onClick={exportCSV} className="px-4 py-2.5 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-all">
            Exportar CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`${cardBg} rounded-2xl p-4 border ${cardBorder}`}>
            <p className="text-white/40 text-sm">Total Ventas</p>
            <p className="text-white text-2xl font-bold">{formatUSD(totalVentasUSD)}</p>
          </div>
          <div className={`${cardBg} rounded-2xl p-4 border ${cardBorder}`}>
            <p className="text-white/40 text-sm">Comision Total</p>
            <p className="text-green-400 text-2xl font-bold">{formatUSD(totalComision)}</p>
          </div>
          <div className={`${cardBg} rounded-2xl p-4 border ${cardBorder}`}>
            <p className="text-white/40 text-sm">Pendiente Cobrar</p>
            <p className="text-yellow-400 text-2xl font-bold">{formatUSD(totalPendienteUSD)}</p>
          </div>
        </div>

        <div className="space-y-2">
          {groupedArray.length === 0 ? (
            <div className={`${cardBg} rounded-2xl p-12 border ${cardBorder} text-center`}>
              <p className="text-white/40">No hay ventas registradas</p>
            </div>
          ) : (
            groupedArray.map((group: any) => (
              <div key={group.key} className={`${cardBg} rounded-2xl border ${cardBorder} overflow-hidden`}>
                <button onClick={() => toggleMonth(group.key)} className="w-full px-6 py-4 flex flex-wrap items-center justify-between hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-semibold text-lg">{getMonthName(group.month - 1)} {group.year}</span>
                    <span className="text-white/40 text-sm">{group.ventas.length} ventas</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-white font-bold">{formatUSD(group.totalUSD)}</span>
                    <span className="text-green-400 text-sm">{formatUSD(group.totalComision)}</span>
                    <span className={`transform transition-transform ${expandedMonth === group.key ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                </button>
                {expandedMonth === group.key && (
                  <div className="px-6 pb-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-white/40 border-b border-white/10">
                          <th className="text-left py-2 px-2">Fecha</th>
                          <th className="text-left py-2 px-2">Hora</th>
                          <th className="text-left py-2 px-2">Cliente</th>
                          <th className="text-left py-2 px-2">Excursion</th>
                          <th className="text-left py-2 px-2">Adultos</th>
                          <th className="text-left py-2 px-2">Niños</th>
                          <th className="text-right py-2 px-2">Precio</th>
                          <th className="text-right py-2 px-2">Comision</th>
                          <th className="text-left py-2 px-2">Estado</th>
                          <th className="text-left py-2 px-2">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.ventas.map((venta: Venta) => (
                          <tr key={venta.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-2 px-2 text-white/60 text-xs">{new Date(venta.fechaExcursion).toLocaleDateString("es-DO")}</td>
                            <td className="py-2 px-2 text-white/60 text-xs">{venta.horaExcursion}</td>
                            <td className="py-2 px-2 text-white">{venta.clienteNombre}</td>
                            <td className="py-2 px-2 text-white/80 text-xs max-w-[100px] truncate">{venta.excursionNombre}</td>
                            <td className="py-2 px-2 text-white/60">{venta.cantidadAdultos}</td>
                            <td className="py-2 px-2 text-white/60">{venta.cantidadNinos || 0}</td>
                            <td className="py-2 px-2 text-right text-white font-medium">{formatUSD(venta.precioVentaUSD)}</td>
                            <td className="py-2 px-2 text-right text-green-400">{formatUSD(venta.comisionUSD)}</td>
                            <td className="py-2 px-2">
                              <span className={`px-2 py-1 rounded-lg text-xs ${getEstadoColor(venta.estado)}`}>
                                {getEstadoText(venta.estado)}
                              </span>
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex gap-1">
                                <button onClick={() => editVenta(venta)} className={`px-2 py-1 ${badgeStyle} rounded-lg hover:bg-${accentColor}-500/30 text-xs transition-all`}>Editar</button>
                                <button onClick={() => deleteVenta(venta.id)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs transition-all">Eliminar</button>
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
  // RENDER RESERVAS
  // ============================================
  const renderReservas = () => {
    const reservasFiltradas = ventas.filter(v => {
      const matchesSearch = v.clienteNombre.toLowerCase().includes(searchReservas.toLowerCase()) ||
                            v.excursionNombre.toLowerCase().includes(searchReservas.toLowerCase());
      const matchesEstado = filterReservaEstado === "todas" || v.estado === filterReservaEstado;
      const matchesFecha = !filterReservaFecha || v.fechaExcursion === filterReservaFecha;
      return matchesSearch && matchesEstado && matchesFecha;
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar reservas..."
              value={searchReservas}
              onChange={(e) => setSearchReservas(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filterReservaEstado}
            onChange={(e) => setFilterReservaEstado(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
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
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
          />
          <button onClick={() => { setSearchReservas(""); setFilterReservaEstado("todas"); setFilterReservaFecha(""); }} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all">
            Limpiar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`${cardBg} rounded-2xl p-4 border ${cardBorder}`}>
            <p className="text-white/40 text-sm">Total Reservas</p>
            <p className="text-white text-2xl font-bold">{reservasFiltradas.length}</p>
          </div>
          <div className={`${cardBg} rounded-2xl p-4 border ${cardBorder}`}>
            <p className="text-white/40 text-sm">Monto Total</p>
            <p className="text-white text-2xl font-bold">{formatUSD(reservasFiltradas.reduce((s, v) => s + v.precioVentaUSD, 0))}</p>
          </div>
          <div className={`${cardBg} rounded-2xl p-4 border ${cardBorder}`}>
            <p className="text-white/40 text-sm">Pendientes</p>
            <p className="text-yellow-400 text-2xl font-bold">{reservasFiltradas.filter(v => v.estado === "pendiente").length}</p>
          </div>
        </div>

        <div className={`${cardBg} rounded-2xl border ${cardBorder} overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Hora</th>
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
                <tr><td colSpan={8} className="text-center py-8 text-white/40">No hay reservas</td></tr>
              ) : (
                reservasFiltradas.map(v => (
                  <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white/60 text-xs">{new Date(v.fechaExcursion).toLocaleDateString("es-DO")}</td>
                    <td className="py-3 px-4 text-white/60 text-xs">{v.horaExcursion}</td>
                    <td className="py-3 px-4 text-white font-medium">{v.clienteNombre}</td>
                    <td className="py-3 px-4 text-white/80 max-w-[150px] truncate">{v.excursionNombre}</td>
                    <td className="py-3 px-4 text-white/60 text-xs">
                      <div>{v.clienteWhatsapp}</div>
                      <div className="text-xs text-white/40">{v.clienteEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-white font-medium">{formatUSD(v.precioVentaUSD)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-lg text-xs ${getEstadoColor(v.estado)}`}>
                        {getEstadoText(v.estado)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => editVenta(v)} className={`px-3 py-1 ${badgeStyle} rounded-lg hover:bg-${accentColor}-500/30 text-xs transition-all`}>Editar</button>
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
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filterClienteExcursion}
            onChange={(e) => setFilterClienteExcursion(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <option value="">Todas las excursiones</option>
            {excursiones.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
          <button onClick={() => setShowClienteForm(true)} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2.5 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 ${shadowColor}`}>
            <span className="text-lg leading-none">+</span> Nuevo Cliente
          </button>
        </div>

        <div className={`${cardBg} rounded-2xl border ${cardBorder} overflow-x-auto`}>
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
                <tr><td colSpan={6} className="text-center py-8 text-white/40">No hay clientes registrados</td></tr>
              ) : (
                clientesFiltrados.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium">{c.nombre}</td>
                    <td className="py-3 px-4 text-white/60">{c.whatsapp}</td>
                    <td className="py-3 px-4 text-white/60 text-xs">{c.email}</td>
                    <td className="py-3 px-4 text-white/80 max-w-[120px] truncate">{c.excursionNombre}</td>
                    <td className="py-3 px-4 text-white/60 text-xs">{c.fechaExcursion ? new Date(c.fechaExcursion).toLocaleDateString("es-DO") : "-"}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => deleteCliente(c.id)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs transition-all">Eliminar</button>
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
      const matchesMetodo = filterProveedorMetodo === "todos" || p.metodosPago.includes(filterProveedorMetodo as any);
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
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filterProveedorMetodo}
            onChange={(e) => setFilterProveedorMetodo(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <option value="todos">Todos los métodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="paypal">PayPal</option>
          </select>
          <button onClick={() => { setEditingProveedorId(null); setProveedorFormData({ nombre: "", empresa: "", telefono: "", email: "", metodosPago: [], banco: "", numeroCuenta: "", monedaCuenta: "RD$", tipoCuenta: [], tipoBeneficiario: "personal", beneficiario: "", rncCedula: "", tipoDocumento: "cedula" }); setTempExcursiones([]); setShowProveedorForm(true); }} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2.5 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 ${shadowColor}`}>
            <span className="text-lg leading-none">+</span> Nuevo Proveedor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedoresFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12 text-white/40">No hay proveedores registrados</div>
          ) : (
            proveedoresFiltrados.map(p => (
              <div key={p.id} className={`${cardBg} rounded-2xl p-6 border ${cardBorder} hover:border-${accentColor}-500/50 transition-all relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-${accentColor}-500/5 blur-2xl`}></div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{p.nombre}</h3>
                    <p className="text-white/40 text-sm">{p.empresa || "Sin empresa"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editProveedor(p)} className={`px-3 py-1 ${badgeStyle} rounded-lg hover:bg-${accentColor}-500/30 text-xs transition-all`}>Editar</button>
                    <button onClick={() => deleteProveedor(p.id)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs transition-all">Eliminar</button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-white/60"><span>Teléfono</span> {p.telefono || "Sin teléfono"}</div>
                  <div className="flex items-center gap-2 text-white/60"><span>Email</span> {p.email || "Sin email"}</div>
                  <div className="flex items-center gap-2 text-white/60"><span>RNC/Cédula</span> {p.rncCedula || "Sin documento"}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.metodosPago.map(m => <span key={m} className={`px-2 py-1 ${badgeStyle} rounded-lg text-xs`}>{m === "efectivo" ? "Efectivo" : m === "transferencia" ? "Transferencia" : "PayPal"}</span>)}
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
      return matchesSearch && matchesTipo && matchesMoneda;
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
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filterBancoTipo}
            onChange={(e) => setFilterBancoTipo(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <option value="todos">Todos los tipos</option>
            <option value="corriente">Corriente</option>
            <option value="ahorros">Ahorros</option>
          </select>
          <select
            value={filterBancoMoneda}
            onChange={(e) => setFilterBancoMoneda(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <option value="todas">Todas las monedas</option>
            <option value="USD">USD</option>
            <option value="RD$">RD$</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bancosFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12 text-white/40">No hay información bancaria registrada</div>
          ) : (
            bancosFiltrados.map(p => (
              <div key={p.id} className={`${cardBg} rounded-2xl p-6 border ${cardBorder} hover:border-${accentColor}-500/50 transition-all`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{p.nombre}</h3>
                    <p className="text-white/40 text-sm">{p.empresa || "Proveedor"}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs ${p.tipoBeneficiario === "personal" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                    {p.tipoBeneficiario === "personal" ? "Personal" : "Empresarial"}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/60"><span>Banco</span> {p.banco || "Sin banco"}</div>
                  <div className="flex items-center gap-2 text-white/60"><span>Cuenta</span> {p.numeroCuenta || "Sin cuenta"}</div>
                  <div className="flex items-center gap-2 text-white/60"><span>Moneda</span> {p.monedaCuenta || "RD$"}</div>
                  <div className="flex items-center gap-2 text-white/60"><span>Beneficiario</span> {p.beneficiario || "Sin beneficiario"}</div>
                  <div className="flex items-center gap-2 text-white/60"><span>RNC/Cédula</span> {p.rncCedula || "Sin documento"}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.tipoCuenta.map(t => <span key={t} className={`px-2 py-1 ${badgeStyle} rounded-lg text-xs`}>{t === "corriente" ? "Corriente" : "Ahorros"}</span>)}
                  </div>
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

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button onClick={() => cambiarMes(-1)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">◀</button>
            <h2 className="text-white text-xl font-bold">{getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}</h2>
            <button onClick={() => cambiarMes(1)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">▶</button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">Hoy</button>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg">● Ventas</span>
          </div>
        </div>

        <div className={`${cardBg} rounded-2xl border ${cardBorder} overflow-hidden`}>
          <div className="grid grid-cols-7 gap-0">
            {["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"].map(day => (
              <div key={day} className="py-3 px-2 text-center text-white/40 text-sm font-medium border-b border-white/5">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const ventasDelDia = getVentasDelDia(day.date);
              const isToday = day.date.getDate() === new Date().getDate() &&
                              day.date.getMonth() === new Date().getMonth() &&
                              day.date.getFullYear() === new Date().getFullYear();
              
              return (
                <div key={index} className={`p-2 min-h-[80px] border-b border-r border-white/5 ${!day.isCurrentMonth ? 'opacity-30' : ''} ${isToday ? 'bg-amber-500/10 border-amber-500/30' : ''}`}>
                  <div className={`text-sm ${isToday ? 'text-amber-400 font-bold' : 'text-white/60'}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="mt-1 space-y-1 max-h-[50px] overflow-y-auto">
                    {ventasDelDia.slice(0, 3).map(v => (
                      <div key={v.id} className="text-[10px] bg-amber-500/20 text-amber-400 rounded px-1 truncate">
                        {v.clienteNombre} - {formatUSD(v.precioVentaUSD)}
                      </div>
                    ))}
                    {ventasDelDia.length > 3 && (
                      <div className="text-[10px] text-white/30">+{ventasDelDia.length - 3} más</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${cardBg} rounded-2xl p-6 border ${cardBorder}`}>
            <h3 className="text-white font-semibold mb-3">Ventas del Mes</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {getVentasDelDia(currentDate).slice(0, 10).map(v => (
                <div key={v.id} className="flex justify-between items-center border-b border-white/5 py-2">
                  <div>
                    <p className="text-white text-sm">{v.clienteNombre}</p>
                    <p className="text-white/40 text-xs">{v.excursionNombre}</p>
                  </div>
                  <span className="text-white font-medium">{formatUSD(v.precioVentaUSD)}</span>
                </div>
              ))}
              {getVentasDelDia(currentDate).length === 0 && (
                <p className="text-white/40 text-sm text-center py-4">No hay ventas en este mes</p>
              )}
            </div>
          </div>
          <div className={`${cardBg} rounded-2xl p-6 border ${cardBorder}`}>
            <h3 className="text-white font-semibold mb-3">Resumen del Mes</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Ventas Totales</span>
                <span className="text-white font-bold">{formatUSD(ventas.filter(v => {
                  const d = new Date(v.fechaExcursion);
                  return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                }).reduce((s, v) => s + v.precioVentaUSD, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Comisiones</span>
                <span className="text-green-400">{formatUSD(ventas.filter(v => {
                  const d = new Date(v.fechaExcursion);
                  return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                }).reduce((s, v) => s + v.comisionUSD, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total Ventas</span>
                <span className="text-white">{ventas.filter(v => {
                  const d = new Date(v.fechaExcursion);
                  return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                }).length}</span>
              </div>
            </div>
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
      const matchesSearch = e.nombre.toLowerCase().includes(searchExcursiones.toLowerCase()) ||
                            e.proveedorNombre.toLowerCase().includes(searchExcursiones.toLowerCase());
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
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filterExcursionProveedor}
            onChange={(e) => setFilterExcursionProveedor(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            <option value="">Todos los proveedores</option>
            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <button onClick={() => { setEditingExcursionId(null); setExcursionFormData({ nombre: "", proveedorId: "", proveedorNombre: "", precioAdultoUSD: "", precioNinoUSD: "", costoProveedorAdultoUSD: "", costoProveedorNinoUSD: "", comisionAdultoUSD: "", comisionNinoUSD: "", zona: "", capacidad: "", tienePrecioNino: false }); setShowExcursionForm(true); }} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2.5 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 ${shadowColor}`}>
            <span className="text-lg leading-none">+</span> Nueva Excursion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {excursionesFiltradas.length === 0 ? (
            <div className="col-span-full text-center py-12 text-white/40">No hay excursiones registradas</div>
          ) : (
            excursionesFiltradas.map(e => (
              <div key={e.id} className={`${cardBg} rounded-2xl p-6 border ${cardBorder} hover:border-${accentColor}-500/50 transition-all`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{e.nombre}</h3>
                    <p className="text-white/40 text-sm">{e.proveedorNombre}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editExcursion(e)} className={`px-3 py-1 ${badgeStyle} rounded-lg hover:bg-${accentColor}-500/30 text-xs transition-all`}>Editar</button>
                    <button onClick={() => deleteExcursion(e.id)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs transition-all">Eliminar</button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Adulto</span>
                    <span className="text-white font-medium">{formatUSD(e.precioAdultoUSD)}</span>
                  </div>
                  {e.precioNinoUSD !== null && (
                    <div className="flex justify-between text-white/60">
                      <span>Niño</span>
                      <span className="text-white font-medium">{formatUSD(e.precioNinoUSD)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60">
                    <span>Comision</span>
                    <span className="text-green-400">{formatUSD(e.comisionAdultoUSD)}</span>
                  </div>
                  <div className="flex justify-between text-white/60 text-xs">
                    <span>Zona</span>
                    <span>{e.zona || "Sin zona"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER PRINCIPAL CON NAVEGACION
  // ============================================
  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} relative overflow-hidden`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-[-30%] right-[-10%] w-[50%] h-[50%] bg-${accentColor}-500/5 rounded-full blur-[150px]`}></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <header className={`${headerBg} border-b ${cardBorder} sticky top-0 z-50 backdrop-blur-xl`}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${buttonGradient} flex items-center justify-center text-slate-900 font-bold text-sm`}>
                RE
              </div>
              <div>
                <h1 className="text-white font-bold text-lg tracking-tight">Republic Excursions</h1>
                <p className={`text-xs ${accentText}`}>{getUserEmoji()} {getUserRole()}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setViewMode("dashboard")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "dashboard" ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                Dashboard
              </button>
              <button onClick={() => setViewMode("ventas")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "ventas" ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                Ventas
              </button>
              <button onClick={() => setViewMode("reservas")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "reservas" ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                Reservas
              </button>
              <button onClick={() => setViewMode("calendario")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "calendario" ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                Calendario
              </button>
              {isAdmin && (
                <>
                  <button onClick={() => setViewMode("clientes")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "clientes" ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                    Clientes
                  </button>
                  <button onClick={() => setViewMode("proveedores")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "proveedores" ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                    Proveedores
                  </button>
                  <button onClick={() => setViewMode("excursiones")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "excursiones" ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                    Excursiones
                  </button>
                  <button onClick={() => setViewMode("bancos")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "bancos" ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                    Bancos
                  </button>
                </>
              )}
              <button onClick={handleLogout} className="px-3 py-1.5 rounded-xl text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                Salir
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className={`text-2xl font-bold text-white`}>
                {viewMode === "dashboard" && "Dashboard"}
                {viewMode === "ventas" && "Ventas"}
                {viewMode === "reservas" && "Reservas"}
                {viewMode === "clientes" && "Clientes"}
                {viewMode === "proveedores" && "Proveedores"}
                {viewMode === "excursiones" && "Excursiones"}
                {viewMode === "bancos" && "Bancos"}
                {viewMode === "calendario" && "Calendario"}
              </h2>
            </div>
            <div className="flex gap-2">
              {viewMode !== "calendario" && viewMode !== "dashboard" && (
                <button onClick={() => setShowForm(true)} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 ${shadowColor}`}>
                  <span className="text-lg leading-none">+</span> Nueva Venta
                </button>
              )}
            </div>
          </div>

          {renderView()}
        </main>
      </div>

      {/* MODALES - Formulario de Venta con Hora y Comisión */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${cardBg} rounded-3xl border ${cardBorder} max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold">{editingVentaId ? "Editar Venta" : "Nueva Venta"}</h3>
              <button onClick={resetForm} className="text-white/40 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cliente y WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Cliente</label>
                  <input
                    type="text"
                    value={formData.clienteNombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, clienteNombre: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Nombre del cliente"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={formData.clienteWhatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, clienteWhatsapp: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="WhatsApp"
                  />
                </div>
              </div>

              {/* Excursión, Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Excursión</label>
                  <select
                    value={formData.excursionId}
                    onChange={(e) => selectExcursionForVenta(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Seleccionar excursión</option>
                    {excursiones.map(e => <option key={e.id} value={e.id}>{e.nombre} - {e.proveedorNombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formData.fechaExcursion}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaExcursion: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Hora</label>
                  <select
                    value={formData.horaExcursion}
                    onChange={(e) => setFormData(prev => ({ ...prev, horaExcursion: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* Adultos, Niños y Estado */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Adultos</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cantidadAdultos}
                    onChange={handleCantidadAdultosChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Niños</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cantidadNinos}
                    onChange={handleCantidadNinosChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as any }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              </div>

              {/* Precios y Costos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Precio Adulto (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioAdultoUSD}
                    onChange={handlePrecioAdultoChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Costo Adulto (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costoProveedorAdultoUSD}
                    onChange={handleCostoAdultoChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Precio Niño (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioNinoUSD}
                    onChange={handlePrecioNinoChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Costo Niño (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costoProveedorNinoUSD}
                    onChange={handleCostoNinoChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Totales */}
              <div className="grid grid-cols-3 gap-4 bg-white/5 rounded-2xl p-4 border border-white/5">
                <div>
                  <label className="text-white/40 text-sm block mb-1">Total Venta</label>
                  <input
                    type="text"
                    value={formData.precioTotalUSD}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-lg"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-white/40 text-sm block mb-1">Costo Proveedor</label>
                  <input
                    type="text"
                    value={formData.costoTotalUSD}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-orange-400 font-bold text-lg"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-white/40 text-sm block mb-1">Comisión</label>
                  <input
                    type="text"
                    value={formData.comisionTotalUSD}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-green-400 font-bold text-lg"
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={resetForm} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                  Cancelar
                </button>
                <button type="submit" className={`px-6 py-2 bg-gradient-to-r ${buttonGradient} text-slate-900 rounded-xl hover:shadow-xl transition-all ${shadowColor}`}>
                  {editingVentaId ? "Actualizar Venta" : "Registrar Venta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALES - Formulario de Cliente */}
      {showClienteForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-3xl border ${cardBorder} max-w-lg w-full p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold">Nuevo Cliente</h3>
              <button onClick={() => setShowClienteForm(false)} className="text-white/40 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleClienteSubmit} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm block mb-1">Nombre</label>
                <input type="text" name="nombre" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" required />
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1">WhatsApp</label>
                <input type="text" name="whatsapp" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1">Email</label>
                <input type="email" name="email" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1">Excursión</label>
                <select name="excursionId" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
                  <option value="">Seleccionar excursión</option>
                  {excursiones.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1">Fecha</label>
                <input type="date" name="fechaExcursion" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setShowClienteForm(false)} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                  Cancelar
                </button>
                <button type="submit" className={`px-6 py-2 bg-gradient-to-r ${buttonGradient} text-slate-900 rounded-xl hover:shadow-xl transition-all ${shadowColor}`}>
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALES - Formulario de Proveedor con RNC/Cédula */}
      {showProveedorForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${cardBg} rounded-3xl border ${cardBorder} max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold">{editingProveedorId ? "Editar Proveedor" : "Nuevo Proveedor"}</h3>
              <button onClick={() => { setShowProveedorForm(false); setEditingProveedorId(null); }} className="text-white/40 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleProveedorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Nombre</label>
                  <input
                    type="text"
                    value={proveedorFormData.nombre}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Empresa</label>
                  <input
                    type="text"
                    value={proveedorFormData.empresa}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, empresa: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={proveedorFormData.telefono}
                    onChange={manejarCambioTelefono}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="(XXX) XXX-XXXX"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Email</label>
                  <input
                    type="email"
                    value={proveedorFormData.email}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Tipo de Documento - RNC o Cédula */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Tipo de Documento</label>
                  <select
                    value={proveedorFormData.tipoDocumento}
                    onChange={(e) => {
                      setProveedorFormData(prev => ({ 
                        ...prev, 
                        tipoDocumento: e.target.value as "rnc" | "cedula",
                        rncCedula: ""
                      }));
                    }}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="cedula">Cédula</option>
                    <option value="rnc">RNC</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">{proveedorFormData.tipoDocumento === "rnc" ? "RNC" : "Cédula"}</label>
                  <input
                    type="text"
                    value={proveedorFormData.rncCedula}
                    onChange={manejarCambioRNCcedula}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder={proveedorFormData.tipoDocumento === "rnc" ? "XX-XXXXXXX-X" : "XXX-XXXXXXX-X"}
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm block mb-2">Métodos de Pago</label>
                <div className="flex gap-4 flex-wrap">
                  <button type="button" onClick={() => toggleMetodoPago("efectivo")} className={`px-4 py-2 rounded-xl transition-all ${proveedorFormData.metodosPago.includes("efectivo") ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'bg-white/5 border border-white/10 text-white/60'}`}>
                    Efectivo
                  </button>
                  <button type="button" onClick={() => toggleMetodoPago("transferencia")} className={`px-4 py-2 rounded-xl transition-all ${proveedorFormData.metodosPago.includes("transferencia") ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'bg-white/5 border border-white/10 text-white/60'}`}>
                    Transferencia
                  </button>
                  <button type="button" onClick={() => toggleMetodoPago("paypal")} className={`px-4 py-2 rounded-xl transition-all ${proveedorFormData.metodosPago.includes("paypal") ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'bg-white/5 border border-white/10 text-white/60'}`}>
                    PayPal
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Banco</label>
                  <select
                    value={proveedorFormData.banco}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, banco: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seleccionar banco</option>
                    {BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Número de Cuenta</label>
                  <input
                    type="text"
                    value={proveedorFormData.numeroCuenta}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, numeroCuenta: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Moneda</label>
                  <select
                    value={proveedorFormData.monedaCuenta}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, monedaCuenta: e.target.value as "USD" | "RD$" }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="RD$">RD$</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-2">Tipo de Cuenta</label>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => toggleTipoCuenta("corriente")} className={`px-4 py-2 rounded-xl transition-all ${proveedorFormData.tipoCuenta.includes("corriente") ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'bg-white/5 border border-white/10 text-white/60'}`}>
                      Corriente
                    </button>
                    <button type="button" onClick={() => toggleTipoCuenta("ahorros")} className={`px-4 py-2 rounded-xl transition-all ${proveedorFormData.tipoCuenta.includes("ahorros") ? `bg-gradient-to-r ${buttonGradient} text-slate-900 ${shadowColor}` : 'bg-white/5 border border-white/10 text-white/60'}`}>
                      Ahorros
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Tipo de Beneficiario</label>
                  <select
                    value={proveedorFormData.tipoBeneficiario}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, tipoBeneficiario: e.target.value as "personal" | "empresarial" }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="personal">Personal</option>
                    <option value="empresarial">Empresarial</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Beneficiario</label>
                  <input
                    type="text"
                    value={proveedorFormData.beneficiario}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, beneficiario: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Excursiones temporales */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h4 className="text-white font-semibold mb-3">Excursiones del Proveedor</h4>
                <div className="space-y-2 mb-3">
                  {tempExcursiones.map((e, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2">
                      <div>
                        <span className="text-white">{e.nombre}</span>
                        <span className="text-white/40 text-sm ml-2">Precio Adulto: {formatUSD(e.precioAdultoUSD)}</span>
                        {e.precioNinoUSD !== null && <span className="text-white/40 text-sm ml-2">Precio Niño: {formatUSD(e.precioNinoUSD)}</span>}
                      </div>
                      <button type="button" onClick={() => eliminarTempExcursion(i)} className="text-red-400 hover:text-red-300">×</button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={tempExcursionForm.nombre}
                    onChange={(e) => setTempExcursionForm(prev => ({ ...prev, nombre: e.target.value }))}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Nombre de excursión"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={tempExcursionForm.precioAdultoUSD}
                      onChange={(e) => setTempExcursionForm(prev => ({ ...prev, precioAdultoUSD: e.target.value }))}
                      className="w-1/2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="Precio Adulto"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={tempExcursionForm.precioNinoUSD}
                      onChange={(e) => setTempExcursionForm(prev => ({ ...prev, precioNinoUSD: e.target.value }))}
                      className="w-1/2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="Precio Niño"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <input
                    type="number"
                    step="0.01"
                    value={tempExcursionForm.costoProveedorAdultoUSD}
                    onChange={(e) => setTempExcursionForm(prev => ({ ...prev, costoProveedorAdultoUSD: e.target.value }))}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Costo Adulto"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={tempExcursionForm.costoProveedorNinoUSD}
                    onChange={(e) => setTempExcursionForm(prev => ({ ...prev, costoProveedorNinoUSD: e.target.value }))}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Costo Niño"
                  />
                </div>
                <div className="flex gap-4 mt-2 items-center">
                  <label className="flex items-center gap-2 text-white/60 text-sm">
                    <input
                      type="checkbox"
                      checked={tempExcursionForm.tienePrecioNino}
                      onChange={(e) => setTempExcursionForm(prev => ({ ...prev, tienePrecioNino: e.target.checked }))}
                    />
                    Tiene precio para niños
                  </label>
                  <button type="button" onClick={agregarTempExcursion} className={`px-4 py-2 bg-gradient-to-r ${buttonGradient} text-slate-900 rounded-xl hover:shadow-xl transition-all ${shadowColor} text-sm`}>
                    Agregar Excursión
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => { setShowProveedorForm(false); setEditingProveedorId(null); }} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                  Cancelar
                </button>
                <button type="submit" className={`px-6 py-2 bg-gradient-to-r ${buttonGradient} text-slate-900 rounded-xl hover:shadow-xl transition-all ${shadowColor}`}>
                  {editingProveedorId ? "Actualizar Proveedor" : "Guardar Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALES - Formulario de Excursión */}
      {showExcursionForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-3xl border ${cardBorder} max-w-2xl w-full p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold">{editingExcursionId ? "Editar Excursión" : "Nueva Excursión"}</h3>
              <button onClick={() => { setShowExcursionForm(false); setEditingExcursionId(null); }} className="text-white/40 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleExcursionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Nombre</label>
                  <input
                    type="text"
                    value={excursionFormData.nombre}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Proveedor</label>
                  <select
                    value={excursionFormData.proveedorId}
                    onChange={(e) => {
                      const proveedor = proveedores.find(p => p.id === e.target.value);
                      setExcursionFormData(prev => ({
                        ...prev,
                        proveedorId: e.target.value,
                        proveedorNombre: proveedor?.nombre || ""
                      }));
                    }}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Precio Adulto (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={excursionFormData.precioAdultoUSD}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, precioAdultoUSD: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Precio Niño (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={excursionFormData.precioNinoUSD}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, precioNinoUSD: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Costo Proveedor Adulto (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={excursionFormData.costoProveedorAdultoUSD}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, costoProveedorAdultoUSD: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Costo Proveedor Niño (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={excursionFormData.costoProveedorNinoUSD}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, costoProveedorNinoUSD: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Zona</label>
                  <select
                    value={excursionFormData.zona}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, zona: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seleccionar zona</option>
                    {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Capacidad</label>
                  <input
                    type="text"
                    value={excursionFormData.capacidad}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, capacidad: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Ej: 20 personas"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-white/60 text-sm">
                  <input
                    type="checkbox"
                    checked={excursionFormData.tienePrecioNino}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, tienePrecioNino: e.target.checked }))}
                  />
                  Tiene precio para niños
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => { setShowExcursionForm(false); setEditingExcursionId(null); }} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                  Cancelar
                </button>
                <button type="submit" className={`px-6 py-2 bg-gradient-to-r ${buttonGradient} text-slate-900 rounded-xl hover:shadow-xl transition-all ${shadowColor}`}>
                  {editingExcursionId ? "Actualizar Excursión" : "Guardar Excursión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
