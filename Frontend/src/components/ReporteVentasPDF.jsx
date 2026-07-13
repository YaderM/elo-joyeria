import React from 'react';
import * as XLSX from 'xlsx';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// --- ESTILOS PARA PDF ---
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eaeaea', paddingBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#b59410', letterSpacing: 1 },
  subtitle: { fontSize: 11, color: '#222', marginTop: 5, fontWeight: 'bold', textTransform: 'uppercase' },
  metaText: { fontSize: 9, color: '#666', marginTop: 3 },
  kpiContainer: { flexDirection: 'row', gap: 15, marginBottom: 25, marginTop: 10 },
  kpiCard: { flex: 1, backgroundColor: '#f9f9f9', padding: 12, borderRadius: 4, borderWidth: 1, borderColor: '#eee' },
  kpiLabel: { fontSize: 8, color: '#777', textTransform: 'uppercase', marginBottom: 4 },
  kpiValue: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  kpiValueGold: { fontSize: 14, fontWeight: 'bold', color: '#b59410' },
  tableRowHeader: { flexDirection: 'row', backgroundColor: '#222', color: '#fff', borderRadius: 4, minHeight: 25, alignItems: 'center', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', minHeight: 30, alignItems: 'center' },
  colFactura: { width: '15%', fontSize: 9, paddingLeft: 5 },
  colProducto: { width: '40%', fontSize: 9 },
  colCantidad: { width: '10%', fontSize: 9, textAlign: 'center' },
  colTotal: { width: '20%', fontSize: 9, textAlign: 'right', paddingRight: 5 },
  textHeader: { fontWeight: 'bold', fontSize: 9, color: '#fff' },
  textHeaderRight: { fontWeight: 'bold', fontSize: 9, color: '#fff', textAlign: 'right', width: '100%', paddingRight: 5 }
});

// --- COMPONENTE PDF ---
function ReporteVentasPDF({ data }) {
  const totalPiezas = data.reduce((acc, curr) => acc + Number(curr.unidades_vendidas || 0), 0);
  const totalIngresos = data.reduce((acc, curr) => acc + Number(curr.total_ingresos_colones || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Joyería Elo — Reporte Analítico</Text>
        </View>
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Productos</Text><Text style={styles.kpiValue}>{data.length}</Text></View>
          <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Total Unidades</Text><Text style={styles.kpiValue}>{totalPiezas}</Text></View>
          <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Ingreso Neto</Text><Text style={styles.kpiValueGold}>₡{totalIngresos.toLocaleString('es-CR')}</Text></View>
        </View>
        <View style={styles.tableRowHeader}>
          <View style={styles.colFactura}><Text style={styles.textHeader}>Cod</Text></View>
          <View style={styles.colProducto}><Text style={styles.textHeader}>Joya</Text></View>
          <View style={styles.colCantidad}><Text style={styles.textHeader}>Ventas</Text></View>
          <View style={styles.colTotal}><Text style={styles.textHeaderRight}>Total</Text></View>
        </View>
        {data.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.colFactura}><Text>{item.codigo}</Text></View>
            <View style={styles.colProducto}><Text>{item.nombre_joya}</Text></View>
            <View style={styles.colCantidad}><Text style={{textAlign: 'center'}}>{item.unidades_vendidas}</Text></View>
            <View style={styles.colTotal}><Text style={{textAlign: 'right'}}>₡{Number(item.total_ingresos_colones).toLocaleString('es-CR')}</Text></View>
          </View>
        ))}
      </Page>
    </Document>
  );
}

// --- COMPONENTE DE INTERFAZ (ESPERA DATOS POR PROPS) ---
export default function ReporteManager({ data, loading }) {
  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    XLSX.writeFile(wb, "Reporte_Joyería_Elo.xlsx");
  };

  if (loading) return <div>Cargando datos...</div>;
  if (!data || data.length === 0) return <div>Selecciona un rango y consulta para ver resultados.</div>;

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={exportarExcel} style={{ padding: '10px 20px', background: '#222', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Descargar Excel</button>
        <PDFDownloadLink document={<ReporteVentasPDF data={data} />} fileName="Reporte_Ventas.pdf" style={{ textDecoration: 'none' }}>
           <button style={{ padding: '10px 20px', background: '#b59410', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Descargar PDF</button>
        </PDFDownloadLink>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th style={{ padding: '10px' }}>Código</th>
            <th style={{ padding: '10px' }}>Joya</th>
            <th style={{ padding: '10px' }}>Ventas</th>
            <th style={{ padding: '10px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{item.codigo}</td>
              <td style={{ padding: '10px' }}>{item.nombre_joya}</td>
              <td style={{ padding: '10px' }}>{item.unidades_vendidas}</td>
              <td style={{ padding: '10px' }}>₡{Number(item.total_ingresos_colones).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}