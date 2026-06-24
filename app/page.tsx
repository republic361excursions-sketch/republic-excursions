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
  tipoCliente: "adulto" | "nino";
  tipoServicio: "compartido" | "privado";
  grupoPrivado?: number;
  cantidadPersonas: number;
  nota: string;
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
  const [editingVentaId, setEditingVentaId] = useState<string | null>(null);
  const [editingExcursionId, setEditingExcursionId] = useState<string | null>(null);
  const [editingProveedorId, setEditingProveedorId] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"dashboard" | "ventas" | "clientes" | "proveedores" | "excursiones">("dashboard");
  const [selectedExcursionForVenta, setSelectedExcursionForVenta] = useState<Excursion | null>(null);

  const [tempExcursiones, setTempExcursiones] = useState<Omit<Excursion, "id" | "proveedorId" | "proveedorNombre">[]>([]);
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
    precioVentaUSD: "",
    costoProveedorUSD: "",
    comisionUSD: "",
    pagoCliente: "completo" as "completo" | "deposito_25" | "pago_dia",
    montoPagadoUSD: "",
    saldoPendienteUSD: "",
    metodoPagoCliente: "efectivo" as "efectivo" | "tarjeta" | "transferencia" | "paypal",
    proveedorId: "",
    proveedorNombre: "",
    proveedorPagado: "pendiente" as "pendiente" | "pagado",
    metodoPagoProveedor: "efectivo" as "efectivo" | "transferencia" | "paypal",
    tipoCliente: "adulto" as "adulto" | "nino",
    tipoServicio: "compartido" as "compartido" | "privado",
    grupoPrivado: "",
    cantidadPersonas: 1,
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
    telefono: "",
    email: "",
    metodoPago: "efectivo" as "efectivo" | "transferencia" | "paypal",
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
    const savedVentas = localStorage.getItem("excursiones_ventas_v11");
    const savedClientes = localStorage.getItem("excursiones_clientes_v11");
    const savedProveedores = localStorage.getItem("excursiones_proveedores_v11");
    const savedExcursiones = localStorage.getItem("excursiones_excursiones_v11");
    
    if (savedVentas) setVentas(JSON.parse(savedVentas));
    if (savedClientes) setClientes(JSON.parse(savedClientes));
    if (savedProveedores) setProveedores(JSON.parse(savedProveedores));
    if (savedExcursiones) setExcursiones(JSON.parse(savedExcursiones));
  }, []);

  const saveVentas = (data: Venta[]) => {
    setVentas(data);
    localStorage.setItem("excursiones_ventas_v11", JSON.stringify(data));
  };

  const saveClientes = (data: Cliente[]) => {
    setClientes(data);
    localStorage.setItem("excursiones_clientes_v11", JSON.stringify(data));
  };

  const saveProveedores = (data: Proveedor[]) => {
    setProveedores(data);
    localStorage.setItem("excursiones_proveedores_v11", JSON.stringify(data));
  };

  const saveExcursiones = (data: Excursion[]) => {
    setExcursiones(data);
    localStorage.setItem("excursiones_excursiones_v11", JSON.stringify(data));
  };

  // ============================================
  // CALCULAR COMISION
  // ============================================
  const calcularComision = (precioVenta: number, costoProveedor: number) => {
    return precioVenta - costoProveedor;
  };

  // ============================================
  // HANDLE PROVEEDOR CON EXCURSIONES
  // ============================================
  const handleProveedorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const proveedorId = editingProveedorId || Date.now().toString();
    
    if (editingProveedorId) {
      const updated = proveedores.map(p => 
        p.id === editingProveedorId 
          ? { ...p, ...proveedorFormData }
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
      telefono: "",
      email: "",
      metodoPago: "efectivo",
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
      telefono: proveedor.telefono,
      email: proveedor.email,
      metodoPago: proveedor.metodoPago,
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
  // MANEJAR EXCURSIONES TEMPORALES DEL PROVEEDOR
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

  const handleTempExcursionPrecioChange = (campo: string, valor: string) => {
    const newData = { ...tempExcursionForm, [campo]: valor };
    if (campo === "precioAdultoUSD" || campo === "costoProveedorAdultoUSD") {
      const pv = campo === "precioAdultoUSD" ? parseFloat(valor) || 0 : parseFloat(tempExcursionForm.precioAdultoUSD) || 0;
      const cp = campo === "costoProveedorAdultoUSD" ? parseFloat(valor) || 0 : parseFloat(tempExcursionForm.costoProveedorAdultoUSD) || 0;
      newData.comisionAdultoUSD = calcularComision(pv, cp).toString();
    }
    if (campo === "precioNinoUSD" || campo === "costoProveedorNinoUSD") {
      const pv = campo === "precioNinoUSD" ? parseFloat(valor) || 0 : parseFloat(tempExcursionForm.precioNinoUSD) || 0;
      const cp = campo === "costoProveedorNinoUSD" ? parseFloat(valor) || 0 : parseFloat(tempExcursionForm.costoProveedorNinoUSD) || 0;
      newData.comisionNinoUSD = calcularComision(pv, cp).toString();
    }
    setTempExcursionForm(newData);
  };

  // ============================================
  // HANDLE EXCURSION (INDEPENDIENTE)
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
      excursionId,
      excursionNombre: excursion?.nombre || "",
      fechaExcursion: data.get("fechaExcursion") as string,
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
    const precioVentaUSD = parseFloat(formData.precioVentaUSD) || 0;
    const costoProveedorUSD = parseFloat(formData.costoProveedorUSD) || 0;
    const comisionUSD = calcularComision(precioVentaUSD, costoProveedorUSD);
    const montoPagadoUSD = parseFloat(formData.montoPagadoUSD) || 0;
    const cantidad = parseInt(formData.cantidadPersonas.toString()) || 1;
    const grupoPrivado = formData.tipoServicio === "privado" ? parseInt(formData.grupoPrivado) || 0 : undefined;
    
    const precioTotal = precioVentaUSD * cantidad;
    const costoTotal = costoProveedorUSD * cantidad;
    const comisionTotal = comisionUSD * cantidad;
    
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
      tipoCliente: formData.tipoCliente,
      tipoServicio: formData.tipoServicio,
      grupoPrivado: grupoPrivado,
      cantidadPersonas: cantidad,
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
      precioVentaUSD: "",
      costoProveedorUSD: "",
      comisionUSD: "",
      pagoCliente: "completo",
      montoPagadoUSD: "",
      saldoPendienteUSD: "",
      metodoPagoCliente: "efectivo",
      proveedorId: "",
      proveedorNombre: "",
      proveedorPagado: "pendiente",
      metodoPagoProveedor: "efectivo",
      tipoCliente: "adulto",
      tipoServicio: "compartido",
      grupoPrivado: "",
      cantidadPersonas: 1,
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
      
      const esNino = formData.tipoCliente === "nino";
      const tienePrecioNino = excursion.precioNinoUSD !== null;
      
      const precio = esNino && tienePrecioNino ? excursion.precioNinoUSD! : excursion.precioAdultoUSD;
      const costo = esNino && tienePrecioNino ? excursion.costoProveedorNinoUSD! : excursion.costoProveedorAdultoUSD;
      const comision = esNino && tienePrecioNino ? excursion.comisionNinoUSD! : excursion.comisionAdultoUSD;
      
      const cantidad = parseInt(formData.cantidadPersonas.toString()) || 1;
      const precioTotal = precio * cantidad;
      const costoTotal = costo * cantidad;
      const comisionTotal = comision * cantidad;
      
      setFormData({
        ...formData,
        excursionId: excursion.id,
        excursionNombre: excursion.nombre,
        precioVentaUSD: precioTotal.toString(),
        costoProveedorUSD: costoTotal.toString(),
        comisionUSD: comisionTotal.toString(),
        proveedorId: excursion.proveedorId,
        proveedorNombre: excursion.proveedorNombre,
      });
    }
  };

  // ============================================
  // CAMBIAR TIPO DE CLIENTE EN VENTA
  // ============================================
  const cambiarTipoCliente = (tipo: "adulto" | "nino") => {
    setFormData({ ...formData, tipoCliente: tipo });
    
    if (selectedExcursionForVenta) {
      const excursion = selectedExcursionForVenta;
      const esNino = tipo === "nino";
      const tienePrecioNino = excursion.precioNinoUSD !== null;
      
      if (esNino && !tienePrecioNino) {
        alert("Esta excursion no tiene precio para ninos. Se usara el precio de adulto.");
        setFormData(prev => ({ ...prev, tipoCliente: "adulto" }));
        return;
      }
      
      const precio = esNino && tienePrecioNino ? excursion.precioNinoUSD! : excursion.precioAdultoUSD;
      const costo = esNino && tienePrecioNino ? excursion.costoProveedorNinoUSD! : excursion.costoProveedorAdultoUSD;
      const comision = esNino && tienePrecioNino ? excursion.comisionNinoUSD! : excursion.comisionAdultoUSD;
      
      const cantidad = parseInt(formData.cantidadPersonas.toString()) || 1;
      const precioTotal = precio * cantidad;
      const costoTotal = costo * cantidad;
      const comisionTotal = comision * cantidad;
      
      setFormData(prev => ({
        ...prev,
        tipoCliente: tipo,
        precioVentaUSD: precioTotal.toString(),
        costoProveedorUSD: costoTotal.toString(),
        comisionUSD: comisionTotal.toString(),
      }));
    }
  };

  // ============================================
  // ACTUALIZAR CANTIDAD DE PERSONAS EN VENTA
  // ============================================
  const updateCantidadPersonas = (cantidad: number) => {
    if (selectedExcursionForVenta) {
      const excursion = selectedExcursionForVenta;
      const esNino = formData.tipoCliente === "nino";
      const tienePrecioNino = excursion.precioNinoUSD !== null;
      
      const precio = esNino && tienePrecioNino ? excursion.precioNinoUSD! : excursion.precioAdultoUSD;
      const costo = esNino && tienePrecioNino ? excursion.costoProveedorNinoUSD! : excursion.costoProveedorAdultoUSD;
      const comision = esNino && tienePrecioNino ? excursion.comisionNinoUSD! : excursion.comisionAdultoUSD;
      
      const precioTotal = precio * cantidad;
      const costoTotal = costo * cantidad;
      const comisionTotal = comision * cantidad;
      
      setFormData({
        ...formData,
        cantidadPersonas: cantidad,
        precioVentaUSD: precioTotal.toString(),
        costoProveedorUSD: costoTotal.toString(),
        comisionUSD: comisionTotal.toString(),
      });
    } else {
      setFormData({
        ...formData,
        cantidadPersonas: cantidad,
      });
    }
  };

  // ============================================
  // ACTUALIZAR PRECIO VENTA EN FORMULARIO DE VENTA
  // ============================================
  const handleVentaPrecioChange = (valor: string) => {
    const pv = parseFloat(valor) || 0;
    const cp = parseFloat(formData.costoProveedorUSD) || 0;
    const comision = calcularComision(pv, cp);
    setFormData({
      ...formData,
      precioVentaUSD: valor,
      comisionUSD: comision.toString()
    });
  };

  // ============================================
  // ACTUALIZAR COSTO PROVEEDOR EN FORMULARIO DE VENTA
  // ============================================
  const handleVentaCostoChange = (valor: string) => {
    const pv = parseFloat(formData.precioVentaUSD) || 0;
    const cp = parseFloat(valor) || 0;
    const comision = calcularComision(pv, cp);
    setFormData({
      ...formData,
      costoProveedorUSD: valor,
      comisionUSD: comision.toString()
    });
  };

  const editVenta = (venta: Venta) => {
    setEditingVentaId(venta.id);
    setFormData({
      clienteNombre: venta.clienteNombre,
      clienteWhatsapp: venta.clienteWhatsapp,
      clienteEmail: venta.clienteEmail,
      excursionId: venta.excursionId,
      excursionNombre: venta.excursionNombre,
      fechaExcursion: venta.fechaExcursion,
      precioVentaUSD: venta.precioVentaUSD.toString(),
      costoProveedorUSD: venta.costoProveedorUSD.toString(),
      comisionUSD: venta.comisionUSD.toString(),
      pagoCliente: venta.pagoCliente,
      montoPagadoUSD: venta.montoPagadoUSD.toString(),
      saldoPendienteUSD: venta.saldoPendienteUSD.toString(),
      metodoPagoCliente: venta.metodoPagoCliente,
      proveedorId: venta.proveedorId,
      proveedorNombre: venta.proveedorNombre,
      proveedorPagado: venta.proveedorPagado,
      metodoPagoProveedor: venta.metodoPagoProveedor,
      tipoCliente: venta.tipoCliente,
      tipoServicio: venta.tipoServicio,
      grupoPrivado: venta.grupoPrivado?.toString() || "",
      cantidadPersonas: venta.cantidadPersonas,
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
      deposito_25: "Deposito 25% (USD)",
      pago_dia: "Pago el dia (USD)"
    };
    return map[tipo] || tipo;
  };

  const exportCSV = () => {
    if (ventas.length === 0) { alert("No hay datos"); return; }
    let csv = "Fecha,Cliente,Excursion,Cantidad,Tipo,Servicio,Grupo Privado,Precio Venta (USD),Costo Proveedor (USD),Comision (USD),Pago Cliente,Saldo Pendiente (USD),Metodo Pago,Proveedor,Pago Proveedor,Nota\n";
    ventas.forEach(v => {
      csv += `"${v.fechaExcursion}","${v.clienteNombre}","${v.excursionNombre}",${v.cantidadPersonas},"${v.tipoCliente}","${v.tipoServicio}",${v.grupoPrivado || 0},${v.precioVentaUSD},${v.costoProveedorUSD},${v.comisionUSD},"${getPagoClienteText(v.pagoCliente)}",${v.saldoPendienteUSD},"${v.metodoPagoCliente}","${v.proveedorNombre}","${v.proveedorPagado}","${v.nota || ""}"\n`;
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
            <p className="text-white/40">Inicia sesion para continuar</p>
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
              <label className="block text-sm font-medium text-white/70 mb-1">Contrasena</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40"
                placeholder="Ingresa tu contrasena"
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
              Iniciar Sesion
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-white/30">
            <p>Usuarios: Raul | Gabrielle</p>
            <p>Contrasena: Republ1c$$</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - RAUL O GABRIELLE (SOLO LA PARTE DEL FORMULARIO DE VENTA)
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
          {/* Navigation */}
          <div className={`flex flex-wrap gap-2 mb-8 ${cardBg} backdrop-blur-lg rounded-2xl p-2 border border-white/10`}>
            {["dashboard", "ventas", "clientes", "proveedores", "excursiones"].map((tab) => {
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
                  precioVentaUSD: "",
                  costoProveedorUSD: "",
                  comisionUSD: "",
                  pagoCliente: "completo",
                  montoPagadoUSD: "",
                  saldoPendienteUSD: "",
                  metodoPagoCliente: "efectivo",
                  proveedorId: "",
                  proveedorNombre: "",
                  proveedorPagado: "pendiente",
                  metodoPagoProveedor: "efectivo",
                  tipoCliente: "adulto",
                  tipoServicio: "compartido",
                  grupoPrivado: "",
                  cantidadPersonas: 1,
                  nota: "",
                });
                setShowForm(true);
              }} 
              className={`bg-gradient-to-r ${buttonGradient} text-slate-900 px-4 py-2 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-${accentColor}-500/25`}
            >
              <span className="text-lg leading-none">+</span> Nueva Venta
            </button>
          </div>

          {/* MODAL DE VENTA - CON ADULTO/NINO Y PRECIOS SEPARADOS */}
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
                        const tieneNino = e.precioNinoUSD !== null;
                        return (
                          <option key={e.id} value={e.id} className="text-slate-900">
                            {e.nombre} - {e.proveedorNombre} - Adulto: {formatUSD(e.precioAdultoUSD)}
                            {tieneNino ? ` - Nino: ${formatUSD(e.precioNinoUSD!)}` : " (Sin precio nino)"}
                          </option>
                        );
                      })}
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
                        onChange={(e) => handleVentaPrecioChange(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Costo Proveedor (USD) *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40"
                        placeholder="0.00"
                        value={formData.costoProveedorUSD}
                        onChange={(e) => handleVentaCostoChange(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                      <label className="block text-sm font-medium text-white/60 mb-1">Comision (USD) - Tu Ganancia</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-transparent border-0 text-green-400 font-bold text-lg"
                        value={formData.comisionUSD}
                        readOnly
                      />
                    </div>
                    <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                      <label className="block text-sm font-medium text-white/60 mb-1">% Comision</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-transparent border-0 text-blue-400 font-bold text-lg"
                        value={(() => {
                          const pv = parseFloat(formData.precioVentaUSD) || 0;
                          const cp = parseFloat(formData.costoProveedorUSD) || 0;
                          if (pv === 0) return "0%";
                          return ((pv - cp) / pv * 100).toFixed(2) + "%";
                        })()}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Cliente *</label>
                      <select 
                        required 
                        className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                        value={formData.tipoCliente}
                        onChange={(e) => cambiarTipoCliente(e.target.value as "adulto" | "nino")}
                      >
                        <option value="adulto" className="text-slate-900">Adulto</option>
                        <option value="nino" className="text-slate-900">Nino</option>
                      </select>
                      {selectedExcursionForVenta && selectedExcursionForVenta.precioNinoUSD === null && (
                        <p className="text-xs text-yellow-400 mt-1">Esta excursion no tiene precio para ninos</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Servicio *</label>
                      <select 
                        required 
                        className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                        value={formData.tipoServicio}
                        onChange={(e) => {
                          const value = e.target.value as "compartido" | "privado";
                          setFormData({ 
                            ...formData, 
                            tipoServicio: value,
                            grupoPrivado: value === "privado" ? formData.grupoPrivado : ""
                          });
                        }}
                      >
                        <option value="compartido" className="text-slate-900">Compartido</option>
                        <option value="privado" className="text-slate-900">Privado</option>
                      </select>
                    </div>
                  </div>

                  {formData.tipoServicio === "privado" && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Grupo Privado (capacidad)</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40"
                        placeholder="Numero de personas en el grupo privado"
                        value={formData.grupoPrivado}
                        onChange={(e) => setFormData({ ...formData, grupoPrivado: e.target.value })}
                      />
                    </div>
                  )}

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
                      <label className="block text-sm font-medium text-white/70 mb-1">Fecha Excursion *</label>
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
                    <label className="block text-sm font-medium text-white/70 mb-1">Metodo de Pago del Cliente *</label>
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
                      <option value="deposito_25" className="text-slate-900">Deposito del 25% (USD)</option>
                      <option value="pago_dia" className="text-slate-900">Paga el dia de la excursion (USD)</option>
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
                    {editingVentaId ? "Actualizar Venta" : "Guardar Venta"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* MODAL DE PROVEEDOR CON EXCURSIONES - ADULTO/NINO */}
          {showProveedorForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">{editingProveedorId ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
                  <button onClick={() => setShowProveedorForm(false)} className="text-white/40 hover:text-white text-3xl leading-none">×</button>
                </div>
                <form onSubmit={handleProveedorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Nombre del Proveedor *</label>
                    <input 
                      type="text" 
                      value={proveedorFormData.nombre}
                      onChange={(e) => setProveedorFormData({ ...proveedorFormData, nombre: e.target.value })}
                      required 
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                      placeholder="Ej: Dominican Way Travel" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Telefono</label>
                      <input 
                        type="text" 
                        value={proveedorFormData.telefono}
                        onChange={(e) => setProveedorFormData({ ...proveedorFormData, telefono: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40" 
                        placeholder="809-000-0000" 
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
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Metodo de Pago</label>
                    <select 
                      value={proveedorFormData.metodoPago}
                      onChange={(e) => setProveedorFormData({ ...proveedorFormData, metodoPago: e.target.value as "efectivo" | "transferencia" | "paypal" })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    >
                      <option value="efectivo" className="text-slate-900">Efectivo</option>
                      <option value="transferencia" className="text-slate-900">Transferencia</option>
                      <option value="paypal" className="text-slate-900">PayPal</option>
                    </select>
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

                  {/* EXCURSIONES DEL PROVEEDOR */}
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

                    {/* Formulario para agregar excursion temporal */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-white/60 mb-1">Nombre Excursion *</label>
                        <input 
                          type="text" 
                          value={tempExcursionForm.nombre}
                          onChange={(e) => setTempExcursionForm({ ...tempExcursionForm, nombre: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-white/40 text-sm" 
                          placeholder="Isla Saona - Bavaro" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-1">Precio Adulto (USD)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={tempExcursionForm.precioAdultoUSD}
                          onChange={(e) => handleTempExcursionPrecioChange("precioAdultoUSD", e.target.value)}
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
                          onChange={(e) => handleTempExcursionPrecioChange("costoProveedorAdultoUSD", e.target.value)}
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
                            setTempExcursionForm({ 
                              ...tempExcursionForm, 
                              precioNinoUSD: valor,
                              tienePrecioNino: valor !== "" && parseFloat(valor) > 0
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
                            setTempExcursionForm({ 
                              ...tempExcursionForm, 
                              costoProveedorNinoUSD: valor,
                              tienePrecioNino: tempExcursionForm.precioNinoUSD !== "" && parseFloat(tempExcursionForm.precioNinoUSD) > 0
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

          {/* MODAL DE EXCURSION INDEPENDIENTE - ADULTO/NINO */}
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
                      placeholder="Ej: Isla Saona - Bavaro" 
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

          {/* MODAL DE CLIENTE */}
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
                    <label className="block text-sm font-medium text-white/70 mb-1">Excursion *</label>
                    <select name="excursionId" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white">
                      <option value="" className="text-slate-900">Seleccionar excursion</option>
                      {excursiones.map(e => <option key={e.id} value={e.id} className="text-slate-900">{e.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Fecha de la Excursion *</label>
                    <input type="date" name="fechaExcursion" required className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white" />
                  </div>
                  <button type="submit" className={`w-full bg-gradient-to-r ${buttonGradient} text-slate-900 py-4 rounded-xl font-semibold hover:shadow-xl transition-all`}>Guardar Cliente</button>
                </form>
              </div>
            </div>
          )}

          {/* RESTO DEL CONTENIDO (Dashboard, Ventas, Clientes, Proveedores, Excursiones) */}
          {/* ... el resto del código es igual que antes ... */}
        </main>
      </div>
    );
  };

  return renderContent();
}
