import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc', padding: 5 },
  header: { backgroundColor: '#222', color: '#fff', flexDirection: 'row', padding: 5, fontWeight: 'bold' }
});

export default function ReporteProductosCompletoPDF({ productos }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Reporte Completo de Productos</Text>
        <View style={styles.header}>
          <Text style={{ width: '10%' }}>Cód</Text>
          <Text style={{ width: '30%' }}>Nombre</Text>
          <Text style={{ width: '20%' }}>Precio</Text>
          <Text style={{ width: '10%' }}>Stock</Text>
          <Text style={{ width: '30%' }}>Material/Tipo</Text>
        </View>
        {productos.map((p, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={{ width: '10%' }}>{p.codigo}</Text>
            <Text style={{ width: '30%' }}>{p.nombre}</Text>
            <Text style={{ width: '20%' }}>₡{Number(p.precio).toLocaleString()}</Text>
            <Text style={{ width: '10%' }}>{p.stock}</Text>
            <Text style={{ width: '30%' }}>{p.material} / {p.tipo_producto}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}