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
  tipoPrecio: "persona" | "maquina";
  tipoServicio: "compartido" | "privado" | "grupo" | "grupo_privado";
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
  tipoCuenta: ("corriente" | "ahorros" | "corriente_us" | "ahorros_us")[];
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
  tipoServicio: "compartido" | "privado" | "grupo" | "grupo_privado";
  nombreGrupo?: string;
  capacidadGrupo?: string;
  tipoRecogida: "sin_recogida" | "hotel" | "airbnb";
  transporte: "si" | "no";
  hotelNombre: string;
  hotelHabitacion: string;
  airbnbUbicacion: string;
  horaRecogida: string;
  zona: string;
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
const ZONAS_DEFAULT = [
  "Bavaro", "Punta Cana Village", "Cap Cana", "Uvero Alto",
  "Cabeza de Toro", "El Cortecito", "Los Corales", "Bibijagua",
  "Arena Gorda", "Melia", "Riu", "Hard Rock", "Iberostar",
  "Bahia Principe", "Sirenis", "Dreams", "Excellence",
  "San Juan", "Veron"
];

const BANCOS = [
  "Banco BHD", "Banreservas", "Banco Popular Dominicano",
  "Scotiabank", "Banco Santa Cruz", "Banco Vimenca",
  "Banco ADOPEM", "Banco Caribe", "Bancamerica",
  "Banco Activo", "Banfondesa", "Banco BDI",
  "Banco Promerica", "Banco Lafise", "Banesco"
];

const TIPOS_SERVICIO = [
  { value: "compartido", label: "Compartido" },
  { value: "privado", label: "Privado" },
  { value: "grupo", label: "Grupo" },
  { value: "grupo_privado", label: "Grupo Privado" },
];

const getTipoServicioLabel = (tipo: string) => {
  const map: any = {
    compartido: "Compartido",
    privado: "Privado",
    grupo: "Grupo",
    grupo_privado: "Grupo Privado"
  };
  return map[tipo] || tipo;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<"raul" | "gabrielle" | "republic" | null>(null);
  const [loginError, setLoginError] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [excursiones, setExcursiones] = useState<Excursion[]>([]);
  const [zonas, setZonas] = useState<string[]>(ZONAS_DEFAULT);
  
  const [showForm, setShowForm] = useState(false);
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [showProveedorForm, setShowProveedorForm] = useState(false);
  const [showExcursionForm, setShowExcursionForm] = useState(false);
  const [editingVentaId, setEditingVentaId] = useState<string | null>(null);
  const [editingExcursionId, setEditingExcursionId] = useState<string | null>(null);
  const [editingProveedorId, setEditingProveedorId] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"dashboard" | "ventas" | "clientes" | "proveedores" | "excursiones" | "bancos" | "calendario" | "reservas">("dashboard");
  const [selectedExcursionForVenta, setSelectedExcursionForVenta] = useState<Excursion | null>(null);
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
    tipoPrecio: "persona" as "persona" | "maquina",
    tipoServicio: "compartido" as "compartido" | "privado" | "grupo" | "grupo_privado",
  });

  // ============================================
  // FORM DATA
  // ============================================
  const [formData, setFormData] = useState({
    clienteNombre: "",
    clienteWhatsapp: "",
    clienteEmail: "",
    clienteId: "",
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
    precioTotalUSD: "0.00",
    costoTotalUSD: "0.00",
    comisionTotalUSD: "0.00",
    pagoCliente: "completo" as "completo" | "deposito_25" | "pago_dia",
    montoPagadoUSD: "",
    saldoPendienteUSD: "",
    metodoPagoCliente: "efectivo" as "efectivo" | "tarjeta" | "transferencia" | "paypal",
    proveedorId: "",
    proveedorNombre: "",
    proveedorPagado: "pendiente" as "pendiente" | "pagado",
    metodoPagoProveedor: "efectivo" as "efectivo" | "transferencia" | "paypal",
    tipoServicio: "compartido" as "compartido" | "privado" | "grupo" | "grupo_privado",
    nombreGrupo: "",
    capacidadGrupo: "",
    tipoRecogida: "sin_recogida" as "sin_recogida" | "hotel" | "airbnb",
    transporte: "no" as "si" | "no",
    hotelNombre: "",
    hotelHabitacion: "",
    airbnbUbicacion: "",
    horaRecogida: "",
    estado: "pendiente" as "pendiente" | "confirmada" | "cancelada" | "completada",
    nota: "",
    zona: "",
    tipoPrecio: "persona" as "persona" | "maquina",
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
    tipoPrecio: "persona" as "persona" | "maquina",
    tipoServicio: "compartido" as "compartido" | "privado" | "grupo" | "grupo_privado",
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
    tipoCuenta: [] as ("corriente" | "ahorros" | "corriente_us" | "ahorros_us")[],
    tipoBeneficiario: "personal" as "personal" | "empresarial",
    beneficiario: "",
    rncCedula: "",
    tipoDocumento: "cedula" as "rnc" | "cedula",
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

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return months[month];
  };

  const getDayName = (day: number) => {
    const days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    return days[day];
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

  const handleSelectUser = (user: string) => {
    setSelectedUser(user);
    setLoginPassword("");
    setLoginError("");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setLoginError("Selecciona un usuario");
      return;
    }
    handleLogin(selectedUser, loginPassword);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginError("");
    setSelectedUser("");
    setLoginPassword("");
  };

  // ============================================
  // LOAD DATA
  // ============================================
  useEffect(() => {
    const savedVentas = localStorage.getItem("excursiones_ventas_v51");
    const savedClientes = localStorage.getItem("excursiones_clientes_v51");
    const savedProveedores = localStorage.getItem("excursiones_proveedores_v51");
    const savedExcursiones = localStorage.getItem("excursiones_excursiones_v51");
    const savedZonas = localStorage.getItem("excursiones_zonas_v51");
    
    if (savedVentas) setVentas(JSON.parse(savedVentas));
    if (savedClientes) setClientes(JSON.parse(savedClientes));
    if (savedProveedores) setProveedores(JSON.parse(savedProveedores));
    if (savedExcursiones) setExcursiones(JSON.parse(savedExcursiones));
    if (savedZonas) setZonas(JSON.parse(savedZonas));
  }, []);

  const saveVentas = (data: Venta[]) => {
    setVentas(data);
    localStorage.setItem("excursiones_ventas_v51", JSON.stringify(data));
  };

  const saveClientes = (data: Cliente[]) => {
    setClientes(data);
    localStorage.setItem("excursiones_clientes_v51", JSON.stringify(data));
  };

  const saveProveedores = (data: Proveedor[]) => {
    setProveedores(data);
    localStorage.setItem("excursiones_proveedores_v51", JSON.stringify(data));
  };

  const saveExcursiones = (data: Excursion[]) => {
    setExcursiones(data);
    localStorage.setItem("excursiones_excursiones_v51", JSON.stringify(data));
  };

  const saveZonas = (data: string[]) => {
    setZonas(data);
    localStorage.setItem("excursiones_zonas_v51", JSON.stringify(data));
  };

  // ============================================
  // AGREGAR ZONA
  // ============================================
  const agregarZona = () => {
    const nuevaZona = prompt("Escribe el nombre de la nueva zona:");
    if (nuevaZona && nuevaZona.trim() && !zonas.includes(nuevaZona.trim())) {
      const nuevasZonas = [...zonas, nuevaZona.trim()];
      saveZonas(nuevasZonas);
      return nuevaZona.trim();
    } else if (zonas.includes(nuevaZona?.trim() || "")) {
      alert("Esta zona ya existe");
    } else if (nuevaZona && !nuevaZona.trim()) {
      alert("Por favor escribe un nombre de zona");
    }
    return null;
  };

  // ============================================
  // CALCULAR COMISION Y TOTALES
  // ============================================
  const calcularComision = (precioVenta: number, costoProveedor: number) => {
    return precioVenta - costoProveedor;
  };

  const calcularTotalesVenta = () => {
    const precioAdulto = Number(formData.precioAdultoUSD) || 0;
    const precioNino = Number(formData.precioNinoUSD) || 0;
    const costoAdulto = Number(formData.costoProveedorAdultoUSD) || 0;
    const costoNino = Number(formData.costoProveedorNinoUSD) || 0;
    const cantAdultos = Number(formData.cantidadAdultos) || 0;
    const cantNinos = Number(formData.cantidadNinos) || 0;
    
    const precioTotal = (precioAdulto * cantAdultos) + (precioNino * cantNinos);
    const costoTotal = (costoAdulto * cantAdultos) + (costoNino * cantNinos);
    const comisionTotal = precioTotal - costoTotal;
    
    return { precioTotal, costoTotal, comisionTotal };
  };

  // ============================================
  // ACTUALIZAR TOTALES
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
  // SELECCIONAR CLIENTE EXISTENTE
  // ============================================
  const selectCliente = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente) {
      setFormData(prev => ({
        ...prev,
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        clienteWhatsapp: cliente.whatsapp,
        clienteEmail: cliente.email,
      }));
    }
  };

  // ============================================
  // SELECCIONAR EXCURSION PARA VENTA
  // ============================================
  const selectExcursionForVenta = (excursionId: string) => {
    const excursion = excursiones.find(e => e.id === excursionId);
    if (excursion) {
      setSelectedExcursionForVenta(excursion);
      
      const precioAdulto = excursion.precioAdultoUSD || 0;
      const precioNino = excursion.precioNinoUSD || 0;
      const costoAdulto = excursion.costoProveedorAdultoUSD || 0;
      const costoNino = excursion.costoProveedorNinoUSD || 0;
      const comisionAdulto = excursion.comisionAdultoUSD || 0;
      const comisionNino = excursion.comisionNinoUSD || 0;
      
      const tipoServicio = excursion.tipoServicio || "compartido";
      const capacidadGrupo = (tipoServicio === "grupo" || tipoServicio === "grupo_privado") ? excursion.capacidad || "" : "";
      
      setFormData(prev => ({
        ...prev,
        excursionId: excursion.id,
        excursionNombre: excursion.nombre,
        precioAdultoUSD: String(precioAdulto),
        precioNinoUSD: String(precioNino),
        costoProveedorAdultoUSD: String(costoAdulto),
        costoProveedorNinoUSD: String(costoNino),
        comisionAdultoUSD: String(comisionAdulto),
        comisionNinoUSD: String(comisionNino),
        proveedorId: excursion.proveedorId,
        proveedorNombre: excursion.proveedorNombre,
        zona: excursion.zona || "",
        tipoPrecio: excursion.tipoPrecio || "persona",
        tipoServicio: tipoServicio,
        capacidadGrupo: capacidadGrupo,
        nombreGrupo: "",
      }));
      
      setTimeout(() => {
        const { precioTotal, costoTotal, comisionTotal } = calcularTotalesVenta();
        setFormData(prev => ({
          ...prev,
          precioTotalUSD: precioTotal.toFixed(2),
          costoTotalUSD: costoTotal.toFixed(2),
          comisionTotalUSD: comisionTotal.toFixed(2),
        }));
      }, 50);
    }
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
  // HANDLE VENTA
  // ============================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { precioTotal, costoTotal, comisionTotal } = calcularTotalesVenta();
    const montoPagadoUSD = Number(formData.montoPagadoUSD) || 0;
    
    // Validaciones para Grupo y Grupo Privado
    if ((formData.tipoServicio === "grupo" || formData.tipoServicio === "grupo_privado")) {
      if (!formData.nombreGrupo.trim()) {
        alert("El nombre del grupo es obligatorio para este tipo de servicio");
        return;
      }
      if (!formData.capacidadGrupo.trim()) {
        alert("La capacidad del grupo es obligatoria para este tipo de servicio");
        return;
      }
    }
    
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
      nombreGrupo: (formData.tipoServicio === "grupo" || formData.tipoServicio === "grupo_privado") ? formData.nombreGrupo : undefined,
      capacidadGrupo: (formData.tipoServicio === "grupo" || formData.tipoServicio === "grupo_privado") ? formData.capacidadGrupo : undefined,
      tipoRecogida: formData.tipoRecogida,
      transporte: formData.transporte,
      hotelNombre: formData.hotelNombre || "",
      hotelHabitacion: formData.hotelHabitacion || "",
      airbnbUbicacion: formData.airbnbUbicacion || "",
      horaRecogida: formData.horaRecogida || "",
      zona: formData.zona || "",
      precioAdultoPersonalizado: Number(formData.precioAdultoUSD) || 0,
      precioNinoPersonalizado: Number(formData.precioNinoUSD) || 0,
      costoAdultoPersonalizado: Number(formData.costoProveedorAdultoUSD) || 0,
      costoNinoPersonalizado: Number(formData.costoProveedorNinoUSD) || 0,
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
      clienteId: "",
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
      precioTotalUSD: "0.00",
      costoTotalUSD: "0.00",
      comisionTotalUSD: "0.00",
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
      capacidadGrupo: "",
      tipoRecogida: "sin_recogida",
      transporte: "no",
      hotelNombre: "",
      hotelHabitacion: "",
      airbnbUbicacion: "",
      horaRecogida: "",
      estado: "pendiente",
      nota: "",
      zona: "",
      tipoPrecio: "persona",
    });
    setShowForm(false);
    setEditingVentaId(null);
    setSelectedExcursionForVenta(null);
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
      clienteId: "",
      excursionId: venta.excursionId,
      excursionNombre: venta.excursionNombre,
      fechaExcursion: venta.fechaExcursion,
      horaExcursion: venta.horaExcursion || "02:00 PM",
      precioAdultoUSD: String(venta.precioAdultoPersonalizado || ""),
      precioNinoUSD: String(venta.precioNinoPersonalizado || ""),
      costoProveedorAdultoUSD: String(venta.costoAdultoPersonalizado || ""),
      costoProveedorNinoUSD: String(venta.costoNinoPersonalizado || ""),
      comisionAdultoUSD: String(excursion?.comisionAdultoUSD || ""),
      comisionNinoUSD: String(excursion?.comisionNinoUSD || ""),
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
      tipoServicio: venta.tipoServicio || "compartido",
      nombreGrupo: venta.nombreGrupo || "",
      capacidadGrupo: venta.capacidadGrupo || "",
      tipoRecogida: venta.tipoRecogida || "sin_recogida",
      transporte: venta.transporte || "no",
      hotelNombre: venta.hotelNombre || "",
      hotelHabitacion: venta.hotelHabitacion || "",
      airbnbUbicacion: venta.airbnbUbicacion || "",
      horaRecogida: venta.horaRecogida || "",
      estado: venta.estado || "pendiente",
      nota: venta.nota,
      zona: excursion?.zona || "",
      tipoPrecio: "persona",
    });
    setShowForm(true);
  };

  const deleteVenta = (id: string) => {
    if (!confirm("Eliminar esta venta?")) return;
    const updated = ventas.filter(v => v.id !== id);
    saveVentas(updated);
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
      alert("Proveedor actualizado correctamente");
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
      
      alert("Proveedor agregado correctamente");
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
      tipoPrecio: "persona",
      tipoServicio: "compartido",
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
      tipoPrecio: e.tipoPrecio || "persona",
      tipoServicio: e.tipoServicio || "compartido",
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

  const toggleTipoCuenta = (tipo: "corriente" | "ahorros" | "corriente_us" | "ahorros_us") => {
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
    
    const precioAdultoUSD = Number(tempExcursionForm.precioAdultoUSD) || 0;
    const costoProveedorAdultoUSD = Number(tempExcursionForm.costoProveedorAdultoUSD) || 0;
    const comisionAdultoUSD = calcularComision(precioAdultoUSD, costoProveedorAdultoUSD);
    
    let precioNinoUSD: number | null = null;
    let costoProveedorNinoUSD: number | null = null;
    let comisionNinoUSD: number | null = null;
    
    if (tempExcursionForm.tienePrecioNino) {
      precioNinoUSD = Number(tempExcursionForm.precioNinoUSD) || 0;
      costoProveedorNinoUSD = Number(tempExcursionForm.costoProveedorNinoUSD) || 0;
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
        tipoPrecio: tempExcursionForm.tipoPrecio || "persona",
        tipoServicio: tempExcursionForm.tipoServicio || "compartido",
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
      tipoPrecio: "persona",
      tipoServicio: "compartido",
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
    
    const precioAdultoUSD = Number(excursionFormData.precioAdultoUSD) || 0;
    const costoProveedorAdultoUSD = Number(excursionFormData.costoProveedorAdultoUSD) || 0;
    const comisionAdultoUSD = calcularComision(precioAdultoUSD, costoProveedorAdultoUSD);
    
    let precioNinoUSD: number | null = null;
    let costoProveedorNinoUSD: number | null = null;
    let comisionNinoUSD: number | null = null;
    
    if (excursionFormData.tienePrecioNino) {
      precioNinoUSD = Number(excursionFormData.precioNinoUSD) || 0;
      costoProveedorNinoUSD = Number(excursionFormData.costoProveedorNinoUSD) || 0;
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
              tipoPrecio: excursionFormData.tipoPrecio || "persona",
              tipoServicio: excursionFormData.tipoServicio || "compartido",
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
        tipoPrecio: excursionFormData.tipoPrecio || "persona",
        tipoServicio: excursionFormData.tipoServicio || "compartido",
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
      tipoPrecio: "persona",
      tipoServicio: "compartido",
    });
  };

  const editExcursion = (excursion: Excursion) => {
    setEditingExcursionId(excursion.id);
    setExcursionFormData({
      nombre: excursion.nombre,
      proveedorId: excursion.proveedorId,
      proveedorNombre: excursion.proveedorNombre,
      precioAdultoUSD: String(excursion.precioAdultoUSD),
      precioNinoUSD: excursion.precioNinoUSD?.toString() || "",
      costoProveedorAdultoUSD: String(excursion.costoProveedorAdultoUSD),
      costoProveedorNinoUSD: excursion.costoProveedorNinoUSD?.toString() || "",
      comisionAdultoUSD: String(excursion.comisionAdultoUSD),
      comisionNinoUSD: excursion.comisionNinoUSD?.toString() || "",
      zona: excursion.zona || "",
      capacidad: excursion.capacidad || "",
      tienePrecioNino: excursion.precioNinoUSD !== null,
      tipoPrecio: excursion.tipoPrecio || "persona",
      tipoServicio: excursion.tipoServicio || "compartido",
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
  const totalPendienteUSD = filtered.reduce((sum, v) => sum + v.saldoPendienteUSD, 0);
  
  const years = [...new Set(ventas.map(v => new Date(v.fechaExcursion).getFullYear().toString()))].sort().reverse();

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
      sin_recogida: "Sin Recogida",
      hotel: "Hotel",
      airbnb: "Airbnb"
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
      pendiente: "bg-yellow-100 text-yellow-800",
      confirmada: "bg-blue-100 text-blue-800",
      cancelada: "bg-red-100 text-red-800",
      completada: "bg-green-100 text-green-800"
    };
    return map[estado] || "bg-gray-100 text-gray-800";
  };

  const getTipoServicioLabel = (tipo: string) => {
    const map: any = {
      compartido: "Compartido",
      privado: "Privado",
      grupo: "Grupo",
      grupo_privado: "Grupo Privado"
    };
    return map[tipo] || tipo;
  };

  const exportCSV = () => {
    if (ventas.length === 0) { alert("No hay datos"); return; }
    let csv = "Fecha,Hora,Cliente,Excursion,Adultos,Ninos,Servicio,Grupo,Capacidad Grupo,Recogida,Transporte,Hotel/Airbnb,Estado,Precio Venta (USD),Costo Proveedor (USD),Comision (USD),Pago Cliente,Saldo Pendiente (USD),Metodo Pago,Proveedor,Pago Proveedor,Zona,Nota\n";
    ventas.forEach(v => {
      const recogidaInfo = v.tipoRecogida === "hotel" ? v.hotelNombre : 
                           v.tipoRecogida === "airbnb" ? v.airbnbUbicacion : "Sin recogida";
      csv += `"${v.fechaExcursion}","${v.horaExcursion}","${v.clienteNombre}","${v.excursionNombre}",${v.cantidadAdultos},${v.cantidadNinos},"${getTipoServicioLabel(v.tipoServicio)}","${v.nombreGrupo || ""}","${v.capacidadGrupo || ""}","${getTipoRecogidaText(v.tipoRecogida)}","${getTransporteText(v.transporte)}","${recogidaInfo}","${getEstadoText(v.estado)}",${v.precioVentaUSD},${v.costoProveedorUSD},${v.comisionUSD},"${getPagoClienteText(v.pagoCliente)}",${v.saldoPendienteUSD},"${v.metodoPagoCliente}","${v.proveedorNombre}","${v.proveedorPagado}","${v.zona || ""}","${v.nota || ""}"\n`;
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
  // LOGIN - DISEÑO PROFESIONAL
  // ============================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-30%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-400/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl shadow-black/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                <div className="text-center md:text-left">
                  <div className="text-5xl font-mono font-bold text-white tracking-wider mb-2">
                    {currentTime.toLocaleTimeString("es-DO", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div className="text-white/60 text-lg">{getDayName(currentTime.getDay())}</div>
                  <div className="text-white/40 text-sm">
                    {currentTime.getDate()} de {getMonthName(currentTime.getMonth())} de {currentTime.getFullYear()}
                  </div>
                </div>
                <div className="mt-6 text-center md:text-left">
                  <div className="text-4xl font-bold text-white/10">RE</div>
                  <div className="text-xs text-white/20 mt-1">v5.1 • Republic Excursions</div>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Bienvenido de nuevo</h2>
                  <p className="text-white/40 text-sm">Inicia sesion para continuar</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1.5">Usuario</label>
                    <select
                      value={selectedUser}
                      onChange={(e) => handleSelectUser(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/30 transition-all appearance-none"
                    >
                      <option value="">Seleccionar usuario</option>
                      <option value="Republic">Republic - Administrador</option>
                      <option value="Raul">Raul - Vendedor</option>
                      <option value="Gabrielle">Gabrielle - Vendedora</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1.5">Contraseña</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/30 transition-all"
                      placeholder="Ingresa tu contraseña"
                      disabled={!selectedUser}
                    />
                  </div>

                  {loginError && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.01] transition-all shadow-lg shadow-blue-500/25"
                  >
                    Iniciar Sesion
                  </button>
                </form>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <button
                    onClick={() => handleSelectUser("Republic")}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${selectedUser === "Republic" ? 'bg-blue-500/20 border-blue-500/50 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                  >
                    Republic
                  </button>
                  <button
                    onClick={() => handleSelectUser("Raul")}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${selectedUser === "Raul" ? 'bg-blue-500/20 border-blue-500/50 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                  >
                    Raul
                  </button>
                  <button
                    onClick={() => handleSelectUser("Gabrielle")}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${selectedUser === "Gabrielle" ? 'bg-blue-500/20 border-blue-500/50 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                  >
                    Gabrielle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // TEMA POR USUARIO
  // ============================================
  const isAdmin = currentUser === "republic";
  const isRaul = currentUser === "raul";
  const isGabrielle = currentUser === "gabrielle";

  const getUserRole = () => {
    if (isAdmin) return "Administrador";
    if (isRaul) return "Vendedor";
    if (isGabrielle) return "Vendedora";
    return "Usuario";
  };

  const getUserBadge = () => {
    if (isAdmin) return "bg-[#0a1628] text-white";
    if (isRaul) return "bg-blue-100 text-blue-800";
    if (isGabrielle) return "bg-pink-100 text-pink-800";
    return "bg-gray-100 text-gray-800";
  };

  const getTipoCuentaLabel = (tipo: string) => {
    const map: any = {
      corriente: "Corriente",
      ahorros: "Ahorros",
      corriente_us: "Corriente US",
      ahorros_us: "Ahorros US"
    };
    return map[tipo] || tipo;
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
      case "excursiones": return renderExcursiones();
      case "bancos": return renderBancos();
      case "calendario": return renderCalendario();
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
            <h2 className="text-2xl font-bold text-[#0a1628]">Dashboard</h2>
            <p className="text-gray-500 text-sm">Bienvenido de vuelta</p>
          </div>
          <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-100 text-center">
            <div className="text-[#0a1628] text-sm font-mono font-bold">
              {currentTime.toLocaleTimeString("es-DO", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-gray-400 text-xs">
              {currentTime.toLocaleDateString("es-DO", { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Ventas</p>
                <p className="text-[#0a1628] text-2xl font-bold">{formatUSD(totalVentas)}</p>
              </div>
              <div className="bg-[#0a1628]/10 w-12 h-12 rounded-xl flex items-center justify-center text-xl">$</div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Comisiones</p>
                <p className="text-[#0a1628] text-2xl font-bold">{formatUSD(totalComisiones)}</p>
              </div>
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center text-xl">%</div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Por Cobrar</p>
                <p className="text-[#0a1628] text-2xl font-bold">{formatUSD(totalPendiente)}</p>
              </div>
              <div className="bg-yellow-100 w-12 h-12 rounded-xl flex items-center justify-center text-xl">!</div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Clientes</p>
                <p className="text-[#0a1628] text-2xl font-bold">{totalClientes}</p>
              </div>
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-xl">👥</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-gray-600 text-sm font-semibold mb-3">Resumen de Ventas</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hoy</span>
                <span className="text-[#0a1628] font-medium">{formatUSD(ventasHoy.reduce((s, v) => s + v.precioVentaUSD, 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pendientes</span>
                <span className="text-yellow-600">{ventas.filter(v => v.estado === "pendiente").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Confirmadas</span>
                <span className="text-blue-600">{ventas.filter(v => v.estado === "confirmada").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completadas</span>
                <span className="text-green-600">{ventas.filter(v => v.estado === "completada").length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-gray-600 text-sm font-semibold mb-3">Resumen General</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Excursiones</span>
                <span className="text-[#0a1628] font-medium">{totalExcursiones}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Proveedores</span>
                <span className="text-[#0a1628] font-medium">{totalProveedores}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ventas Totales</span>
                <span className="text-[#0a1628] font-medium">{ventas.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-gray-600 text-sm font-semibold mb-3">Ultimas Ventas</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {ventas.slice(-4).reverse().map(v => (
                <div key={v.id} className="flex justify-between text-sm border-b border-gray-50 pb-1">
                  <span className="text-gray-500 truncate max-w-[120px]">{v.clienteNombre}</span>
                  <span className="text-[#0a1628] font-medium">{formatUSD(v.precioVentaUSD)}</span>
                </div>
              ))}
              {ventas.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-2">No hay ventas registradas</p>
              )}
            </div>
          </div>
        </div>
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
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628] placeholder-gray-400 focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628]"
          >
            <option value="">Todos los años</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => { setSearchTerm(""); setFilterYear(""); }} className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-200 transition-all">
            Limpiar
          </button>
          <button onClick={exportCSV} className="px-4 py-2.5 bg-green-50 text-green-600 border border-green-200 rounded-xl hover:bg-green-100 transition-all">
            Exportar CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total Ventas</p>
            <p className="text-[#0a1628] text-2xl font-bold">{formatUSD(totalVentasUSD)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Comision Total</p>
            <p className="text-green-600 text-2xl font-bold">{formatUSD(totalComision)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Pendiente Cobrar</p>
            <p className="text-yellow-600 text-2xl font-bold">{formatUSD(totalPendienteUSD)}</p>
          </div>
        </div>

        <div className="space-y-2">
          {groupedArray.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-400">No hay ventas registradas</p>
            </div>
          ) : (
            groupedArray.map((group: any) => (
              <div key={group.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button onClick={() => toggleMonth(group.key)} className="w-full px-6 py-4 flex flex-wrap items-center justify-between hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-[#0a1628] font-semibold text-lg">{getMonthName(group.month - 1)} {group.year}</span>
                    <span className="text-gray-400 text-sm">{group.ventas.length} ventas</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[#0a1628] font-bold">{formatUSD(group.totalUSD)}</span>
                    <span className="text-green-600 text-sm">{formatUSD(group.totalComision)}</span>
                    <span className={`transform transition-transform ${expandedMonth === group.key ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                </button>
                {expandedMonth === group.key && (
                  <div className="px-6 pb-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-100">
                          <th className="text-left py-2 px-2">Fecha</th>
                          <th className="text-left py-2 px-2">Hora</th>
                          <th className="text-left py-2 px-2">Cliente</th>
                          <th className="text-left py-2 px-2">Excursion</th>
                          <th className="text-left py-2 px-2">Servicio</th>
                          <th className="text-left py-2 px-2">Grupo</th>
                          <th className="text-left py-2 px-2">Cap.</th>
                          <th className="text-right py-2 px-2">Precio</th>
                          <th className="text-right py-2 px-2">Comision</th>
                          <th className="text-left py-2 px-2">Estado</th>
                          <th className="text-left py-2 px-2">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.ventas.map((venta: Venta) => (
                          <tr key={venta.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-2 px-2 text-gray-500 text-xs">{new Date(venta.fechaExcursion).toLocaleDateString("es-DO")}</td>
                            <td className="py-2 px-2 text-gray-500 text-xs">{venta.horaExcursion}</td>
                            <td className="py-2 px-2 text-[#0a1628]">{venta.clienteNombre}</td>
                            <td className="py-2 px-2 text-gray-600 text-xs max-w-[100px] truncate">{venta.excursionNombre}</td>
                            <td className="py-2 px-2">
                              <span className="px-2 py-1 rounded-lg text-xs bg-blue-100 text-blue-800">
                                {getTipoServicioLabel(venta.tipoServicio)}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-gray-500 text-xs">{venta.nombreGrupo || "-"}</td>
                            <td className="py-2 px-2 text-gray-500 text-xs">{venta.capacidadGrupo || "-"}</td>
                            <td className="py-2 px-2 text-right text-[#0a1628] font-medium">{formatUSD(venta.precioVentaUSD)}</td>
                            <td className="py-2 px-2 text-right text-green-600">{formatUSD(venta.comisionUSD)}</td>
                            <td className="py-2 px-2">
                              <span className={`px-2 py-1 rounded-lg text-xs ${getEstadoColor(venta.estado)}`}>
                                {getEstadoText(venta.estado)}
                              </span>
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex gap-1">
                                <button onClick={() => editVenta(venta)} className="px-2 py-1 bg-[#0a1628]/10 text-[#0a1628] rounded-lg hover:bg-[#0a1628]/20 text-xs transition-all">Editar</button>
                                <button onClick={() => deleteVenta(venta.id)} className="px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs transition-all">Eliminar</button>
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
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628] placeholder-gray-400 focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterReservaEstado}
            onChange={(e) => setFilterReservaEstado(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628]"
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
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628]"
          />
          <button onClick={() => { setSearchReservas(""); setFilterReservaEstado("todas"); setFilterReservaFecha(""); }} className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-200 transition-all">
            Limpiar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total Reservas</p>
            <p className="text-[#0a1628] text-2xl font-bold">{reservasFiltradas.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Monto Total</p>
            <p className="text-[#0a1628] text-2xl font-bold">{formatUSD(reservasFiltradas.reduce((s, v) => s + v.precioVentaUSD, 0))}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Pendientes</p>
            <p className="text-yellow-600 text-2xl font-bold">{reservasFiltradas.filter(v => v.estado === "pendiente").length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Hora</th>
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-left py-3 px-4">Excursion</th>
                <th className="text-left py-3 px-4">Servicio</th>
                <th className="text-left py-3 px-4">Grupo</th>
                <th className="text-right py-3 px-4">Monto</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservasFiltradas.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">No hay reservas</td></tr>
              ) : (
                reservasFiltradas.map(v => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-500 text-xs">{new Date(v.fechaExcursion).toLocaleDateString("es-DO")}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{v.horaExcursion}</td>
                    <td className="py-3 px-4 text-[#0a1628] font-medium">{v.clienteNombre}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-[120px] truncate">{v.excursionNombre}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-lg text-xs bg-blue-100 text-blue-800">
                        {getTipoServicioLabel(v.tipoServicio)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{v.nombreGrupo || "-"}</td>
                    <td className="py-3 px-4 text-right text-[#0a1628] font-medium">{formatUSD(v.precioVentaUSD)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-lg text-xs ${getEstadoColor(v.estado)}`}>
                        {getEstadoText(v.estado)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => editVenta(v)} className="px-3 py-1 bg-[#0a1628]/10 text-[#0a1628] rounded-lg hover:bg-[#0a1628]/20 text-xs transition-all">Editar</button>
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
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628] placeholder-gray-400 focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterClienteExcursion}
            onChange={(e) => setFilterClienteExcursion(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628]"
          >
            <option value="">Todas las excursiones</option>
            {excursiones.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
          <button onClick={() => setShowClienteForm(true)} className="bg-[#0a1628] text-white px-4 py-2.5 rounded-xl hover:bg-[#1a2a42] transition-all flex items-center gap-2 shadow-lg shadow-[#0a1628]/20">
            <span className="text-lg leading-none">+</span> Nuevo Cliente
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
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
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No hay clientes registrados</td></tr>
              ) : (
                clientesFiltrados.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-[#0a1628] font-medium">{c.nombre}</td>
                    <td className="py-3 px-4 text-gray-500">{c.whatsapp}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{c.email}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-[120px] truncate">{c.excursionNombre}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{c.fechaExcursion ? new Date(c.fechaExcursion).toLocaleDateString("es-DO") : "-"}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => deleteCliente(c.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs transition-all">Eliminar</button>
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
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628] placeholder-gray-400 focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterProveedorMetodo}
            onChange={(e) => setFilterProveedorMetodo(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628]"
          >
            <option value="todos">Todos los métodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="paypal">PayPal</option>
          </select>
          <button onClick={() => { setEditingProveedorId(null); setProveedorFormData({ nombre: "", empresa: "", telefono: "", email: "", metodosPago: [], banco: "", numeroCuenta: "", monedaCuenta: "RD$", tipoCuenta: [], tipoBeneficiario: "personal", beneficiario: "", rncCedula: "", tipoDocumento: "cedula" }); setTempExcursiones([]); setShowProveedorForm(true); }} className="bg-[#0a1628] text-white px-4 py-2.5 rounded-xl hover:bg-[#1a2a42] transition-all flex items-center gap-2 shadow-lg shadow-[#0a1628]/20">
            <span className="text-lg leading-none">+</span> Nuevo Proveedor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedoresFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">No hay proveedores registrados</div>
          ) : (
            proveedoresFiltrados.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[#0a1628] font-semibold">{p.nombre}</h3>
                    <p className="text-gray-400 text-sm">{p.empresa || "Sin empresa"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editProveedor(p)} className="px-3 py-1 bg-[#0a1628]/10 text-[#0a1628] rounded-lg hover:bg-[#0a1628]/20 text-xs transition-all">Editar</button>
                    <button onClick={() => deleteProveedor(p.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs transition-all">Eliminar</button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-500"><span>Teléfono</span> {p.telefono || "Sin teléfono"}</div>
                  <div className="flex items-center gap-2 text-gray-500"><span>Email</span> {p.email || "Sin email"}</div>
                  <div className="flex items-center gap-2 text-gray-500"><span>RNC/Cédula</span> {p.rncCedula || "Sin documento"}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.metodosPago.map(m => <span key={m} className="px-2 py-1 bg-[#0a1628]/10 text-[#0a1628] rounded-lg text-xs">{m === "efectivo" ? "Efectivo" : m === "transferencia" ? "Transferencia" : "PayPal"}</span>)}
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-2">
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
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628] placeholder-gray-400 focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterBancoTipo}
            onChange={(e) => setFilterBancoTipo(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628]"
          >
            <option value="todos">Todos los tipos</option>
            <option value="corriente">Corriente</option>
            <option value="ahorros">Ahorros</option>
            <option value="corriente_us">Corriente US</option>
            <option value="ahorros_us">Ahorros US</option>
          </select>
          <select
            value={filterBancoMoneda}
            onChange={(e) => setFilterBancoMoneda(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628]"
          >
            <option value="todas">Todas las monedas</option>
            <option value="USD">USD</option>
            <option value="RD$">RD$</option>
          </select>
          <button onClick={() => { setSearchBancos(""); setFilterBancoTipo("todos"); setFilterBancoMoneda("todas"); }} className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-200 transition-all">
            Limpiar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bancosFiltrados.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-16 shadow-sm border border-gray-100 text-center">
              <div className="text-6xl mb-4 opacity-50">🏦</div>
              <h3 className="text-[#0a1628] text-2xl font-semibold mb-2">No hay información bancaria</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Agrega proveedores con información bancaria para verlos aquí.
                Los datos bancarios se gestionan desde el módulo de Proveedores.
              </p>
              <button 
                onClick={() => setViewMode("proveedores")} 
                className="mt-6 px-6 py-3 bg-[#0a1628] text-white rounded-xl hover:bg-[#1a2a42] transition-all shadow-lg shadow-[#0a1628]/20 inline-flex items-center gap-2"
              >
                <span className="text-lg leading-none">+</span> Ir a Proveedores
              </button>
            </div>
          ) : (
            bancosFiltrados.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[#0a1628] font-semibold">{p.nombre}</h3>
                    <p className="text-gray-400 text-sm">{p.empresa || "Proveedor"}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs ${p.tipoBeneficiario === "personal" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                    {p.tipoBeneficiario === "personal" ? "Personal" : "Empresarial"}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500"><span>Banco</span> <span className="text-[#0a1628]">{p.banco || "Sin banco"}</span></div>
                  <div className="flex items-center gap-2 text-gray-500"><span>Cuenta</span> <span className="text-[#0a1628]">{p.numeroCuenta || "Sin cuenta"}</span></div>
                  <div className="flex items-center gap-2 text-gray-500"><span>Moneda</span> <span className="text-[#0a1628]">{p.monedaCuenta || "RD$"}</span></div>
                  <div className="flex items-center gap-2 text-gray-500"><span>Beneficiario</span> <span className="text-[#0a1628]">{p.beneficiario || "Sin beneficiario"}</span></div>
                  <div className="flex items-center gap-2 text-gray-500"><span>RNC/Cédula</span> <span className="text-[#0a1628]">{p.rncCedula || "Sin documento"}</span></div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.tipoCuenta.map(t => <span key={t} className="px-2 py-1 bg-[#0a1628]/10 text-[#0a1628] rounded-lg text-xs">{getTipoCuentaLabel(t)}</span>)}
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
            <button onClick={() => cambiarMes(-1)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[#0a1628] hover:bg-gray-50 transition-all">◀</button>
            <h2 className="text-[#0a1628] text-xl font-bold">{getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}</h2>
            <button onClick={() => cambiarMes(1)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[#0a1628] hover:bg-gray-50 transition-all">▶</button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-[#0a1628] text-white rounded-xl hover:bg-[#1a2a42] transition-all">Hoy</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-7 gap-0">
            {["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"].map(day => (
              <div key={day} className="py-3 px-2 text-center text-gray-400 text-sm font-medium border-b border-gray-100">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const ventasDelDia = getVentasDelDia(day.date);
              const isToday = day.date.getDate() === new Date().getDate() &&
                              day.date.getMonth() === new Date().getMonth() &&
                              day.date.getFullYear() === new Date().getFullYear();
              
              return (
                <div key={index} className={`p-2 min-h-[80px] border-b border-r border-gray-100 ${!day.isCurrentMonth ? 'opacity-30' : ''} ${isToday ? 'bg-[#0a1628]/5 border-[#0a1628]/20' : ''}`}>
                  <div className={`text-sm ${isToday ? 'text-[#0a1628] font-bold' : 'text-gray-600'}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="mt-1 space-y-1 max-h-[50px] overflow-y-auto">
                    {ventasDelDia.slice(0, 3).map(v => (
                      <div key={v.id} className="text-[10px] bg-[#0a1628]/10 text-[#0a1628] rounded px-1 truncate">
                        {v.clienteNombre} - {formatUSD(v.precioVentaUSD)}
                      </div>
                    ))}
                    {ventasDelDia.length > 3 && (
                      <div className="text-[10px] text-gray-400">+{ventasDelDia.length - 3} más</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-[#0a1628] font-semibold mb-3">Ventas del Mes</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {getVentasDelDia(currentDate).slice(0, 10).map(v => (
                <div key={v.id} className="flex justify-between items-center border-b border-gray-50 py-2">
                  <div>
                    <p className="text-[#0a1628] text-sm">{v.clienteNombre}</p>
                    <p className="text-gray-400 text-xs">{v.excursionNombre}</p>
                  </div>
                  <span className="text-[#0a1628] font-medium">{formatUSD(v.precioVentaUSD)}</span>
                </div>
              ))}
              {getVentasDelDia(currentDate).length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No hay ventas en este mes</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-[#0a1628] font-semibold mb-3">Resumen del Mes</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Ventas Totales</span>
                <span className="text-[#0a1628] font-bold">{formatUSD(ventas.filter(v => {
                  const d = new Date(v.fechaExcursion);
                  return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                }).reduce((s, v) => s + v.precioVentaUSD, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Comisiones</span>
                <span className="text-green-600">{formatUSD(ventas.filter(v => {
                  const d = new Date(v.fechaExcursion);
                  return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                }).reduce((s, v) => s + v.comisionUSD, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Ventas</span>
                <span className="text-[#0a1628]">{ventas.filter(v => {
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
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628] placeholder-gray-400 focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterExcursionProveedor}
            onChange={(e) => setFilterExcursionProveedor(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#0a1628]"
          >
            <option value="">Todos los proveedores</option>
            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <button onClick={() => { setEditingExcursionId(null); setExcursionFormData({ nombre: "", proveedorId: "", proveedorNombre: "", precioAdultoUSD: "", precioNinoUSD: "", costoProveedorAdultoUSD: "", costoProveedorNinoUSD: "", comisionAdultoUSD: "", comisionNinoUSD: "", zona: "", capacidad: "", tienePrecioNino: false, tipoPrecio: "persona", tipoServicio: "compartido" }); setShowExcursionForm(true); }} className="bg-[#0a1628] text-white px-4 py-2.5 rounded-xl hover:bg-[#1a2a42] transition-all flex items-center gap-2 shadow-lg shadow-[#0a1628]/20">
            <span className="text-lg leading-none">+</span> Nueva Excursion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {excursionesFiltradas.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">No hay excursiones registradas</div>
          ) : (
            excursionesFiltradas.map(e => (
              <div key={e.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[#0a1628] font-semibold">{e.nombre}</h3>
                    <p className="text-gray-400 text-sm">{e.proveedorNombre}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-lg text-xs">
                        {getTipoServicioLabel(e.tipoServicio)}
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-lg text-xs">
                        {e.tipoPrecio === "persona" ? "Por Persona" : "Por Maquina"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Zona: {e.zona || "Sin zona"}</p>
                    {e.capacidad && <p className="text-xs text-gray-500">Capacidad: {e.capacidad}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editExcursion(e)} className="px-3 py-1 bg-[#0a1628]/10 text-[#0a1628] rounded-lg hover:bg-[#0a1628]/20 text-xs transition-all">Editar</button>
                    <button onClick={() => deleteExcursion(e.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs transition-all">Eliminar</button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Precio Venta Adulto</span>
                    <span className="text-[#0a1628] font-medium">{formatUSD(e.precioAdultoUSD)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Costo Proveedor Adulto</span>
                    <span className="text-orange-600 font-medium">{formatUSD(e.costoProveedorAdultoUSD)}</span>
                  </div>
                  {e.precioNinoUSD !== null && (
                    <>
                      <div className="flex justify-between text-gray-500">
                        <span>Precio Venta Nino</span>
                        <span className="text-[#0a1628] font-medium">{formatUSD(e.precioNinoUSD)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Costo Proveedor Nino</span>
                        <span className="text-orange-600 font-medium">{formatUSD(e.costoProveedorNinoUSD || 0)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Comision</span>
                    <span className="text-green-600">{formatUSD(e.comisionAdultoUSD)}</span>
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
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a1628] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#0a1628]/20">
              RE
            </div>
            <div>
              <h1 className="text-[#0a1628] font-bold text-lg tracking-tight">Republic Excursions</h1>
              <p className={`text-xs ${getUserBadge()} px-2 py-0.5 rounded-full inline-block`}>{getUserRole()}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setViewMode("dashboard")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "dashboard" ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'text-gray-600 hover:text-[#0a1628] hover:bg-gray-50'}`}>
              Dashboard
            </button>
            <button onClick={() => setViewMode("ventas")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "ventas" ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'text-gray-600 hover:text-[#0a1628] hover:bg-gray-50'}`}>
              Ventas
            </button>
            <button onClick={() => setViewMode("reservas")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "reservas" ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'text-gray-600 hover:text-[#0a1628] hover:bg-gray-50'}`}>
              Reservas
            </button>
            <button onClick={() => setViewMode("calendario")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "calendario" ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'text-gray-600 hover:text-[#0a1628] hover:bg-gray-50'}`}>
              Calendario
            </button>
            {isAdmin && (
              <>
                <button onClick={() => setViewMode("clientes")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "clientes" ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'text-gray-600 hover:text-[#0a1628] hover:bg-gray-50'}`}>
                  Clientes
                </button>
                <button onClick={() => setViewMode("proveedores")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "proveedores" ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'text-gray-600 hover:text-[#0a1628] hover:bg-gray-50'}`}>
                  Proveedores
                </button>
                <button onClick={() => setViewMode("excursiones")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "excursiones" ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'text-gray-600 hover:text-[#0a1628] hover:bg-gray-50'}`}>
                  Excursiones
                </button>
                <button onClick={() => setViewMode("bancos")} className={`px-3 py-1.5 rounded-xl text-sm transition-all ${viewMode === "bancos" ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'text-gray-600 hover:text-[#0a1628] hover:bg-gray-50'}`}>
                  Bancos
                </button>
              </>
            )}
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-xl text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-all">
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0a1628]">
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
              <button onClick={() => setShowForm(true)} className="bg-[#0a1628] text-white px-4 py-2 rounded-xl hover:bg-[#1a2a42] transition-all flex items-center gap-2 shadow-lg shadow-[#0a1628]/20">
                <span className="text-lg leading-none">+</span> Nueva Venta
              </button>
            )}
          </div>
        </div>

        {renderView()}
      </main>

      {/* ============================================
          MODAL - FORMULARIO DE VENTA
      ============================================ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#0a1628] text-xl font-bold">{editingVentaId ? "Editar Venta" : "Nueva Venta"}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Cliente *</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.clienteId}
                      onChange={(e) => selectCliente(e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    >
                      <option value="">Seleccionar cliente existente</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} - {c.whatsapp}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowClienteForm(true)}
                      className="px-4 py-2 bg-[#0a1628] text-white rounded-xl hover:bg-[#1a2a42] transition-all shadow-lg shadow-[#0a1628]/20 whitespace-nowrap text-sm"
                    >
                      + Nuevo
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={formData.clienteWhatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, clienteWhatsapp: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    placeholder="WhatsApp"
                  />
                </div>
              </div>

              {/* Excursion */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Excursion *</label>
                  <select
                    value={formData.excursionId}
                    onChange={(e) => selectExcursionForVenta(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Seleccionar excursion</option>
                    {excursiones.map(e => <option key={e.id} value={e.id}>{e.nombre} - {e.proveedorNombre} ({getTipoServicioLabel(e.tipoServicio)})</option>)}
                  </select>
                  {formData.excursionId && (
                    <div className="mt-1 text-xs text-gray-400">
                      <span className="text-[#0a1628]">Proveedor:</span> {formData.proveedorNombre} | 
                      <span className="text-[#0a1628] ml-1">Servicio:</span> {getTipoServicioLabel(formData.tipoServicio)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={formData.fechaExcursion}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaExcursion: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Hora</label>
                  <input
                    type="time"
                    value={formData.horaExcursion}
                    onChange={(e) => setFormData(prev => ({ ...prev, horaExcursion: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Tipo de Servicio (solo lectura) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Tipo de Servicio</label>
                  <input
                    type="text"
                    value={getTipoServicioLabel(formData.tipoServicio)}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-[#0a1628] cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Zona</label>
                  <select
                    value={formData.zona}
                    onChange={(e) => setFormData(prev => ({ ...prev, zona: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  >
                    <option value="">Seleccionar zona</option>
                    {zonas.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              </div>

              {/* Campos condicionales para Grupo y Grupo Privado */}
              {(formData.tipoServicio === "grupo" || formData.tipoServicio === "grupo_privado") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-l-4 border-[#0a1628] pl-4">
                  <div>
                    <label className="text-gray-600 text-sm block mb-1">Nombre del Grupo *</label>
                    <input
                      type="text"
                      value={formData.nombreGrupo}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombreGrupo: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                      placeholder="Ej: Boda de María, Grupo IBM"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm block mb-1">Capacidad del Grupo *</label>
                    <input
                      type="text"
                      value={formData.capacidadGrupo}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacidadGrupo: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                      placeholder="Ej: 20 personas"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Transporte */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Transporte</label>
                  <select
                    value={formData.transporte}
                    onChange={(e) => {
                      const val = e.target.value as "si" | "no";
                      setFormData(prev => ({ ...prev, transporte: val }));
                      if (val === "no") {
                        setFormData(prev => ({ ...prev, tipoRecogida: "sin_recogida", hotelNombre: "", hotelHabitacion: "", airbnbUbicacion: "", horaRecogida: "" }));
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  >
                    <option value="no">No</option>
                    <option value="si">Si</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Tipo de Recogida</label>
                  <select
                    value={formData.tipoRecogida}
                    onChange={(e) => {
                      const val = e.target.value as "sin_recogida" | "hotel" | "airbnb";
                      setFormData(prev => ({ ...prev, tipoRecogida: val }));
                      setFormData(prev => ({ ...prev, hotelNombre: "", hotelHabitacion: "", airbnbUbicacion: "", horaRecogida: "" }));
                    }}
                    disabled={formData.transporte === "no"}
                    className={`w-full px-4 py-2 border rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all ${formData.transporte === "no" ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <option value="sin_recogida">Sin Recogida</option>
                    <option value="hotel">Hotel</option>
                    <option value="airbnb">Airbnb</option>
                  </select>
                </div>
              </div>

              {/* SECCION HOTEL - INPUT DE TEXTO LIBRE */}
              {formData.transporte === "si" && formData.tipoRecogida === "hotel" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-l-4 border-[#0a1628] pl-4">
                  <div>
                    <label className="text-gray-600 text-sm block mb-1">Hotel *</label>
                    <input
                      type="text"
                      value={formData.hotelNombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, hotelNombre: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                      placeholder="Escribe el nombre del hotel"
                      required={formData.tipoRecogida === "hotel"}
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm block mb-1">Habitacion</label>
                    <input
                      type="text"
                      value={formData.hotelHabitacion}
                      onChange={(e) => setFormData(prev => ({ ...prev, hotelHabitacion: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                      placeholder="Ej: 305, Suite 12"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm block mb-1">Hora de Recogida</label>
                    <input
                      type="time"
                      value={formData.horaRecogida}
                      onChange={(e) => setFormData(prev => ({ ...prev, horaRecogida: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* AIRBNB */}
              {formData.transporte === "si" && formData.tipoRecogida === "airbnb" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-l-4 border-[#0a1628] pl-4">
                  <div>
                    <label className="text-gray-600 text-sm block mb-1">Ubicacion Airbnb *</label>
                    <input
                      type="text"
                      value={formData.airbnbUbicacion}
                      onChange={(e) => setFormData(prev => ({ ...prev, airbnbUbicacion: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                      placeholder="Ej: Parque Central, Pueblo Bavaro"
                      required={formData.tipoRecogida === "airbnb"}
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm block mb-1">Hora de Recogida</label>
                    <input
                      type="time"
                      value={formData.horaRecogida}
                      onChange={(e) => setFormData(prev => ({ ...prev, horaRecogida: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* SIN RECOGIDA */}
              {formData.transporte === "si" && formData.tipoRecogida === "sin_recogida" && (
                <div className="text-sm text-gray-400 italic pl-4 border-l-4 border-[#0a1628]">
                  El cliente se transporta por sus propios medios.
                </div>
              )}

              {/* Adultos, Niños y Estado */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Adultos</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cantidadAdultos}
                    onChange={handleCantidadAdultosChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Niños</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cantidadNinos}
                    onChange={handleCantidadNinosChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as any }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              </div>

              {/* Precios */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Precio Venta Adulto (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioAdultoUSD}
                    onChange={handlePrecioAdultoChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Costo Proveedor Adulto (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costoProveedorAdultoUSD}
                    onChange={handleCostoAdultoChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Precio Venta Nino (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioNinoUSD}
                    onChange={handlePrecioNinoChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Costo Proveedor Nino (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costoProveedorNinoUSD}
                    onChange={handleCostoNinoChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Totales */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div>
                  <label className="text-gray-500 text-sm block mb-1">Total Venta</label>
                  <input
                    type="text"
                    value={formData.precioTotalUSD}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-[#0a1628] font-bold text-lg"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-sm block mb-1">Costo Proveedor</label>
                  <input
                    type="text"
                    value={formData.costoTotalUSD}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-orange-600 font-bold text-lg"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-sm block mb-1">Comision</label>
                  <input
                    type="text"
                    value={formData.comisionTotalUSD}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-green-600 font-bold text-lg"
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 bg-[#0a1628] text-white rounded-xl hover:bg-[#1a2a42] transition-all shadow-lg shadow-[#0a1628]/20">
                  {editingVentaId ? "Actualizar Venta" : "Registrar Venta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Cliente */}
      {showClienteForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#0a1628] text-xl font-bold">Nuevo Cliente</h3>
              <button onClick={() => setShowClienteForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleClienteSubmit} className="space-y-4">
              <div>
                <label className="text-gray-600 text-sm block mb-1">Nombre</label>
                <input type="text" name="nombre" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all" required />
              </div>
              <div>
                <label className="text-gray-600 text-sm block mb-1">WhatsApp</label>
                <input type="text" name="whatsapp" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="text-gray-600 text-sm block mb-1">Email</label>
                <input type="email" name="email" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="text-gray-600 text-sm block mb-1">Excursion</label>
                <select name="excursionId" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all">
                  <option value="">Seleccionar excursion</option>
                  {excursiones.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-sm block mb-1">Fecha</label>
                <input type="date" name="fechaExcursion" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowClienteForm(false)} className="px-6 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 bg-[#0a1628] text-white rounded-xl hover:bg-[#1a2a42] transition-all shadow-lg shadow-[#0a1628]/20">
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Proveedor */}
      {showProveedorForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#0a1628] text-xl font-bold">{editingProveedorId ? "Editar Proveedor" : "Nuevo Proveedor"}</h3>
              <button onClick={() => { setShowProveedorForm(false); setEditingProveedorId(null); }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleProveedorSubmit} className="space-y-4">
              {/* Datos del Proveedor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Nombre</label>
                  <input
                    type="text"
                    value={proveedorFormData.nombre}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Empresa</label>
                  <input
                    type="text"
                    value={proveedorFormData.empresa}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, empresa: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Telefono</label>
                  <input
                    type="text"
                    value={proveedorFormData.telefono}
                    onChange={manejarCambioTelefono}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    placeholder="(XXX) XXX-XXXX"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Email</label>
                  <input
                    type="email"
                    value={proveedorFormData.email}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Tipo de Documento</label>
                  <select
                    value={proveedorFormData.tipoDocumento}
                    onChange={(e) => {
                      setProveedorFormData(prev => ({ 
                        ...prev, 
                        tipoDocumento: e.target.value as "rnc" | "cedula",
                        rncCedula: ""
                      }));
                    }}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  >
                    <option value="cedula">Cedula</option>
                    <option value="rnc">RNC</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">{proveedorFormData.tipoDocumento === "rnc" ? "RNC" : "Cedula"}</label>
                  <input
                    type="text"
                    value={proveedorFormData.rncCedula}
                    onChange={manejarCambioRNCcedula}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    placeholder={proveedorFormData.tipoDocumento === "rnc" ? "XX-XXXXXXX-X" : "XXX-XXXXXXX-X"}
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-600 text-sm block mb-2">Metodos de Pago</label>
                <div className="flex gap-4 flex-wrap">
                  <button type="button" onClick={() => toggleMetodoPago("efectivo")} className={`px-4 py-2 rounded-xl transition-all ${proveedorFormData.metodosPago.includes("efectivo") ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'bg-gray-100 border border-gray-200 text-gray-600'}`}>
                    Efectivo
                  </button>
                  <button type="button" onClick={() => toggleMetodoPago("transferencia")} className={`px-4 py-2 rounded-xl transition-all ${proveedorFormData.metodosPago.includes("transferencia") ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'bg-gray-100 border border-gray-200 text-gray-600'}`}>
                    Transferencia
                  </button>
                  <button type="button" onClick={() => toggleMetodoPago("paypal")} className={`px-4 py-2 rounded-xl transition-all ${proveedorFormData.metodosPago.includes("paypal") ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'bg-gray-100 border border-gray-200 text-gray-600'}`}>
                    PayPal
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Banco</label>
                  <select
                    value={proveedorFormData.banco}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, banco: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  >
                    <option value="">Seleccionar banco</option>
                    {BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Numero de Cuenta</label>
                  <input
                    type="text"
                    value={proveedorFormData.numeroCuenta}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, numeroCuenta: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Moneda</label>
                  <select
                    value={proveedorFormData.monedaCuenta}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, monedaCuenta: e.target.value as "USD" | "RD$" }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  >
                    <option value="RD$">RD$</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-2">Tipo de Cuenta</label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => toggleTipoCuenta("corriente")} className={`px-4 py-2 rounded-xl transition-all ${proveedorFormData.tipoCuenta.includes("corriente") ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'bg-gray-100 border border-gray-200 text-gray-600'}`}>
                      Corriente
                    </button>
                    <button type="button" onClick={() => toggleTipoCuenta("ahorros")} className={`px-4 py-2 rounded-xl transition-all ${proveedorFormData.tipoCuenta.includes("ahorros") ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'bg-gray-100 border border-gray-200 text-gray-600'}`}>
                      Ahorros
                    </button>
                    <button type="button" onClick={() => toggleTipoCuenta("corriente_us")} className={`px-4 py-2 rounded-xl transition-all ${proveedorFormData.tipoCuenta.includes("corriente_us") ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'bg-gray-100 border border-gray-200 text-gray-600'}`}>
                      Corriente US
                    </button>
                    <button type="button" onClick={() => toggleTipoCuenta("ahorros_us")} className={`px-4 py-2 rounded-xl transition-all ${proveedorFormData.tipoCuenta.includes("ahorros_us") ? 'bg-[#0a1628] text-white shadow-lg shadow-[#0a1628]/20' : 'bg-gray-100 border border-gray-200 text-gray-600'}`}>
                      Ahorros US
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Tipo de Beneficiario</label>
                  <select
                    value={proveedorFormData.tipoBeneficiario}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, tipoBeneficiario: e.target.value as "personal" | "empresarial" }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  >
                    <option value="personal">Personal</option>
                    <option value="empresarial">Empresarial</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Beneficiario</label>
                  <input
                    type="text"
                    value={proveedorFormData.beneficiario}
                    onChange={(e) => setProveedorFormData(prev => ({ ...prev, beneficiario: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* ============================================
                  EXCURSIONES DEL PROVEEDOR CON CAPACIDAD Y TIPO SERVICIO
              ============================================ */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h4 className="text-[#0a1628] font-semibold mb-3">Excursiones del Proveedor</h4>
                <div className="space-y-2 mb-3">
                  {tempExcursiones.map((e, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2">
                      <div>
                        <span className="text-[#0a1628]">{e.nombre}</span>
                        <span className="text-gray-500 text-sm ml-2">Precio Venta: {formatUSD(e.precioAdultoUSD)}</span>
                        {e.precioNinoUSD !== null && <span className="text-gray-500 text-sm ml-2">Nino: {formatUSD(e.precioNinoUSD)}</span>}
                        <span className="text-orange-600 text-sm ml-2">Costo: {formatUSD(e.costoProveedorAdultoUSD)}</span>
                        <span className="text-blue-600 text-xs ml-2">{getTipoServicioLabel(e.tipoServicio)}</span>
                        <span className="text-gray-400 text-xs ml-2">Zona: {e.zona || "Sin zona"}</span>
                        <span className="text-gray-400 text-xs ml-2">Tipo: {e.tipoPrecio === "persona" ? "Persona" : "Maquina"}</span>
                        {e.capacidad && <span className="text-green-600 text-xs ml-2">Cap: {e.capacidad}</span>}
                      </div>
                      <button type="button" onClick={() => eliminarTempExcursion(i)} className="text-red-400 hover:text-red-600">×</button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={tempExcursionForm.nombre}
                    onChange={(e) => setTempExcursionForm(prev => ({ ...prev, nombre: e.target.value }))}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    placeholder="Nombre de excursion"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={tempExcursionForm.precioAdultoUSD}
                      onChange={(e) => setTempExcursionForm(prev => ({ ...prev, precioAdultoUSD: e.target.value }))}
                      className="w-1/2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                      placeholder="Precio Venta"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={tempExcursionForm.precioNinoUSD}
                      onChange={(e) => setTempExcursionForm(prev => ({ ...prev, precioNinoUSD: e.target.value }))}
                      className="w-1/2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                      placeholder="Precio Nino"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <input
                    type="number"
                    step="0.01"
                    value={tempExcursionForm.costoProveedorAdultoUSD}
                    onChange={(e) => setTempExcursionForm(prev => ({ ...prev, costoProveedorAdultoUSD: e.target.value }))}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    placeholder="Costo Proveedor"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={tempExcursionForm.costoProveedorNinoUSD}
                    onChange={(e) => setTempExcursionForm(prev => ({ ...prev, costoProveedorNinoUSD: e.target.value }))}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    placeholder="Costo Nino"
                  />
                  <input
                    type="text"
                    value={tempExcursionForm.capacidad}
                    onChange={(e) => setTempExcursionForm(prev => ({ ...prev, capacidad: e.target.value }))}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    placeholder="Capacidad (ej: 20 personas)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-gray-600 text-sm block mb-1">Zona</label>
                    <div className="flex gap-2">
                      <select
                        value={tempExcursionForm.zona}
                        onChange={(e) => setTempExcursionForm(prev => ({ ...prev, zona: e.target.value }))}
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                      >
                        <option value="">Seleccionar zona</option>
                        {zonas.map(z => <option key={z} value={z}>{z}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const nuevaZona = agregarZona();
                          if (nuevaZona) {
                            setTempExcursionForm(prev => ({ ...prev, zona: nuevaZona }));
                          }
                        }}
                        className="px-4 py-2 bg-[#0a1628] text-white rounded-xl hover:bg-[#1a2a42] transition-all shadow-lg shadow-[#0a1628]/20 whitespace-nowrap text-sm"
                      >
                        + Agregar Zona
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm block mb-1">Tipo de Precio</label>
                    <select
                      value={tempExcursionForm.tipoPrecio}
                      onChange={(e) => setTempExcursionForm(prev => ({ ...prev, tipoPrecio: e.target.value as "persona" | "maquina" }))}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    >
                      <option value="persona">Por Persona</option>
                      <option value="maquina">Por Maquina</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-gray-600 text-sm block mb-1">Tipo de Servicio</label>
                    <select
                      value={tempExcursionForm.tipoServicio}
                      onChange={(e) => setTempExcursionForm(prev => ({ ...prev, tipoServicio: e.target.value as "compartido" | "privado" | "grupo" | "grupo_privado" }))}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    >
                      {TIPOS_SERVICIO.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end gap-4">
                    <label className="flex items-center gap-2 text-gray-600 text-sm">
                      <input
                        type="checkbox"
                        checked={tempExcursionForm.tienePrecioNino}
                        onChange={(e) => setTempExcursionForm(prev => ({ ...prev, tienePrecioNino: e.target.checked }))}
                      />
                      Tiene precio para niños
                    </label>
                    <button type="button" onClick={agregarTempExcursion} className="px-4 py-2 bg-[#0a1628] text-white rounded-xl hover:bg-[#1a2a42] transition-all shadow-lg shadow-[#0a1628]/20 text-sm whitespace-nowrap">
                      Agregar Excursion
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setShowProveedorForm(false); setEditingProveedorId(null); }} className="px-6 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 bg-[#0a1628] text-white rounded-xl hover:bg-[#1a2a42] transition-all shadow-lg shadow-[#0a1628]/20">
                  {editingProveedorId ? "Actualizar Proveedor" : "Guardar Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Excursion */}
      {showExcursionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#0a1628] text-xl font-bold">{editingExcursionId ? "Editar Excursion" : "Nueva Excursion"}</h3>
              <button onClick={() => { setShowExcursionForm(false); setEditingExcursionId(null); }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleExcursionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Nombre</label>
                  <input
                    type="text"
                    value={excursionFormData.nombre}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Proveedor</label>
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
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Precio Venta Adulto (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={excursionFormData.precioAdultoUSD}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, precioAdultoUSD: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Precio Venta Nino (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={excursionFormData.precioNinoUSD}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, precioNinoUSD: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Costo Proveedor Adulto (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={excursionFormData.costoProveedorAdultoUSD}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, costoProveedorAdultoUSD: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Costo Proveedor Nino (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={excursionFormData.costoProveedorNinoUSD}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, costoProveedorNinoUSD: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Zona</label>
                  <div className="flex gap-2">
                    <select
                      value={excursionFormData.zona}
                      onChange={(e) => setExcursionFormData(prev => ({ ...prev, zona: e.target.value }))}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    >
                      <option value="">Seleccionar zona</option>
                      {zonas.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const nuevaZona = agregarZona();
                        if (nuevaZona) {
                          setExcursionFormData(prev => ({ ...prev, zona: nuevaZona }));
                        }
                      }}
                      className="px-4 py-2 bg-[#0a1628] text-white rounded-xl hover:bg-[#1a2a42] transition-all shadow-lg shadow-[#0a1628]/20 whitespace-nowrap text-sm"
                    >
                      + Agregar Zona
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Capacidad</label>
                  <input
                    type="text"
                    value={excursionFormData.capacidad}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, capacidad: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                    placeholder="Ej: 20 personas"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Tipo de Precio</label>
                  <select
                    value={excursionFormData.tipoPrecio}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, tipoPrecio: e.target.value as "persona" | "maquina" }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  >
                    <option value="persona">Por Persona</option>
                    <option value="maquina">Por Maquina</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block mb-1">Tipo de Servicio</label>
                  <select
                    value={excursionFormData.tipoServicio}
                    onChange={(e) => setExcursionFormData(prev => ({ ...prev, tipoServicio: e.target.value as "compartido" | "privado" | "grupo" | "grupo_privado" }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a1628] focus:ring-2 focus:ring-[#0a1628] focus:border-transparent transition-all"
                  >
                    {TIPOS_SERVICIO.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-gray-600 text-sm">
                    <input
                      type="checkbox"
                      checked={excursionFormData.tienePrecioNino}
                      onChange={(e) => setExcursionFormData(prev => ({ ...prev, tienePrecioNino: e.target.checked }))}
                    />
                    Tiene precio para niños
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setShowExcursionForm(false); setEditingExcursionId(null); }} className="px-6 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 bg-[#0a1628] text-white rounded-xl hover:bg-[#1a2a42] transition-all shadow-lg shadow-[#0a1628]/20">
                  {editingExcursionId ? "Actualizar Excursion" : "Guardar Excursion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
