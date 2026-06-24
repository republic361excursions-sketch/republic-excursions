"use client";

import { useState, useEffect } from "react";

// ============================================
// INTERFACES
// ============================================
interface Excursion {
  id: string;
  nombre: string;
  precioVentaUSD: number;
  comisionPorcentaje: number;
  comisionUSD: number;
  aFacturarUSD: number;
  proveedorId: string;
  proveedorNombre: string;
  tipoCliente: "adulto" | "nino";
  zona?: string;
  capacidad?: string;
}

interface Proveedor {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  metodoPago: "efectivo" | "transferencia" | "paypal";
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
  precioVentaUSD: number;
  comisionPorcentaje: number;
  comisionUSD: number;
  aFacturarUSD: number;
  pagoCliente: "completo" | "deposito_25" | "pago_dia";
  montoPagadoUSD: number;
  saldoPendienteUSD: number;
  metodoPagoCliente: "efectivo" | "tarjeta" | "transferencia" | "paypal";
  proveedorId: string;
  proveedorNombre: string;
  proveedorPagado: "pendiente" | "pagado";
  metodoPagoProveedor: "efectivo" | "transferencia" | "paypal";
  tipoCliente: "adulto" | "nino";
  cantidadPersonas: number;
  nota: string;
}

// ============================================
// DATOS PRECARGADOS - PROVEEDORES
// ============================================
const PROVEEDORES_INICIALES: Proveedor[] = [
  {
    id: "prov1",
    nombre: "Dominican Way Travel",
    telefono: "809-555-0101",
    email: "info@dominicanway.com",
    metodoPago: "transferencia",
    nota: "Proveedor principal de excursiones"
  },
  {
    id: "prov2",
    nombre: "Buggy Adventure RD",
    telefono: "809-555-0102",
    email: "info@buggyadventurerd.com",
    metodoPago: "efectivo",
    nota: "Especialistas en buggies y ATV"
  },
  {
    id: "prov3",
    nombre: "Excursiones Tropicales",
    telefono: "809-555-0103",
    email: "info@excursionestropicales.com",
    metodoPago: "transferencia",
    nota: "Caballos, Monkeyland y Scuba Doo"
  }
];

// ============================================
// DATOS PRECARGADOS - EXCURSIONES
// ============================================
const EXCURSIONES_INICIALES: Excursion[] = [
  // DOMINICAN WAY TRAVEL
  {
    id: "exc1",
    nombre: "Isla Saona - Bávaro (Adulto)",
    precioVentaUSD: 75,
    comisionPorcentaje: 46.67,
    comisionUSD: 35,
    aFacturarUSD: 40,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "adulto",
    zona: "Bávaro"
  },
  {
    id: "exc2",
    nombre: "Isla Saona - Bávaro (Niño)",
    precioVentaUSD: 50,
    comisionPorcentaje: 40,
    comisionUSD: 20,
    aFacturarUSD: 30,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "nino",
    zona: "Bávaro"
  },
  {
    id: "exc3",
    nombre: "Isla Saona - Uvero Alto (Adulto)",
    precioVentaUSD: 75,
    comisionPorcentaje: 40,
    comisionUSD: 30,
    aFacturarUSD: 45,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "adulto",
    zona: "Uvero Alto"
  },
  {
    id: "exc4",
    nombre: "Isla Saona - Uvero Alto (Niño)",
    precioVentaUSD: 50,
    comisionPorcentaje: 40,
    comisionUSD: 20,
    aFacturarUSD: 30,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "nino",
    zona: "Uvero Alto"
  },
  {
    id: "exc5",
    nombre: "Isla Saona - Cabeza de Toro (Adulto)",
    precioVentaUSD: 75,
    comisionPorcentaje: 40,
    comisionUSD: 30,
    aFacturarUSD: 45,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "adulto",
    zona: "Cabeza de Toro"
  },
  {
    id: "exc6",
    nombre: "Isla Saona - Cabeza de Toro (Niño)",
    precioVentaUSD: 50,
    comisionPorcentaje: 40,
    comisionUSD: 20,
    aFacturarUSD: 30,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "nino",
    zona: "Cabeza de Toro"
  },
  {
    id: "exc7",
    nombre: "Isla Catalina (Adulto)",
    precioVentaUSD: 75,
    comisionPorcentaje: 46.67,
    comisionUSD: 35,
    aFacturarUSD: 40,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "adulto"
  },
  {
    id: "exc8",
    nombre: "Isla Catalina (Niño)",
    precioVentaUSD: 50,
    comisionPorcentaje: 40,
    comisionUSD: 20,
    aFacturarUSD: 30,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "nino"
  },
  {
    id: "exc9",
    nombre: "Santo Domingo (Adulto)",
    precioVentaUSD: 70,
    comisionPorcentaje: 42.86,
    comisionUSD: 30,
    aFacturarUSD: 40,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "adulto"
  },
  {
    id: "exc10",
    nombre: "Santo Domingo (Niño)",
    precioVentaUSD: 50,
    comisionPorcentaje: 40,
    comisionUSD: 20,
    aFacturarUSD: 30,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "nino"
  },
  {
    id: "exc11",
    nombre: "Samaná Ballenas (Adulto)",
    precioVentaUSD: 120,
    comisionPorcentaje: 25,
    comisionUSD: 30,
    aFacturarUSD: 90,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "adulto"
  },
  {
    id: "exc12",
    nombre: "Samaná Ballenas (Niño)",
    precioVentaUSD: 80,
    comisionPorcentaje: 25,
    comisionUSD: 20,
    aFacturarUSD: 60,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "nino"
  },
  {
    id: "exc13",
    nombre: "Samaná (Adulto)",
    precioVentaUSD: 80,
    comisionPorcentaje: 12.5,
    comisionUSD: 10,
    aFacturarUSD: 70,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "adulto"
  },
  {
    id: "exc14",
    nombre: "Samaná (Niño)",
    precioVentaUSD: 65,
    comisionPorcentaje: 7.69,
    comisionUSD: 5,
    aFacturarUSD: 60,
    proveedorId: "prov1",
    proveedorNombre: "Dominican Way Travel",
    tipoCliente: "nino"
  },

  // BUGGY ADVENTURE RD
  {
    id: "exc15",
    nombre: "ATV/Moto (1 persona)",
    precioVentaUSD: 50,
    comisionPorcentaje: 40,
    comisionUSD: 20,
    aFacturarUSD: 30,
    proveedorId: "prov2",
    proveedorNombre: "Buggy Adventure RD",
    tipoCliente: "adulto",
    capacidad: "1 persona"
  },
  {
    id: "exc16",
    nombre: "Buggy Normal (1 persona)",
    precioVentaUSD: 45,
    comisionPorcentaje: 33.33,
    comisionUSD: 15,
    aFacturarUSD: 30,
    proveedorId: "prov2",
    proveedorNombre: "Buggy Adventure RD",
    tipoCliente: "adulto",
    capacidad: "1 persona"
  },
  {
    id: "exc17",
    nombre: "Buggy Doble (2 personas)",
    precioVentaUSD: 130,
    comisionPorcentaje: 80.77,
    comisionUSD: 105,
    aFacturarUSD: 25,
    proveedorId: "prov2",
    proveedorNombre: "Buggy Adventure RD",
    tipoCliente: "adulto",
    capacidad: "2 personas"
  },
  {
    id: "exc18",
    nombre: "Buggy Familiar (4 personas)",
    precioVentaUSD: 185,
    comisionPorcentaje: 72.97,
    comisionUSD: 135,
    aFacturarUSD: 50,
    proveedorId: "prov2",
    proveedorNombre: "Buggy Adventure RD",
    tipoCliente: "adulto",
    capacidad: "4 personas"
  },
  {
    id: "exc19",
    nombre: "Buggy Kayo (1 persona)",
    precioVentaUSD: 80,
    comisionPorcentaje: 25,
    comisionUSD: 20,
    aFacturarUSD: 60,
    proveedorId: "prov2",
    proveedorNombre: "Buggy Adventure RD",
    tipoCliente: "adulto",
    capacidad: "1 persona"
  },
  {
    id: "exc20",
    nombre: "Buggy VIP Doble (2 personas)",
    precioVentaUSD: 195,
    comisionPorcentaje: 74.36,
    comisionUSD: 145,
    aFacturarUSD: 50,
    proveedorId: "prov2",
    proveedorNombre: "Buggy Adventure RD",
    tipoCliente: "adulto",
    capacidad: "2 personas"
  },
  {
    id: "exc21",
    nombre: "Buggy VIP Familiar (4 personas)",
    precioVentaUSD: 150,
    comisionPorcentaje: 33.33,
    comisionUSD: 50,
    aFacturarUSD: 100,
    proveedorId: "prov2",
    proveedorNombre: "Buggy Adventure RD",
    tipoCliente: "adulto",
    capacidad: "4 personas"
  },

  // EXCURSIONES TROPICALES
  {
    id: "exc22",
    nombre: "Caballos",
    precioVentaUSD: 50,
    comisionPorcentaje: 50,
    comisionUSD: 25,
    aFacturarUSD: 25,
    proveedorId: "prov3",
    proveedorNombre: "Excursiones Tropicales",
    tipoCliente: "adulto"
  },
  {
    id: "exc23",
    nombre: "Monkeyland",
    precioVentaUSD: 99,
    comisionPorcentaje: 34.34,
    comisionUSD: 34,
    aFacturarUSD: 65,
    proveedorId: "prov3",
    proveedorNombre: "Excursiones Tropicales",
    tipoCliente: "adulto"
  },
  {
    id: "exc24",
    nombre: "Scuba Doo - Bávaro",
    precioVentaUSD: 70,
    comisionPorcentaje: 50,
    comisionUSD: 35,
    aFacturarUSD: 35,
    proveedorId: "prov3",
    proveedorNombre: "Excursiones Tropicales",
    tipoCliente: "adulto",
    zona: "Bávaro"
  },
  {
    id: "exc25",
    nombre: "Scuba Doo - Bávaro (Niño)",
    precioVentaUSD: 35,
    comisionPorcentaje: 50,
    comisionUSD: 17.50,
    aFacturarUSD: 17.50,
    proveedorId: "prov3",
    proveedorNombre: "Excursiones Tropicales",
    tipoCliente: "nino",
    zona: "Bávaro"
  },
  {
    id: "exc26",
    nombre: "Scuba Doo - Uvero Alto",
    precioVentaUSD: 50,
    comisionPorcentaje: 10,
    comisionUSD: 5,
    aFacturarUSD: 45,
    proveedorId: "prov3",
    proveedorNombre: "Excursiones Tropicales",
    tipoCliente: "adulto",
    zona: "Uvero Alto"
  },
  {
    id: "exc27",
    nombre: "Scuba Doo - Uvero Alto (Niño)",
    precioVentaUSD: 40,
    comisionPorcentaje: 10,
    comisionUSD: 4,
    aFacturarUSD: 36,
    proveedorId: "prov3",
    proveedorNombre: "Excursiones Tropicales",
    tipoCliente: "nino",
    zona: "Uvero Alto"
  },
  {
    id: "exc28",
    nombre: "Party Boat",
    precioVentaUSD: 70,
    comisionPorcentaje: 64.29,
    comisionUSD: 45,
    aFacturarUSD: 25,
    proveedorId: "prov3",
    proveedorNombre: "Excursiones Tropicales",
    tipoCliente: "adulto"
  },
  {
    id: "exc29",
    nombre: "Party Boat (Niño)",
    precioVentaUSD: 50,
    comisionPorcentaje: 50,
    comisionUSD: 25,
    aFacturarUSD: 25,
    proveedorId: "prov3",
    proveedorNombre: "Excursiones Tropicales",
    tipoCliente: "nino"
  }
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<"raul" | "gabrielle" | null>(null);
  const [loginError, setLoginError] = useState("");
  
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>(PROVEEDORES_INICIALES);
  const [excursiones, setExcursiones] = useState<Excursion[]>(EXCURSIONES_INICIALES);
  
  const [showForm, setShowForm] = useState(false);
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [showProveedorForm, setShowProveedorForm] = useState(false);
  const [showExcursionForm, setShowExcursionForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"dashboard" | "ventas" | "clientes" | "proveedores" | "excursiones">("dashboard");
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(null);

  const [formData, setFormData] = useState({
    clienteNombre: "",
    clienteWhatsapp: "",
    clienteEmail: "",
    excursionId: "",
    excursionNombre: "",
    fechaExcursion: "",
    precioVentaUSD: "",
    comisionPorcentaje: "",
    comisionUSD: "",
    aFacturarUSD: "",
    pagoCliente: "completo" as "completo" | "deposito_25" | "pago_dia",
    montoPagadoUSD: "",
    saldoPendienteUSD: "",
    metodoPagoCliente: "efectivo" as "efectivo" | "tarjeta" | "transferencia" | "paypal",
    proveedorId: "",
    proveedorNombre: "",
    proveedorPagado: "pendiente" as "pendiente" | "pagado",
    metodoPagoProveedor: "efectivo" as "efectivo" | "transferencia" | "paypal",
    tipoCliente: "adulto" as "adulto" | "nino",
    cantidadPersonas: 1,
    nota: "",
  });

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
      setLoginError("Usuario o contraseña incorrectos");
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
    const savedVentas = localStorage.getItem("excursiones_ventas_v5");
    const savedClientes = localStorage.getItem("excursiones_clientes_v5");
    const savedProveedores = localStorage.getItem("excursiones_proveedores_v5");
    const savedExcursiones = localStorage.getItem("excursiones_excursiones_v5");
    
    if (savedVentas) setVentas(JSON.parse(savedVentas));
    if (savedClientes) setClientes(JSON.parse(savedClientes));
    if (savedProveedores) setProveedores(JSON.parse(savedProveedores));
    if (savedExcursiones) setExcursiones(JSON.parse(savedExcursiones));
  }, []);

  const saveVentas = (data: Venta[]) => {
    setVentas(data);
    localStorage.setItem("excursiones_ventas_v5", JSON.stringify(data));
  };

  const saveClientes = (data: Cliente[]) => {
    setClientes(data);
    localStorage.setItem("excursiones_clientes_v5", JSON.stringify(data));
  };

  const saveProveedores = (data: Proveedor[]) => {
    setProveedores(data);
    localStorage.setItem("excursiones_proveedores_v5", JSON.stringify(data));
  };

  const saveExcursiones = (data: Excursion[]) => {
    setExcursiones(data);
    localStorage.setItem("excursiones_excursiones_v5", JSON.stringify(data));
  };

  // ============================================
  // CALCULAR COMISIÓN Y A FACTURAR
  // ============================================
  const calcularComision = (precio: string, porcentaje: string) => {
    const p = parseFloat(precio) || 0;
    const porc = parseFloat(porcentaje) || 0;
    const comision = p * (porc / 100);
    const aFacturar = p - comision;
    return { comision, aFacturar };
  };

  // ============================================
  // HANDLE EXCURSIÓN
  // ============================================
  const handleExcursionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    
    const precioVentaUSD = parseFloat(data.get("precioVentaUSD") as string);
    const comisionPorcentaje = parseFloat(data.get("comisionPorcentaje") as string);
    const comisionUSD = precioVentaUSD * (comisionPorcentaje / 100);
    const aFacturarUSD = precioVentaUSD - comisionUSD;
    
    const nuevaExcursion: Excursion = {
      id: Date.now().toString(),
      nombre: data.get("nombre") as string,
      precioVentaUSD,
      comisionPorcentaje,
      comisionUSD,
      aFacturarUSD,
      proveedorId: data.get("proveedorId") as string,
      proveedorNombre: proveedores.find(p => p.id === data.get("proveedorId"))?.nombre || "",
      tipoCliente: data.get("tipoCliente") as "adulto" | "nino",
      zona: data.get("zona") as string || undefined,
      capacidad: data.get("capacidad") as string || undefined,
    };
    
    saveExcursiones([...excursiones, nuevaExcursion]);
    setShowExcursionForm(false);
    alert("Excursión agregada correctamente");
  };

  // ============================================
  // HANDLE PROVEEDOR
  // ============================================
  const handleProveedorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    
    const nuevoProveedor: Proveedor = {
      id: Date.now().toString(),
      nombre: data.get("nombre") as string,
      telefono: data.get("telefono") as string,
      email: data.get("email") as string,
      metodoPago: data.get("metodoPago") as "efectivo" | "transferencia" | "paypal",
      nota: data.get("nota") as string || "",
    };
    
    saveProveedores([...proveedores, nuevoProveedor]);
    setShowProveedorForm(false);
    alert("Proveedor agregado correctamente");
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
      excursionId,
      excursionNombre: excursion?.nombre || "",
      fechaExcursion: data.get("fechaExcursion") as string,
    };
    
    saveClientes([...clientes, nuevoCliente]);
    setShowClienteForm(false);
    alert("Cliente agregado correctamente");
  };

  // ============================================
  // HANDLE VENTA
  // ============================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const precioVentaUSD = parseFloat(formData.precioVentaUSD);
    const comisionPorcentaje = parseFloat(formData.comisionPorcentaje);
    const comisionUSD = precioVentaUSD * (comisionPorcentaje / 100);
    const aFacturarUSD = precioVentaUSD - comisionUSD;
    const montoPagadoUSD = parseFloat(formData.montoPagadoUSD) || 0;
    const cantidad = parseInt(formData.cantidadPersonas.toString()) || 1;
    
    let saldoPendienteUSD = 0;
    if (formData.pagoCliente === "completo") {
      saldoPendienteUSD = 0;
    } else if (formData.pagoCliente === "deposito_25") {
      saldoPendienteUSD = precioVentaUSD * 0.75;
    } else if (formData.pagoCliente === "pago_dia") {
      saldoPendienteUSD = precioVentaUSD;
    }

    const nuevaVenta: Venta = {
      id: editingId || Date.now().toString(),
      clienteNombre: formData.clienteNombre,
      clienteWhatsapp: formData.clienteWhatsapp,
      clienteEmail: formData.clienteEmail,
      excursionId: formData.excursionId,
      excursionNombre: formData.excursionNombre,
      fechaExcursion: formData.fechaExcursion,
      precioVentaUSD: precioVentaUSD * cantidad,
      comisionPorcentaje,
      comisionUSD: comisionUSD * cantidad,
      aFacturarUSD: aFacturarUSD * cantidad,
      pagoCliente: formData.pagoCliente,
      montoPagadoUSD,
      saldoPendienteUSD: saldoPendienteUSD * cantidad,
      metodoPagoCliente: formData.metodoPagoCliente,
      proveedorId: formData.proveedorId,
      proveedorNombre: formData.proveedorNombre,
      proveedorPagado: formData.proveedorPagado,
      metodoPagoProveedor: formData.metodoPagoProveedor,
      tipoCliente: formData.tipoCliente,
      cantidadPersonas: cantidad,
      nota: formData.nota,
    };

    if (editingId) {
      const updated = ventas.map(v => v.id === editingId ? nuevaVenta : v);
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
      precioVentaUSD: "",
      comisionPorcentaje: "",
      comisionUSD: "",
      aFacturarUSD: "",
      pagoCliente: "completo",
      montoPagadoUSD: "",
      saldoPendienteUSD: "",
      metodoPagoCliente: "efectivo",
      proveedorId: "",
      proveedorNombre: "",
      proveedorPagado: "pendiente",
      metodoPagoProveedor: "efectivo",
      tipoCliente: "adulto",
      cantidadPersonas: 1,
      nota: "",
    });
    setShowForm(false);
    setEditingId(null);
    setSelectedExcursion(null);
    setCantidadPersonas(1);
  };

  // ============================================
  // SELECCIONAR EXCURSIÓN
  // ============================================
  const selectExcursion = (excursionId: string) => {
    const excursion = excursiones.find(e => e.id === excursionId);
    if (excursion) {
      setSelectedExcursion(excursion);
      const cantidad = parseInt(formData.cantidadPersonas.toString()) || 1;
      
      setFormData({
        ...formData,
        excursionId: excursion.id,
        excursionNombre: excursion.nombre,
        precioVentaUSD: (excursion.precioVentaUSD * cantidad).toString(),
        comisionPorcentaje: excursion.comisionPorcentaje.toString(),
        comisionUSD: (excursion.comisionUSD * cantidad).toString(),
        aFacturarUSD: (excursion.aFacturarUSD * cantidad).toString(),
        proveedorId: excursion.proveedorId,
        proveedorNombre: excursion.proveedorNombre,
        tipoCliente: excursion.tipoCliente,
      });
    }
  };

  // ============================================
  // ACTUALIZAR CANTIDAD DE PERSONAS
  // ============================================
  const updateCantidadPersonas = (cantidad: number) => {
    setCantidadPersonas(cantidad);
    if (selectedExcursion) {
      const precioTotal = selectedExcursion.precioVentaUSD * cantidad;
      const comisionTotal = selectedExcursion.comisionUSD * cantidad;
      const aFacturarTotal = selectedExcursion.aFacturarUSD * cantidad;
      
      setFormData({
        ...formData,
        cantidadPersonas: cantidad,
        precioVentaUSD: precioTotal.toString(),
        comisionUSD: comisionTotal.toString(),
        aFacturarUSD: aFacturarTotal.toString(),
      });
    }
  };

  // ============================================
  // CALCULAR COMISIÓN AL CAMBIAR PRECIO O %
  // ============================================
  const handleComisionChange = (campo: "precioVentaUSD" | "comisionPorcentaje", valor: string) => {
    const newFormData = { ...formData, [campo]: valor };
    const precio = campo === "precioVentaUSD" ? valor : formData.precioVentaUSD;
    const porcentaje = campo === "comisionPorcentaje" ? valor : formData.comisionPorcentaje;
    const { comision, aFacturar } = calcularComision(precio, porcentaje);
    newFormData.comisionUSD = comision.toString();
    newFormData.aFacturarUSD = aFacturar.toString();
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
      precioVentaUSD: venta.precioVentaUSD.toString(),
      comisionPorcentaje: venta.comisionPorcentaje.toString(),
      comisionUSD: venta.comisionUSD.toString(),
      aFacturarUSD: venta.aFacturarUSD.toString(),
      pagoCliente: venta.pagoCliente,
      montoPagadoUSD: venta.montoPagadoUSD.toString(),
      saldoPendienteUSD: venta.saldoPendienteUSD.toString(),
      metodoPagoCliente: venta.metodoPagoCliente,
      proveedorId: venta.proveedorId,
      proveedorNombre: venta.proveedorNombre,
      proveedorPagado: venta.proveedorPagado,
      metodoPagoProveedor: venta.metodoPagoProveedor,
      tipoCliente: venta.tipoCliente,
      cantidadPersonas: venta.cantidadPersonas,
      nota: venta.nota,
    });
    setCantidadPersonas(venta.cantidadPersonas);
    setShowForm(true);
  };

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
      acc[key] = { year, month, totalUSD: 0, totalComision: 0, totalAFacturar: 0, ventas: [] };
    }
    acc[key].totalUSD += venta.precioVentaUSD;
    acc[key].totalComision += venta.comisionUSD;
    acc[key].totalAFacturar += venta.aFacturarUSD;
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
  const totalAFacturar = filtered.reduce((sum, v) => sum + v.aFacturarUSD, 0);
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

  const getMonthName = (month: number) => {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return months[month - 1];
  };

  const toggleMonth = (key: string) => {
    setExpandedMonth(expandedMonth === key ? null : key);
  };

  const getPagoClienteText = (tipo: string) => {
    const map: any = {
      completo: "Pago completo (USD)",
      deposito_25: "Depósito 25% (USD)",
      pago_dia: "Pago el día (USD)"
    };
    return map[tipo] || tipo;
  };

  const getStatusColor = (status: string) => {
    return status === "pagado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
  };

  const exportCSV = () => {
    if (ventas.length === 0) { alert("No hay datos"); return; }
    let csv = "Fecha,Cliente,Excursión,Cantidad,Tipo,Precio Venta (USD),% Comisión,Comisión (USD),A Facturar (USD),Pago Cliente,Saldo Pendiente (USD),Método Pago,Proveedor,Pago Proveedor,Nota\n";
    ventas.forEach(v => {
      csv += `"${v.fechaExcursion}","${v.clienteNombre}","${v.excursionNombre}",${v.cantidadPersonas},"${v.tipoCliente}",${v.precioVentaUSD},${v.comisionPorcentaje}%,${v.comisionUSD},${v.aFacturarUSD},"${getPagoClienteText(v.pagoCliente)}",${v.saldoPendienteUSD},"${v.metodoPagoCliente}","${v.proveedorNombre}","${v.proveedorPagado}","${v.nota || ""}"\n`;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
              <span className="text-3xl text-slate-900 font-bold">RE</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-4">Republic Excursions</h1>
            <p className="text-white/40">Inicia sesión para continuar</p>
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
              <input
                type="text"
                name="username"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40"
                placeholder="Ingresa tu usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40"
                placeholder="Ingresa tu contraseña"
              />
            </div>
            {loginError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg shadow-amber-500/25"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-white/30">
            <p>Usuarios: Raul | Gabrielle</p>
            <p>Contraseña: Republ1c$$</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - RAÚL O GABRIELLE
  // ============================================
  const renderContent = () => {
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
                    {isRaul ? "Bienvenido, Raúl • Comisión USD" : "✨ Bienvenida, Gabrielle • Comisión USD"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 ${isRaul ? 'bg-amber-500/10 border-amber-500/20' : 'bg-pink-500/20 border-pink-500/20'} rounded-xl border`}>
                  <span className={`text-sm ${isRaul ? 'text-amber-400' : 'text-pink-300'} font-medium`}>
                    {isRaul ? "👑 Admin" : "🌟 Manager"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all text-sm font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className={`flex flex-wrap gap-2 mb-8 ${cardBg} backdrop-blur-lg rounded-2xl p-2 border border-white/10`}>
            {["dashboard", "ventas", "clientes", "proveedores", "excursiones"].map((tab) => {
              const icons: any = {
                dashboard: isRaul ? "📊" : "🌟",
                ventas: isRaul ? "💰" : "💎",
                clientes: isRaul ? "👥" : "👤",
                proveedores: isRaul ? "🏢" : "🏗️",
                excursiones: isRaul ? "🏝️" : "🌴"
              };
              const labels: any = {
                dashboard: "Dashboard",
                ventas: "Ventas",
                clientes: "Clientes",
                proveedores: "Proveedores",
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
                  {icons[tab]} {labels[tab]}
                </button>
              );
            })}
            <div className="flex-1"></div>
            <button 
              onClick={() => setShowForm(true)} 
              className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-${accentColor}-500/25`}
            >
              <span className="text-lg leading-none">+</span> Nueva Venta
            </button>
          </div>

          {/* Dashboard */}
          {viewMode === "dashboard" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all`}>
                  <p className="text-sm text-white/60">Total Ventas (USD)</p>
                  <p className={`text-2xl font-bold ${isRaul ? 'text-amber-400' : 'text-pink-300'}`}>{formatUSD(totalVentasUSD)}</p>
                  <p className="text-xs text-white/40">{ventas.length} ventas</p>
                </div>
                <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all`}>
                  <p className="text-sm text-white/60">Total Comisión (USD)</p>
                  <p className="text-2xl font-bold text-green-400">{formatUSD(totalComision)}</p>
                  <p className="text-xs text-white/40">Tu ganancia</p>
                </div>
                <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all`}>
                  <p className="text-sm text-white/60">Total A Facturar (USD)</p>
                  <p className={`text-2xl font-bold ${isRaul ? 'text-red-400' : 'text-rose-300'}`}>{formatUSD(totalAFacturar)}</p>
                  <p className="text-xs text-white/40">Pago a proveedores</p>
                </div>
                <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all`}>
                  <p className="text-sm text-white/60">Por Cobrar (USD)</p>
                  <p className="text-2xl font-bold text-orange-400">{formatUSD(totalPendienteUSD)}</p>
                  <p className="text-xs text-white/40">Saldo de clientes</p>
                </div>
              </div>

              <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
                <h2 className="text-lg font-bold text-white mb-4">{isRaul ? "📋 Últimas ventas" : "✨ Últimas ventas"}</h2>
                {ventas.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/40">No hay ventas registradas</p>
                    <button onClick={() => setShowForm(true)} className={`mt-4 bg-gradient-to-r ${buttonGradient} text-slate-900 px-6 py-3 rounded-xl hover:shadow-xl transition-all font-medium`}>Registrar primera venta</button>
                  </div>
                ) : (
                  ventas.slice(0, 5).map((v) => (
                    <div key={v.id} className="flex flex-wrap items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="font-medium text-white">{v.clienteNombre}</p>
                        <p className="text-sm text-white/40">{v.excursionNombre} • {v.cantidadPersonas} {v.cantidadPersonas === 1 ? 'persona' : 'personas'} • {new Date(v.fechaExcursion).toLocaleDateString("es-DO")}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${v.tipoCliente === 'adulto' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                          {v.tipoCliente === 'adulto' ? '👤 Adulto' : '🧒 Niño'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${v.pagoCliente === 'completo' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {getPagoClienteText(v.pagoCliente)}
                        </span>
                        <span className={`text-sm font-bold ${isRaul ? 'text-amber-400' : 'text-pink-300'}`}>{formatUSD(v.precioVentaUSD)}</span>
                        <span className="text-xs text-green-400">+{formatUSD(v.comisionUSD)}</span>
                        <span className={`text-xs ${isRaul ? 'text-red-400' : 'text-rose-300'}`}>-{formatUSD(v.aFacturarUSD)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Ventas */}
          {viewMode === "ventas" && (
            <>
              <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/10`}>
                <div className="flex flex-wrap items-center gap-3">
                  <input type="text" placeholder="🔍 Buscar..." className="flex-1 min-w-[200px] px-4 py-2 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <select className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white text-sm" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                    <option value="" className="text-slate-900">Todos los años</option>
                    {years.map(y => <option key={y} value={y} className="text-slate-900">{y}</option>)}
                  </select>
                  <button onClick={exportCSV} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium`}>📥 Exportar CSV</button>
                </div>
              </div>

              {groupedArray.length === 0 ? (
                <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-16 text-center border-2 border-dashed border-white/10`}>
                  <p className="text-white/40 text-xl mb-4">No hay ventas registradas</p>
                  <button onClick={() => setShowForm(true)} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-6 py-3 rounded-xl hover:shadow-xl transition-all font-medium`}>Registrar primera venta</button>
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
                            <span className={`text-sm ${isRaul ? 'text-red-400' : 'text-rose-300'}`}>-{formatUSD(group.totalAFacturar)}</span>
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
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Cliente</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Excursión</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Cant</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Tipo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Venta (USD)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">% Com</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Comisión</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">A Facturar</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Acciones</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {group.ventas.map((v: Venta) => (
                                    <tr key={v.id} className="hover:bg-white/5">
                                      <td className="px-4 py-3 text-sm text-white/60">{new Date(v.fechaExcursion).toLocaleDateString("es-DO")}</td>
                                      <td className="px-4 py-3 text-sm font-medium text-white">{v.clienteNombre}</td>
                                      <td className="px-4 py-3 text-sm text-white/60">{v.excursionNombre}</td>
                                      <td className="px-4 py-3 text-sm text-white/60">{v.cantidadPersonas}</td>
                                      <td className="px-4 py-3 text-sm">
                                        <span className={`text-xs px-2 py-1 rounded-full ${v.tipoCliente === 'adulto' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                          {v.tipoCliente === 'adulto' ? 'Adulto' : 'Niño'}
                                        </span>
                                      </td>
                                      <td className={`px-4 py-3 text-sm font-bold ${isRaul ? 'text-amber-400' : 'text-pink-300'}`}>{formatUSD(v.precioVentaUSD)}</td>
                                      <td className="px-4 py-3 text-sm text-white/60">{v.comisionPorcentaje}%</td>
                                      <td className="px-4 py-3 text-sm font-bold text-green-400">{formatUSD(v.comisionUSD)}</td>
                                      <td className={`px-4 py-3 text-sm font-bold ${isRaul ? 'text-red-400' : 'text-rose-300'}`}>{formatUSD(v.aFacturarUSD)}</td>
                                      <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2">
                                          <button onClick={() => editVenta(v)} className={`${isRaul ? 'text-amber-400 hover:text-amber-300' : 'text-pink-300 hover:text-pink-200'}`}>✏️</button>
                                          <button onClick={() => deleteVenta(v.id)} className={`${isRaul ? 'text-red-400 hover:text-red-300' : 'text-rose-300 hover:text-rose-200'}`}>🗑️</button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-white/5">
                                  <tr>
                                    <td colSpan={5} className="px-4 py-3 text-right font-medium text-white/60">Totales del mes:</td>
                                    <td className={`px-4 py-3 font-bold ${isRaul ? 'text-amber-400' : 'text-pink-300'}`}>{formatUSD(group.totalUSD)}</td>
                                    <td></td>
                                    <td className="px-4 py-3 font-bold text-green-400">{formatUSD(group.totalComision)}</td>
                                    <td className={`px-4 py-3 font-bold ${isRaul ? 'text-red-400' : 'text-rose-300'}`}>{formatUSD(group.totalAFacturar)}</td>
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

          {/* Clientes */}
          {viewMode === "clientes" && (
            <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">{isRaul ? "👥 Clientes" : "👤 Clientes"}</h2>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Excursión</th>
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
                          <td className="px-4 py-3 text-sm text-white/60">{new Date(c.fechaExcursion).toLocaleDateString("es-DO")}</td>
                          <td className="px-4 py-3 text-sm">
                            <button onClick={() => deleteCliente(c.id)} className={`${isRaul ? 'text-red-400 hover:text-red-300' : 'text-rose-300 hover:text-rose-200'}`}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Proveedores */}
          {viewMode === "proveedores" && (
            <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">{isRaul ? "🏢 Proveedores" : "🏗️ Proveedores"}</h2>
                <button onClick={() => setShowProveedorForm(true)} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all text-sm font-medium`}>+ Agregar Proveedor</button>
              </div>
              {proveedores.length === 0 ? (
                <p className="text-center text-white/40 py-8">No hay proveedores registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Nombre</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Teléfono</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Método</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proveedores.map((p) => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 text-sm font-medium text-white">{p.nombre}</td>
                          <td className="px-4 py-3 text-sm text-white/60">{p.telefono}</td>
                          <td className="px-4 py-3 text-sm text-white/60">{p.email}</td>
                          <td className="px-4 py-3 text-sm text-white/60">{p.metodoPago}</td>
                          <td className="px-4 py-3 text-sm">
                            <button onClick={() => deleteProveedor(p.id)} className={`${isRaul ? 'text-red-400 hover:text-red-300' : 'text-rose-300 hover:text-rose-200'}`}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Excursiones */}
          {viewMode === "excursiones" && (
            <div className={`${cardBg} backdrop-blur-lg rounded-2xl p-6 border border-white/10`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">{isRaul ? "🏝️ Excursiones" : "🌴 Excursiones"}</h2>
                <button onClick={() => setShowExcursionForm(true)} className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all text-sm font-medium`}>+ Agregar Excursión</button>
              </div>
              {excursiones.length === 0 ? (
                <p className="text-center text-white/40 py-8">No hay excursiones registradas</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Excursión</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Proveedor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Precio Venta</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">% Com</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Comisión</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">A Facturar</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {excursiones.map((e) => (
                        <tr key={e.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 text-sm font-medium text-white">{e.nombre}</td>
                          <td className="px-4 py-3 text-sm text-white/60">{e.proveedorNombre}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`text-xs px-2 py-1 rounded-full ${e.tipoCliente === 'adulto' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                              {e.tipoCliente === 'adulto' ? 'Adulto' : 'Niño'}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm font-bold ${isRaul ? 'text-amber-400' : 'text-pink-300'}`}>{formatUSD(e.precioVentaUSD)}</td>
                          <td className="px-4 py-3 text-sm text-white/60">{e.comisionPorcentaje}%</td>
                          <td className="px-4 py-3 text-sm font-bold text-green-400">{formatUSD(e.comisionUSD)}</td>
                          <td className={`px-4 py-3 text-sm font-bold ${isRaul ? 'text-red-400' : 'text-rose-300'}`}>{formatUSD(e.aFacturarUSD)}</td>
                          <td className="px-4 py-3 text-sm">
                            <button onClick={() => deleteExcursion(e.id)} className={`${isRaul ? 'text-red-400 hover:text-red-300' : 'text-rose-300 hover:text-rose-200'}`}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>

        {/* FORMULARIOS MODALES */}
        {/* Modal de Venta */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{editingId ? "Editar Venta" : "Nueva Venta"}</h2>
                  <p className="text-sm text-white/40">Cliente paga en USD • Comisión automática</p>
                </div>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-3xl leading-none">×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Excursión *</label>
                  <select
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    value={formData.excursionId}
                    onChange={(e) => selectExcursion(e.target.value)}
                  >
                    <option value="" className="text-slate-900">Seleccionar excursión</option>
                    {excursiones.map(e => (
                      <option key={e.id} value={e.id} className="text-slate-900">
                        {e.nombre} - {formatUSD(e.precioVentaUSD)} | {e.comisionPorcentaje}% | {e.proveedorNombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Cantidad Personas *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                      value={formData.cantidadPersonas}
                      onChange={(e) => updateCantidadPersonas(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Precio Venta (USD) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40"
                      placeholder="0.00"
                      value={formData.precioVentaUSD}
                      onChange={(e) => handleComisionChange("precioVentaUSD", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">% Comisión *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40"
                      placeholder="0"
                      value={formData.comisionPorcentaje}
                      onChange={(e) => handleComisionChange("comisionPorcentaje", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                    <label className="block text-sm font-medium text-white/60 mb-1">Comisión (USD) - Tu Ganancia</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-transparent border-0 text-green-400 font-bold text-lg"
                      value={formData.comisionUSD}
                      readOnly
                    />
                  </div>
                  <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                    <label className="block text-sm font-medium text-white/60 mb-1">A Facturar (USD) - Pago al Proveedor</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-transparent border-0 text-red-400 font-bold text-lg"
                      value={formData.aFacturarUSD}
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Cliente *</label>
                    <input type="text" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="Nombre del cliente" value={formData.clienteNombre} onChange={(e) => setFormData({ ...formData, clienteNombre: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">WhatsApp</label>
                    <input type="text" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="849-000-0000" value={formData.clienteWhatsapp} onChange={(e) => setFormData({ ...formData, clienteWhatsapp: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Fecha Excursión *</label>
                    <input type="date" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white" value={formData.fechaExcursion} onChange={(e) => setFormData({ ...formData, fechaExcursion: e.target.value })} />
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Método de Pago del Cliente *</label>
                  <select required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white" value={formData.metodoPagoCliente} onChange={(e) => setFormData({ ...formData, metodoPagoCliente: e.target.value as any })}>
                    <option value="efectivo" className="text-slate-900">Efectivo</option>
                    <option value="tarjeta" className="text-slate-900">Tarjeta</option>
                    <option value="transferencia" className="text-slate-900">Transferencia</option>
                    <option value="paypal" className="text-slate-900">PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Estado del Pago del Cliente *</label>
                  <select required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white" value={formData.pagoCliente} onChange={(e) => setFormData({ ...formData, pagoCliente: e.target.value as any })}>
                    <option value="completo" className="text-slate-900">Pago completo (USD)</option>
                    <option value="deposito_25" className="text-slate-900">Depósito del 25% (USD)</option>
                    <option value="pago_dia" className="text-slate-900">Paga el día de la excursión (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Monto Pagado (USD)</label>
                  <input type="number" step="0.01" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="0.00" value={formData.montoPagadoUSD} onChange={(e) => setFormData({ ...formData, montoPagadoUSD: e.target.value })} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Nota</label>
                  <textarea className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="Detalles adicionales..." rows={2} value={formData.nota} onChange={(e) => setFormData({ ...formData, nota: e.target.value })} />
                </div>

                <button type="submit" className={`w-full bg-gradient-to-r ${buttonGradient} text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl transition-all`}>
                  {editingId ? "Actualizar Venta" : "Guardar Venta"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Excursión */}
        {showExcursionForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Nueva Excursión</h2>
                <button onClick={() => setShowExcursionForm(false)} className="text-white/40 hover:text-white text-3xl leading-none">×</button>
              </div>
              <form onSubmit={handleExcursionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Nombre de la Excursión *</label>
                  <input type="text" name="nombre" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="Ej: Isla Saona - Bávaro (Adulto)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Proveedor *</label>
                  <select name="proveedorId" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white">
                    <option value="" className="text-slate-900">Seleccionar proveedor</option>
                    {proveedores.map(p => <option key={p.id} value={p.id} className="text-slate-900">{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Cliente *</label>
                  <select name="tipoCliente" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white">
                    <option value="adulto" className="text-slate-900">Adulto</option>
                    <option value="nino" className="text-slate-900">Niño</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Precio Venta (USD) *</label>
                  <input type="number" name="precioVentaUSD" required step="0.01" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="99.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">% Comisión *</label>
                  <input type="number" name="comisionPorcentaje" required step="0.01" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="25" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Zona (opcional)</label>
                  <input type="text" name="zona" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="Bávaro, Uvero Alto, etc." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Capacidad (opcional)</label>
                  <input type="text" name="capacidad" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="2 personas, 4 personas, etc." />
                </div>
                <button type="submit" className={`w-full bg-gradient-to-r ${buttonGradient} text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl transition-all`}>Guardar Excursión</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Proveedor */}
        {showProveedorForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Nuevo Proveedor</h2>
                <button onClick={() => setShowProveedorForm(false)} className="text-white/40 hover:text-white text-3xl leading-none">×</button>
              </div>
              <form onSubmit={handleProveedorSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Nombre del Proveedor *</label>
                  <input type="text" name="nombre" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="Ej: Dominican Way Travel" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Teléfono</label>
                  <input type="text" name="telefono" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="809-000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                  <input type="email" name="email" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="info@proveedor.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Método de Pago</label>
                  <select name="metodoPago" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white">
                    <option value="efectivo" className="text-slate-900">Efectivo</option>
                    <option value="transferencia" className="text-slate-900">Transferencia</option>
                    <option value="paypal" className="text-slate-900">PayPal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Nota</label>
                  <textarea name="nota" className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="Detalles del proveedor..." rows={2}></textarea>
                </div>
                <button type="submit" className={`w-full bg-gradient-to-r ${buttonGradient} text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl transition-all`}>Guardar Proveedor</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Cliente */}
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
                  <input type="text" name="nombre" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" placeholder="Ej: Juan Pérez" />
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
                  <label className="block text-sm font-medium text-white/70 mb-1">Excursión *</label>
                  <select name="excursionId" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white">
                    <option value="" className="text-slate-900">Seleccionar excursión</option>
                    {excursiones.map(e => <option key={e.id} value={e.id} className="text-slate-900">{e.nombre} - {formatUSD(e.precioVentaUSD)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Fecha de la Excursión *</label>
                  <input type="date" name="fechaExcursion" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white" />
                </div>
                <button type="submit" className={`w-full bg-gradient-to-r ${buttonGradient} text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl transition-all`}>Guardar Cliente</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  return renderContent();
}
