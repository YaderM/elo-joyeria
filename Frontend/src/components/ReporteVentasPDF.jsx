import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#b59410', paddingBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#b59410', textTransform: 'uppercase' },
  tableRowHeader: { flexDirection: 'row', backgroundColor: '#222', color: '#fff', borderRadius: 4, minHeight: 25, alignItems: 'center', marginTop: 15 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', minHeight: 30, alignItems: 'center' },
  textHeader: { fontWeight: 'bold', fontSize: 8, color: '#fff', paddingLeft: 5 },
  textBody: { fontSize: 8, paddingLeft: 5 }
});

export default function ReporteVentasPDF({ data }) {
  // Función interna para parsear productos de forma segura
  const parsearProductos = (detalle) => {
    try {
      if (!detalle) return '-';
      const productos = typeof detalle === 'string' ? JSON.parse(detalle) : detalle;
      return Array.isArray(productos) ? productos.map(p => p.nombre).join(', ') : '-';
    } catch (e) {
      return 'Error al cargar';
    }
  };

  // Calculamos el total general de todas las ventas mostradas
  const totalGeneral = data.reduce((acc, curr) => acc + Number(curr.monto_total || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Ventas</Text>
        </View>

        <View style={styles.tableRowHeader}>
          <Text style={[styles.textHeader, { width: '20%' }]}>Fecha</Text>
          <Text style={[styles.textHeader, { width: '25%' }]}>Cliente</Text>
          <Text style={[styles.textHeader, { width: '35%' }]}>Productos</Text>
          <Text style={[styles.textHeader, { width: '20%', textAlign: 'right' }]}>Total</Text>
        </View>

        {data.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={[styles.textBody, { width: '20%' }]}>
              {item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString() : '-'}
            </Text>
            <Text style={[styles.textBody, { width: '25%' }]}>{item.nombre_cliente || 'N/A'}</Text>
            <Text style={[styles.textBody, { width: '35%' }]}>
              {parsearProductos(item.detalle_productos)}
            </Text>
            <Text style={[styles.textBody, { width: '20%', textAlign: 'right' }]}>
              ₡{Number(item.monto_total || 0).toLocaleString('es-CR')}
            </Text>
          </View>
        ))}

        <View style={{ marginTop: 20, borderTopWidth: 1, paddingTop: 10 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', textAlign: 'right' }}>
            TOTAL RECAUDADO: ₡{totalGeneral.toLocaleString('es-CR')}
          </Text>
        </View>
      </Page>
    </Document>
  );
}