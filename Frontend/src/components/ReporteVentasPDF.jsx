import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

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
  colCod: { width: '15%', fontSize: 9, textAlign: 'center' }, // Columna extra para Código Pro
  colCantidad: { width: '10%', fontSize: 9, textAlign: 'center' },
  colTotal: { width: '20%', fontSize: 9, textAlign: 'right', paddingRight: 5 },
  textHeader: { fontWeight: 'bold', fontSize: 9, color: '#fff' },
  textHeaderCenter: { fontWeight: 'bold', fontSize: 9, color: '#fff', textAlign: 'center', width: '100%' },
  textHeaderRight: { fontWeight: 'bold', fontSize: 9, color: '#fff', textAlign: 'right', width: '100%', paddingRight: 5 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#eaeaea', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#999' }
});

function ReporteVentasPDF({ data, rangoFecha, esReportePro = false }) {
  const fechaGenerado = new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' });

  // Cálculos dinámicos según el tipo de reporte
  const totalTransacciones = data.length;
  const totalPiezas = data.reduce((acc, curr) => acc + Number(curr.cantidad || curr.Vendidos || 0), 0);
  const totalIngresos = data.reduce((acc, curr) => acc + Number(curr.total || curr['Suma total colones por productos'] || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Joyería Elo — Control de Caja</Text>
          <Text style={styles.subtitle}>{esReportePro ? 'Reporte Analítico Pro (Materiales)' : 'Consolidado de Ventas'}</Text>
          <Text style={styles.metaText}>Período: {rangoFecha} | Emitido: {fechaGenerado}</Text>
        </View>

        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{esReportePro ? 'Categorías' : 'Transacciones'}</Text>
            <Text style={styles.kpiValue}>{totalTransacciones}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Unidades</Text>
            <Text style={styles.kpiValue}>{totalPiezas} uds.</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Ingreso Neto Total</Text>
            <Text style={styles.kpiValueGold}>₡{totalIngresos.toLocaleString('es-CR')}</Text>
          </View>
        </View>

        <View style={{ display: 'table', width: 'auto' }}>
          <View style={styles.tableRowHeader}>
            <View style={styles.colFactura}><Text style={styles.textHeader}>{esReportePro ? 'Cod' : 'Factura'}</Text></View>
            <View style={styles.colProducto}><Text style={styles.textHeader}>Joya / Descripción</Text></View>
            {esReportePro && <View style={styles.colCod}><Text style={styles.textHeaderCenter}>Tipo</Text></View>}
            <View style={styles.colCantidad}><Text style={styles.textHeaderCenter}>Cant.</Text></View>
            <View style={styles.colTotal}><Text style={styles.textHeaderRight}>Total</Text></View>
          </View>

          {data.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.colFactura}><Text style={{ paddingLeft: 5 }}>{item.codigo || `#${item.id_venta || index + 1}`}</Text></View>
              <View style={styles.colProducto}><Text>{item.nombre_producto || item['Nombre de la Joya']}</Text></View>
              {esReportePro && <View style={styles.colCod}><Text style={{ textAlign: 'center' }}>{item.codigo ? 'PRO' : '-'}</Text></View>}
              <View style={styles.colCantidad}><Text style={{ textAlign: 'center' }}>{item.cantidad || item.Vendidos}</Text></View>
              <View style={styles.colTotal}><Text style={{ textAlign: 'right', paddingRight: 5 }}>₡{Number(item.total || item['Suma total colones por productos']).toLocaleString('es-CR')}</Text></View>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Joyería Elo S.A. — Confidencial Administrativo</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export default ReporteVentasPDF;