import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import ReporteProductosPDF from './ReporteProductosPDF';

// 🎨 Estilos para el PDF
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#b59410', paddingBottom: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#b59410', textTransform: 'uppercase' },
  subtitle: { fontSize: 10, color: '#666', marginTop: 5 },
  tableRowHeader: { flexDirection: 'row', backgroundColor: '#222', color: '#fff', borderRadius: 4, minHeight: 25, alignItems: 'center', marginTop: 15 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', minHeight: 30, alignItems: 'center' },
  textHeader: { color: '#fff', fontSize: 8, fontWeight: 'bold', paddingLeft: 5 },
  textBody: { fontSize: 8, paddingLeft: 5 }
});

// 📄 PDF Detallado para Productos
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
            <Text style={[styles.textBody, { width: '15%' }]}>₡{Number(p.precio || 0).toLocaleString()}</Text>
            <Text style={[styles.textBody, { width: '10%' }]}>{p.stock || 0}</Text>
            <Text style={[styles.textBody, { width: '10%' }]}>{p.material || '-'}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

// 📄 PDF Molde para Ventas
function ReporteVentasPDF({ data, titulo }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Joyería Elo - Reporte</Text>
          <Text style={styles.subtitle}>{titulo}</Text>
        </View>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.textHeader, { width: '15%' }]}>Fecha</Text>
          <Text style={[styles.textHeader, { width: '45%' }]}>Productos</Text>
          <Text style={[styles.textHeader, { width: '20%' }]}>Estado</Text>
          <Text style={[styles.textHeader, { width: '20%', textAlign: 'right' }]}>Total</Text>
        </View>
        {data.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={[styles.textBody, { width: '15%' }]}>{item.fecha_registro?.split('T')[0]}</Text>
            <Text style={[styles.textBody, { width: '45%' }]}>{item.detalle_productos ? JSON.parse(item.detalle_productos).map(p => p.nombre).join(', ') : '-'}</Text>
            <Text style={[styles.textBody, { width: '20%' }]}>{item.estado}</Text>
            <Text style={[styles.textBody, { width: '20%', textAlign: 'right' }]}>₡{Number(item.total_venta || 0).toLocaleString()}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export default function ReporteManager({ seccionActivaReporte, datosReporte, estiloBotonDescargaPRO, estiloCeldaTh, estiloCeldaTd }) {
  const [filtroEstado, setFiltroEstado] = useState('TODAS');

  const datosFiltrados = useMemo(() => {
    let base = datosReporte || [];
    if ((seccionActivaReporte === 'dia' || seccionActivaReporte === 'rango') && filtroEstado !== 'TODAS') {
      return base.filter(item => item.estado === filtroEstado);
    }
    return base;
  }, [datosReporte, filtroEstado, seccionActivaReporte]);

  const totalAcumulado = useMemo(() => 
    datosFiltrados.reduce((acc, curr) => acc + Number(curr.total_venta || 0), 0), 
  [datosFiltrados]);

  const parseDetalle = (detalle) => {
    try {
      const arr = typeof detalle === 'string' ? JSON.parse(detalle) : detalle;
      return arr.map(i => `${i.cantidad || 1}x ${i.nombre}`).join(', ');
    } catch { return 'Detalle error'; }
  };

  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosFiltrados);
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `Reporte_Elo_${seccionActivaReporte}.xlsx`);
  };

  const esVentas = seccionActivaReporte === 'dia' || seccionActivaReporte === 'rango';
  const esProductos = seccionActivaReporte === 'productos';
  const esInventario = seccionActivaReporte === 'inventario';

  return (
    <div style={{ marginTop: '20px' }}>
      {(esVentas) && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Filtrar Estado:</label><br/>
            <select onChange={(e) => setFiltroEstado(e.target.value)} value={filtroEstado} style={{ padding: '5px' }}>
              <option value="TODAS">Todas</option>
              <option value="CONFIRMADA">Confirmadas</option>
              <option value="PENDIENTE">Pendientes</option>
            </select>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: '#666' }}>Total en lista:</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a1a' }}>₡{totalAcumulado.toLocaleString('es-CR')}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={exportarExcel} style={{ ...estiloBotonDescargaPRO, backgroundColor: '#1d6f42', width: 'auto' }}>Excel 📗</button>
        <PDFDownloadLink 
          document={esProductos ? <ReporteProductosCompletoPDF productos={datosFiltrados} /> : esInventario ? <ReporteProductosPDF productos={datosFiltrados} /> : <ReporteVentasPDF data={datosFiltrados} titulo={`Reporte de ${seccionActivaReporte}`} />}
          fileName={`Reporte_Elo_${seccionActivaReporte}.pdf`}
        >
          {({ loading }) => <button style={{ ...estiloBotonDescargaPRO, width: 'auto' }}>{loading ? '...' : 'PDF 📕'}</button>}
        </PDFDownloadLink>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
              <th style={estiloCeldaTh}>{esVentas ? 'Fecha' : 'ID'}</th>
              <th style={estiloCeldaTh}>{esVentas ? 'Email' : 'Código'}</th>
              <th style={estiloCeldaTh}>{esVentas ? 'Detalle' : 'Nombre'}</th>
              {esProductos ? (
                <>
                  <th style={estiloCeldaTh}>Precio</th>
                  <th style={estiloCeldaTh}>Stock</th>
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
            {datosFiltrados.length > 0 ? datosFiltrados.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={estiloCeldaTd}>{esVentas ? item.fecha_registro?.split('T')[0] : item.id_producto}</td>
                <td style={estiloCeldaTd}>{item.email_cliente || item.codigo}</td>
                <td style={estiloCeldaTd}>{esVentas ? parseDetalle(item.detalle_productos) : item.nombre}</td>
                {esProductos ? (
                  <>
                    <td style={estiloCeldaTd}>₡{Number(item.precio || 0).toLocaleString()}</td>
                    <td style={estiloCeldaTd}>{item.stock}</td>
                  </>
                ) : esVentas ? (
                  <>
                    <td style={estiloCeldaTd}>
                      <span style={{ padding: '2px 8px', borderRadius: '10px', background: item.estado === 'CONFIRMADA' ? '#e8f5e9' : '#fff3e0' }}>{item.estado}</span>
                    </td>
                    <td style={estiloCeldaTd}>₡{Number(item.total_venta || 0).toLocaleString()}</td>
                  </>
                ) : null}
              </tr>
            )) : <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No hay resultados.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}