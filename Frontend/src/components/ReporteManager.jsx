import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';
import robotoFont from '../assets/fonts/Roboto-Regular.ttf';
import robotoFontBold from '../assets/fonts/Roboto-Bold.ttf';
import ReporteProductosPDF from './ReporteProductosPDF';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: robotoFont, fontWeight: 'normal' },
    { src: robotoFontBold, fontWeight: 'bold' },
  ],
});

// 🎨 Estilos para el PDF
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Roboto' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#b59410', paddingBottom: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#b59410', textTransform: 'uppercase' },
  subtitle: { fontSize: 10, color: '#666', marginTop: 5 },
  tableRowHeader: { flexDirection: 'row', backgroundColor: '#222', color: '#fff', borderRadius: 4, minHeight: 25, alignItems: 'center', marginTop: 15 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', minHeight: 30, alignItems: 'center' },
  textHeader: { color: '#fff', fontSize: 8, fontWeight: 'bold', paddingLeft: 5 },
  textBody: { fontSize: 8, paddingLeft: 5 }
});

function ReporteProductosCompletoPDF({ productos }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}><Text style={styles.title}>Reporte Detallado de Productos</Text></View>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.textHeader, { width: '10%' }]}>ID</Text>
          <Text style={[styles.textHeader, { width: '25%' }]}>Código</Text>
          <Text style={[styles.textHeader, { width: '30%' }]}>Nombre</Text>
          <Text style={[styles.textHeader, { width: '15%' }]}>Precio</Text>
          <Text style={[styles.textHeader, { width: '10%' }]}>Stock</Text>
          <Text style={[styles.textHeader, { width: '10%' }]}>Material</Text>
        </View>
        {productos.map((p, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={[styles.textBody, { width: '10%' }]}>{p.id_producto}</Text>
            <Text style={[styles.textBody, { width: '25%' }]}>{p.codigo || '-'}</Text>
            <Text style={[styles.textBody, { width: '30%' }]}>{p.nombre || '-'}</Text>
            <Text style={[styles.textBody, { width: '15%' }]}>{'\u20A1'}{Number(p.precio || 0).toLocaleString()}</Text>
            <Text style={[styles.textBody, { width: '10%' }]}>{p.stock || 0}</Text>
            <Text style={[styles.textBody, { width: '10%' }]}>{p.material || '-'}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

function ReporteVentasPDF({ data, titulo }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Joyería Elo - Reporte</Text>
          <Text style={styles.subtitle}>{titulo}</Text>
        </View>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.textHeader, { width: '18%' }]}>Fecha</Text>
          <Text style={[styles.textHeader, { width: '36%' }]}>Productos</Text>
          <Text style={[styles.textHeader, { width: '18%' }]}>Estado</Text>
          <Text style={[styles.textHeader, { width: '18%', textAlign: 'right', paddingRight: 5 }]}>Total</Text>
        </View>
        {data.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={[styles.textBody, { width: '18%' }]}>{item.fecha_creacion || 'N/A'}</Text>
            <Text style={[styles.textBody, { width: '36%' }]}>
                {item.detalle_productos ? (typeof item.detalle_productos === 'string' ? JSON.parse(item.detalle_productos).map(p => p.nombre).join(', ') : item.detalle_productos.map(p => p.nombre).join(', ')) : '-'}
            </Text>
            <Text style={[styles.textBody, { width: '18%' }]}>{item.estado || 'N/A'}</Text>
            <Text style={[styles.textBody, { width: '18%', textAlign: 'right', paddingRight: 5 }]}>{'\u20A1'}{Number(item.monto_total || 0).toLocaleString()}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export default function ReporteManager({ 
  seccionActivaReporte, 
  datosReporte, 
  estiloBotonDescargaPRO, 
  estiloCeldaTh, 
  estiloCeldaTd 
}) {
  const [filtroEstado, setFiltroEstado] = useState('TODAS');

  const parsearProductosSeguro = (detalle) => {
    try {
      if (!detalle) return '-';
      const items = typeof detalle === 'string' ? JSON.parse(detalle) : detalle;
      return Array.isArray(items) ? items.map(p => p.nombre).join(', ') : '-';
    } catch (e) {
      return "Error en datos";
    }
  };

  const esVentas = seccionActivaReporte === 'dia' || seccionActivaReporte === 'rango';
  const esProductos = seccionActivaReporte === 'productos';
  const esInventario = seccionActivaReporte === 'inventario';
  
  const datosNormalizados = useMemo(() => {
    return (datosReporte || []).map(item => ({
      ...item,
      fecha_creacion: item.fecha_creacion || item.fecha || 'N/A',
      nombre_cliente: item.nombre_cliente || item.cliente || 'N/A',
      estado: (item.estado || 'PENDIENTE').toUpperCase(),
      monto_total: item.monto_total || item.total || 0
    }));
  }, [datosReporte]);

  const datosFiltrados = useMemo(() => {
    if (esVentas && filtroEstado !== 'TODAS') {
      return datosNormalizados.filter(item => item.estado === filtroEstado.toUpperCase());
    }
    return datosNormalizados;
  }, [datosNormalizados, filtroEstado, esVentas]);

  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosFiltrados);
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `Reporte_Elo_${seccionActivaReporte}.xlsx`);
  };

  const hayDatosReales = datosFiltrados && datosFiltrados.length > 0 && 
    (esVentas ? datosFiltrados[0].fecha_creacion !== 'N/A' : true);

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', marginTop: '20px' }}>
      <style>{`
        .tabla-reportes-desktop { display: table; width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
        .tarjetas-reportes-mobile { display: none; }
        @media (max-width: 768px) {
          .tabla-reportes-desktop { display: none !important; }
          .tarjetas-reportes-mobile { display: flex !important; flex-direction: column; gap: 15px; }
        }
      `}</style>

      <div style={{ marginBottom: '15px', width: '100%', boxSizing: 'border-box' }}>
        {esVentas && (
          <div style={{ marginBottom: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '5px', boxSizing: 'border-box' }}>
             <label style={{ marginRight: '10px' }}>Filtrar Estado:</label>
             <select onChange={(e) => setFiltroEstado(e.target.value)} value={filtroEstado} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
               <option value="TODAS">Todas</option>
               <option value="CONFIRMADA">Confirmadas</option>
               <option value="PENDIENTE">Pendientes</option>
             </select>
          </div>
        )}

        {hayDatosReales && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button onClick={exportarExcel} style={{ ...estiloBotonDescargaPRO, backgroundColor: '#1d6f42', width: 'auto', padding: '10px 25px', boxSizing: 'border-box' }}>Excel 📗</button>
            <PDFDownloadLink 
              document={
                esProductos 
                ? <ReporteProductosCompletoPDF productos={datosFiltrados} /> 
                : esInventario 
                  ? <ReporteProductosPDF productos={datosFiltrados} /> 
                  : <ReporteVentasPDF data={datosFiltrados} titulo={`Reporte de ${seccionActivaReporte}`} />
              } 
              fileName={`Reporte_Elo_${seccionActivaReporte}.pdf`}
              style={{ textDecoration: 'none' }}
            >
              {({ loading }) => (
                <button style={{ ...estiloBotonDescargaPRO, width: 'auto', padding: '10px 25px', boxSizing: 'border-box' }}>{loading ? 'Preparando...' : 'PDF 📕'}</button>
              )}
            </PDFDownloadLink>
          </div>
        )}
      </div>

      {hayDatosReales ? (
        <>
          {/* Vista de Tarjetas para Celulares */}
          <div className="tarjetas-reportes-mobile">
            {datosFiltrados.map((item, i) => (
              <div key={i} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
                {esVentas ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>{typeof item.fecha_creacion === 'string' ? item.fecha_creacion.substring(0, 10) : item.fecha_creacion}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: item.estado === 'CONFIRMADA' ? '#e8f5e9' : '#fff3e0', color: item.estado === 'CONFIRMADA' ? '#2e7d32' : '#e65100' }}>{item.estado}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block' }}>Cliente</span>
                      <strong style={{ fontSize: '0.95rem', color: '#1a1a1a' }}>{item.nombre_cliente}</strong>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block' }}>Productos</span>
                      <span style={{ fontSize: '0.85rem', color: '#333' }}>{parsearProductosSeguro(item.detalle_productos)}</span>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                      <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginRight: '5px' }}>Total:</span>
                      <strong style={{ fontSize: '1.1rem', color: '#2e7d32' }}>₡{Number(item.monto_total || 0).toLocaleString()}</strong>
                    </div>
                  </>
                ) : esInventario ? (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block' }}>Nombre</span>
                      <strong style={{ fontSize: '0.95rem', color: '#1a1a1a' }}>{item.nombre}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block' }}>Stock</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{item.stock || 0} u.</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block' }}>Precio</span>
                        <strong style={{ fontSize: '1rem', color: '#2e7d32' }}>₡{Number(item.precio || 0).toLocaleString()}</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#888' }}>ID: {item.id_producto}</span>
                      <span style={{ fontSize: '0.75rem', color: '#b59410', fontWeight: 'bold' }}>{item.codigo || 'Sin código'}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: '#1a1a1a', display: 'block' }}>{item.nombre}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>{item.descripcion || 'Sin descripción'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #eee', fontSize: '0.85rem' }}>
                      <div><span style={{ color: '#888', display: 'block', fontSize: '0.7rem' }}>PRECIO</span> <strong>₡{Number(item.precio || 0).toLocaleString()}</strong></div>
                      <div><span style={{ color: '#888', display: 'block', fontSize: '0.7rem' }}>STOCK</span> <strong>{item.stock || 0} u.</strong></div>
                      <div><span style={{ color: '#888', display: 'block', fontSize: '0.7rem' }}>MATERIAL</span> <strong>{item.material || 'N/A'}</strong></div>
                      <div><span style={{ color: '#888', display: 'block', fontSize: '0.7rem' }}>TIPO</span> <strong>{item.tipo_producto || 'N/A'}</strong></div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Vista de Tabla Tradicional para Escritorio */}
          <div className="tabla-reportes-desktop" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
                  <th style={estiloCeldaTh}>{esVentas ? 'Fecha' : esInventario ? 'Nombre' : 'ID'}</th>
                  <th style={estiloCeldaTh}>{esVentas ? 'Cliente' : esInventario ? 'Stock' : 'Código'}</th>
                  <th style={estiloCeldaTh}>{esVentas ? 'Productos' : esInventario ? 'Precio' : 'Nombre'}</th>
                  {esProductos ? (
                    <>
                      <th style={estiloCeldaTh}>Descripción</th>
                      <th style={estiloCeldaTh}>Precio</th>
                      <th style={estiloCeldaTh}>Stock</th>
                      <th style={estiloCeldaTh}>Material</th>
                      <th style={estiloCeldaTh}>Tipo</th>
                    </>
                  ) : esVentas ? (
                    <>
                      <th style={estiloCeldaTh}>Estado</th>
                      <th style={estiloCeldaTh}>Total</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    {esVentas ? (
                      <>
                        <td style={estiloCeldaTd}>{typeof item.fecha_creacion === 'string' ? item.fecha_creacion.substring(0, 10) : item.fecha_creacion}</td>
                        <td style={estiloCeldaTd}>{item.nombre_cliente}</td>
                        <td style={estiloCeldaTd}>{parsearProductosSeguro(item.detalle_productos)}</td>
                        <td style={estiloCeldaTd}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', background: item.estado === 'CONFIRMADA' ? '#e8f5e9' : '#fff3e0' }}>{item.estado}</span>
                        </td>
                        <td style={estiloCeldaTd}>₡{Number(item.monto_total || 0).toLocaleString()}</td>
                      </>
                    ) : esInventario ? (
                      <>
                        <td style={estiloCeldaTd}>{item.nombre}</td>
                        <td style={estiloCeldaTd}>{item.stock || 0}</td>
                        <td style={estiloCeldaTd}>₡{Number(item.precio || 0).toLocaleString()}</td>
                      </>
                    ) : (
                      <>
                        <td style={estiloCeldaTd}>{item.id_producto}</td>
                        <td style={estiloCeldaTd}>{item.codigo}</td>
                        <td style={estiloCeldaTd}>{item.nombre}</td>
                        <td style={estiloCeldaTd}>{item.descripcion || 'N/A'}</td>
                        <td style={estiloCeldaTd}>₡{Number(item.precio || 0).toLocaleString()}</td>
                        <td style={estiloCeldaTd}>{item.stock || 0} u.</td>
                        <td style={estiloCeldaTd}>{item.material || 'N/A'}</td>
                        <td style={estiloCeldaTd}>{item.tipo_producto || 'N/A'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#888', border: '1px dashed #ccc', borderRadius: '8px', boxSizing: 'border-box' }}>
          Esperando resultados de la consulta...
        </div>
      )}
    </div>
  );
}