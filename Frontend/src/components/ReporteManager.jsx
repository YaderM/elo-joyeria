import React from 'react';
import * as XLSX from 'xlsx';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  tableRowHeader: { flexDirection: 'row', backgroundColor: '#222', padding: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', padding: 5 },
  textHeader: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});

function ReporteVentasPDF({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Reporte de Ventas Joyería Elo</Text>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.textHeader, {width: '20%'}]}>Cod</Text>
          <Text style={[styles.textHeader, {width: '50%'}]}>Joya</Text>
          <Text style={[styles.textHeader, {width: '30%'}]}>Total</Text>
        </View>
        {data.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={{width: '20%', fontSize: 9}}>{item.codigo}</Text>
            <Text style={{width: '50%', fontSize: 9}}>{item.nombre_joya}</Text>
            <Text style={{width: '30%', fontSize: 9}}>₡{Number(item.total_ingresos_colones).toLocaleString()}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export default function ReporteManager({ data, loading }) {
  if (loading) return <div>Cargando...</div>;
  if (!data || data.length === 0) return <div>No hay resultados. Selecciona una fecha y consulta.</div>;

  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Ventas");
    XLSX.writeFile(wb, "Reporte.xlsx");
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <button onClick={exportarExcel} style={{ marginRight: '10px' }}>Excel</button>
      <PDFDownloadLink document={<ReporteVentasPDF data={data} />} fileName="Reporte.pdf">
        {({ loading }) => <button>{loading ? '...' : 'PDF'}</button>}
      </PDFDownloadLink>
      <table style={{ width: '100%', marginTop: '10px' }}>
        <thead><tr><th>Código</th><th>Joya</th><th>Ventas</th><th>Total</th></tr></thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i}><td>{item.codigo}</td><td>{item.nombre_joya}</td><td>{item.unidades_vendidas}</td><td>₡{Number(item.total_ingresos_colones).toLocaleString()}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}