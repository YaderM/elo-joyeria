import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// --- Helpers ---
const formatoColones = (monto) =>
  `₡${Number(monto || 0).toLocaleString('es-CR', { maximumFractionDigits: 0 })}`;

const ESTADO_ESTILO = {
  CONFIRMADA: { bg: '#e8f5e9', color: '#2e7d32', label: 'Confirmada' },
  PENDIENTE: { bg: '#fff3e0', color: '#e65100', label: 'Pendiente' },
  CANCELADA: { bg: '#ffebee', color: '#c62828', label: 'Cancelada' },
};

const DIAS_POR_FILTRO = { '7DIAS': 7, '30DIAS': 30, TODOS: null };

export default function AdminDashboard({
  datosReporte = [],
  productosInventario = [],
  onCambiarSeccion,
  cargando = false,
  onRefrescar,
}) {
  const [filtroTiempo, setFiltroTiempo] = useState('30DIAS');
  const hoy = useMemo(() => new Date(), []);

  const dentroDeRango = (fechaStr, dias, desdeOffset = 0) => {
    if (!fechaStr || dias === null) return dias === null && desdeOffset === 0;
    const fecha = new Date(fechaStr);
    const diff = (hoy - fecha) / (1000 * 60 * 60 * 24);
    return diff >= desdeOffset && diff <= desdeOffset + dias;
  };

  // Ventana actual seleccionada por el admin
  const datosPeriodoActual = useMemo(() => {
    const dias = DIAS_POR_FILTRO[filtroTiempo];
    if (dias === null) return datosReporte;
    return datosReporte.filter((item) => dentroDeRango(item.fecha_creacion, dias, 0));
  }, [datosReporte, filtroTiempo, hoy]);

  // Ventana inmediatamente anterior, misma duración, para calcular variación %
  const datosPeriodoAnterior = useMemo(() => {
    const dias = DIAS_POR_FILTRO[filtroTiempo];
    if (dias === null) return [];
    return datosReporte.filter((item) => dentroDeRango(item.fecha_creacion, dias, dias));
  }, [datosReporte, filtroTiempo, hoy]);

  const sumaConfirmadas = (lista) =>
    lista.filter((i) => i.estado === 'CONFIRMADA').reduce((acc, i) => acc + Number(i.monto_total || 0), 0);

  const totalVentasMonto = sumaConfirmadas(datosPeriodoActual);
  const totalVentasMontoAnterior = sumaConfirmadas(datosPeriodoAnterior);

  const variacionPorcentual = totalVentasMontoAnterior > 0
    ? ((totalVentasMonto - totalVentasMontoAnterior) / totalVentasMontoAnterior) * 100
    : null;

  const confirmadasEnPeriodo = datosPeriodoActual.filter((i) => i.estado === 'CONFIRMADA');
  const ticketPromedio = confirmadasEnPeriodo.length > 0
    ? totalVentasMonto / confirmadasEnPeriodo.length
    : 0;

  // Pendientes se muestra siempre sobre el total histórico, no solo el período filtrado,
  // porque un pedido pendiente necesita atención sin importar cuándo se creó.
  const pendientesCount = datosReporte.filter((item) => item.estado === 'PENDIENTE').length;

  const productosStockBajo = [...productosInventario]
    .filter((prod) => Number(prod.stock || 0) <= 5)
    .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));

  const datosGrafico = [...datosPeriodoActual]
    .filter((i) => i.estado === 'CONFIRMADA')
    .sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion))
    .map((item) => ({
      fecha: (item.fecha_creacion || '').substring(5, 10),
      monto: Number(item.monto_total || 0),
    }));

  const ultimasVentas = [...datosReporte]
    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
    .slice(0, 6);

  // --- Estilos ---
  const kpiCardStyle = {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    flex: '1',
    minWidth: '220px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    boxSizing: 'border-box',
  };

  const panelStyle = {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '25px',
    boxSizing: 'border-box',
  };

  const botonAccionStyle = {
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background 0.2s',
  };

  const botonRefrescarStyle = {
    background: '#fff',
    color: '#1a1a1a',
    border: '1px solid #ccc',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: cargando ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    opacity: cargando ? 0.6 : 1,
  };

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#777' }}>
        Cargando panel general...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', padding: '10px 0' }}>
      {/* Cabecera, Filtro de Tiempo y Refresco */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ color: '#1a1a1a', fontSize: '1.4rem', margin: '0 0 5px 0' }}>Panel General - Joyería Elo</h2>
          <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Monitoreo financiero y operaciones en tiempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filtroTiempo}
            onChange={(e) => setFiltroTiempo(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}
          >
            <option value="7DIAS">Últimos 7 días</option>
            <option value="30DIAS">Últimos 30 días</option>
            <option value="TODOS">Todo el historial</option>
          </select>
          {onRefrescar && (
            <button onClick={onRefrescar} disabled={cargando} style={botonRefrescarStyle}>
              🔄 Refrescar
            </button>
          )}
        </div>
      </div>

      {/* Sin datos: primer uso o backend sin ventas todavía */}
      {datosReporte.length === 0 && (
        <div style={{ ...panelStyle, textAlign: 'center', color: '#777' }}>
          Todavía no hay ventas registradas para mostrar en el panel. En cuanto se confirme el primer
          pedido, los indicadores y el gráfico se van a llenar automáticamente.
        </div>
      )}

      {/* Tarjetas KPI */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '25px', boxSizing: 'border-box' }}>
        <div style={kpiCardStyle}>
          <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Ventas Confirmadas
          </span>
          <h3 style={{ fontSize: '1.5rem', color: '#2e7d32', margin: '8px 0 4px 0' }}>
            {formatoColones(totalVentasMonto)}
          </h3>
          {variacionPorcentual !== null && (
            <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: variacionPorcentual >= 0 ? '#2e7d32' : '#c62828' }}>
              {variacionPorcentual >= 0 ? '▲' : '▼'} {Math.abs(variacionPorcentual).toFixed(1)}% vs. período anterior
            </span>
          )}
        </div>

        <div style={kpiCardStyle}>
          <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Ticket Promedio
          </span>
          <h3 style={{ fontSize: '1.5rem', color: '#b59410', margin: '8px 0 4px 0' }}>
            {formatoColones(ticketPromedio)}
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#888' }}>
            {confirmadasEnPeriodo.length} venta{confirmadasEnPeriodo.length === 1 ? '' : 's'} confirmada{confirmadasEnPeriodo.length === 1 ? '' : 's'}
          </span>
        </div>

        <div style={kpiCardStyle}>
          <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Pedidos Pendientes
          </span>
          <h3 style={{ fontSize: '1.5rem', color: '#e65100', margin: '8px 0 4px 0' }}>{pendientesCount}</h3>
          <span style={{ fontSize: '0.78rem', color: '#888' }}>Requieren atención</span>
        </div>

        <div style={kpiCardStyle}>
          <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Productos Stock Bajo
          </span>
          <h3 style={{ fontSize: '1.5rem', color: '#c62828', margin: '8px 0 4px 0' }}>
            {productosStockBajo.length} u.
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#888' }}>5 unidades o menos</span>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div style={{ ...panelStyle, display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#444', textTransform: 'uppercase' }}>
          Accesos Rápidos:
        </span>
        <button onClick={() => onCambiarSeccion && onCambiarSeccion('reportes')} style={{ ...botonAccionStyle, background: '#b59410' }}>
          📊 Ver Reportes y Ventas
        </button>
        <button onClick={() => onCambiarSeccion && onCambiarSeccion('pedidos')} style={botonAccionStyle}>
          🛒 Gestionar Pedidos
        </button>
        <button onClick={() => onCambiarSeccion && onCambiarSeccion('inventario')} style={botonAccionStyle}>
          💍 Gestionar Inventario
        </button>
      </div>

      {/* Gráfico Analítico */}
      <div style={panelStyle}>
        <h4 style={{ margin: '0 0 15px 0', color: '#1a1a1a', fontSize: '1rem' }}>Comportamiento de Ventas</h4>
        {datosGrafico.length === 0 ? (
          <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center', padding: '40px 0' }}>
            No hay ventas confirmadas en este período.
          </p>
        ) : (
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <AreaChart data={datosGrafico}>
                <defs>
                  <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b59410" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#b59410" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `₡${v.toLocaleString('es-CR')}`} width={80} />
                <Tooltip formatter={(value) => [formatoColones(value), 'Monto']} labelFormatter={(label) => `Fecha: ${label}`} />
                <Area type="monotone" dataKey="monto" stroke="#b59410" strokeWidth={3} fill="url(#colorMonto)" dot={{ fill: '#b59410' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Últimas ventas + Stock crítico, en dos columnas */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ ...panelStyle, flex: '2', minWidth: '320px', marginBottom: 0 }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#1a1a1a', fontSize: '1rem' }}>Últimas Ventas</h4>
          {ultimasVentas.length === 0 ? (
            <p style={{ color: '#999', fontSize: '0.85rem' }}>Sin movimientos registrados todavía.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '8px 10px', color: '#888', fontWeight: '600' }}>Fecha</th>
                    <th style={{ padding: '8px 10px', color: '#888', fontWeight: '600' }}>Cliente</th>
                    <th style={{ padding: '8px 10px', color: '#888', fontWeight: '600' }}>Monto</th>
                    <th style={{ padding: '8px 10px', color: '#888', fontWeight: '600' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasVentas.map((venta, idx) => {
                    const estilo = ESTADO_ESTILO[venta.estado] || { bg: '#f0f0f0', color: '#555', label: venta.estado || 'N/D' };
                    return (
                      <tr key={venta.id_venta || venta.id || idx} style={{ borderBottom: '1px solid #f2f2f2' }}>
                        <td style={{ padding: '10px' }}>{(venta.fecha_creacion || '').substring(0, 10) || '—'}</td>
                        <td style={{ padding: '10px' }}>{venta.cliente_nombre || venta.nombre_cliente || '—'}</td>
                        <td style={{ padding: '10px', fontWeight: '600' }}>{formatoColones(venta.monto_total)}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ background: estilo.bg, color: estilo.color, padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {estilo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ ...panelStyle, flex: '1', minWidth: '260px', marginBottom: 0 }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#1a1a1a', fontSize: '1rem' }}>Stock Crítico</h4>
          {productosStockBajo.length === 0 ? (
            <p style={{ color: '#999', fontSize: '0.85rem' }}>Todo el inventario tiene stock saludable. ✅</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {productosStockBajo.slice(0, 6).map((prod) => (
                <div key={prod.id_producto} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f2f2f2' }}>
                  <span style={{ fontSize: '0.85rem', color: '#333' }}>{prod.nombre}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: Number(prod.stock) === 0 ? '#c62828' : '#e65100' }}>
                    {prod.stock} u.
                  </span>
                </div>
              ))}
              {productosStockBajo.length > 6 && (
                <button
                  onClick={() => onCambiarSeccion && onCambiarSeccion('inventario')}
                  style={{ background: 'none', border: 'none', color: '#b59410', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left', padding: '4px 0' }}
                >
                  Ver los {productosStockBajo.length - 6} restantes →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
