// ============================================
// RENDER BANCOS (Completo)
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
            No hay información bancaria registrada
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
                  <span>🏦</span> {p.banco || "Sin banco"}
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span>💳</span> Cuenta: {p.numeroCuenta || "Sin cuenta"}
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span>💰</span> Moneda: {p.monedaCuenta || "RD$"}
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span>📋</span> {p.beneficiario || "Sin beneficiario"}
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
                    📄 {p.documentos}
                  </div>
                )}
                {p.nota && (
                  <div className="text-xs text-white/40 mt-1">
                    📝 {p.nota}
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
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
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
        <h3 className="text-white font-semibold mb-3">📋 Eventos del día</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {getVentasDelDia(currentDate).length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">No hay ventas para este día</p>
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
          <span className="text-lg leading-none">+</span> Nueva Excursión
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
                  <p className="text-white/40 text-sm">🏷️ {e.proveedorNombre}</p>
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
                    <span className="text-white/40">Niño</span>
                    <span className="text-white font-medium">{formatUSD(e.precioNinoUSD)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-white/5 pt-2 mt-2">
                  <span className="text-white/40">Costo Proveedor</span>
                  <span className="text-white/60">{formatUSD(e.costoProveedorAdultoUSD)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Comisión</span>
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

              {/* Excursión */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Excursión *</label>
                  <select
                    value={formData.excursionId}
                    onChange={(e) => selectExcursionForVenta(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Seleccionar excursión</option>
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
                  <label className="block text-sm font-medium text-white/70 mb-1">Fecha de Excursión *</label>
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
                  <label className="block text-sm font-medium text-white/70 mb-1">Precio Niño (USD)</label>
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
                  <label className="block text-sm font-medium text-white/70 mb-1">Comisión (USD)</label>
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
                  <label className="block text-sm font-medium text-white/70 mb-1">Cant. Niños</label>
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
                  <label className="block text-sm font-medium text-white/70 mb-1">Comisión Total</label>
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
                    <option value="deposito_25">Depósito 25%</option>
                    <option value="pago_dia">Pago el Día</option>
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
                  <label className="block text-sm font-medium text-white/70 mb-1">Método Pago Cliente</label>
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
                    <option value="si">Sí</option>
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
                <label className="block text-sm font-medium text-white/70 mb-1">Excursión</label>
                <select
                  name="excursionId"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Seleccionar excursión</option>
                  {excursiones.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Fecha Excursión</label>
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
                  <label className="block text-sm font-medium text-white/70 mb-1">Teléfono</label>
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
                <label className="block text-sm font-medium text-white/70 mb-2">Métodos de Pago</label>
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
                      {m === "efectivo" ? "💵 Efectivo" : m === "transferencia" ? "🏦 Transferencia" : "💳 PayPal"}
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
                  <label className="block text-sm font-medium text-white/70 mb-1">Número de Cuenta</label>
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

      {/* Formulario de Excursión */}
      {showExcursionForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`${cardBg} backdrop-blur-2xl rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingExcursionId ? "Editar Excursión" : "Nueva Excursión"}
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
                <label className="text-white/70 text-sm">Tiene precio para niños</label>
              </div>

              {excursionFormData.tienePrecioNino && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Precio Niño (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={excursionFormData.precioNinoUSD}
                      onChange={(e) => setExcursionFormData(prev => ({ ...prev, precioNinoUSD: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Costo Proveedor Niño (USD)</label>
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
                  {editingExcursionId ? "Actualizar Excursión" : "Agregar Excursión"}
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
              Cerrar Sesión
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
