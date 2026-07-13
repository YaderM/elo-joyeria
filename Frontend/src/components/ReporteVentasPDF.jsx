import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eaeaea', paddingBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#b59410', letterSpacing: 1 },
  kpiContainer: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  kpiCard: { flex: 1, backgroundColor: '#f9f9f9', padding: 12, borderRadius: 4, borderWidth: 1, borderColor: '#eee' },
  kpiLabel: { fontSize: 8, color: '#777', textTransform: 'uppercase' },
  kpiValue: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  tableRowHeader: { flexDirection: 'row', backgroundColor: '#222', color: '#fff', borderRadius: 4, minHeight: 25, alignItems: 'center' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', minHeight: 30, alignItems: 'center' },
  textHeader: { fontWeight: 'bold', fontSize: 9, color: '#fff', paddingLeft: 5 },
  textBody: { fontSize: 9, paddingLeft: 5 }
});

export default function ReporteVentasPDF({ data }) {
  const totalPiezas = data.reduce((acc, curr) => acc + Number(curr.unidades_vendidas || 0), 0);
  const totalIngresos = data.reduce((acc, curr) => acc + Number(curr.total_ingresos_colones || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}><Text style={styles.title}>Joyería Elo — Reporte Analítico</Text></View>
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Productos</Text><Text style={styles.kpiValue}>{data.length}</Text></View>
          <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Total Unidades</Text><Text style={styles.kpiValue}>{totalPiezas}</Text></View>
          <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Ingreso Neto</Text><Text style={styles.kpiValue}>₡{totalIngresos.toLocaleString('es-CR')}</Text></View>
        </View>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.textHeader, {width: '20%'}]}>Cod</Text>
          <Text style={[styles.textHeader, {width: '50%'}]}>Joya</Text>
          <Text style={[styles.textHeader, {width: '30%', textAlign: 'right'}]}>Total</Text>
        </View>
        {data.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={[styles.textBody, {width: '20%'}]}>{item.codigo}</Text>
            <Text style={[styles.textBody, {width: '50%'}]}>{item.nombre_joya}</Text>
            <Text style={[styles.textBody, {width: '30%', textAlign: 'right'}]}>₡{Number(item.total_ingresos_colones).toLocaleString('es-CR')}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}