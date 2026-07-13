import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Definición de estilos profesionales para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#b59410',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
    marginTop: 5,
  },
  // Estilos de la Tabla
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 15,
    borderStyle: 'solid',
    borderWidth: 0,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#222222',
    color: '#ffffff',
    borderRadius: 4,
    minHeight: 30,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 35,
    alignItems: 'center',
  },
  // Columnas con anchos proporcionales
  colID: { width: '10%', fontSize: 9, paddingLeft: 5 },
  colNombre: { width: '40%', fontSize: 9, paddingLeft: 5 },
  colStock: { width: '15%', fontSize: 9, textAlign: 'center' },
  colPrecio: { width: '17%', fontSize: 9, textAlign: 'right', paddingRight: 5 },
  colOferta: { width: '18%', fontSize: 9, textAlign: 'right', paddingRight: 5, color: '#d32f2f' },
  
  textHeader: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#ffffff',
  },
  textHeaderCenter: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#ffffff',
    textAlign: 'center',
    width: '100%',
  },
  textHeaderRight: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#ffffff',
    textAlign: 'right',
    width: '100%',
    paddingRight: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
  }
});

function ReporteProductosPDF({ productos }) {
  const fechaActual = new Date().toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado del Reporte */}
        <View style={styles.header}>
          <Text style={styles.title}>Joyería Elo</Text>
          <Text style={styles.subtitle}>Reporte Ejecutivo de Inventario y Catálogo Activo</Text>
          <Text style={styles.subtitle}>Generado el: {fechaActual}</Text>
        </View>

        {/* Tabla de Productos */}
        <View style={styles.table}>
          {/* Fila de Encabezados */}
          <View style={styles.tableRowHeader}>
            <View style={styles.colID}><Text style={styles.textHeader}>ID</Text></View>
            <View style={styles.colNombre}><Text style={styles.textHeader}>Producto</Text></View>
            <View style={styles.colStock}><Text style={styles.textHeaderCenter}>Stock</Text></View>
            <View style={styles.colPrecio}><Text style={styles.textHeaderRight}>Precio Base</Text></View>
            <View style={styles.colOferta}><Text style={styles.textHeaderRight}>P. Oferta</Text></View>
          </View>

          {/* Renderizado Filas de Productos */}
          {productos.map((prod) => (
            <View style={styles.tableRow} key={prod.id_producto}>
              <View style={styles.colID}>
                <Text>{prod.id_producto}</Text>
              </View>
              <View style={styles.colNombre}>
                <Text style={{ fontWeight: '500' }}>{prod.nombre}</Text>
              </View>
              <View style={styles.colStock}>
                <Text style={{ color: prod.stock <= 3 ? '#d32f2f' : '#222' }}>
                  {prod.stock} u.
                </Text>
              </View>
              <View style={styles.colPrecio}>
                <Text>₡{Number(prod.precio || 0).toLocaleString('es-CR')}</Text>
              </View>
              <View style={styles.colOferta}>
                <Text style={{ fontWeight: prod.precio_oferta ? 'bold' : 'normal' }}>
                  {prod.precio_oferta && prod.precio_oferta > 0 
                    ? `₡${Number(prod.precio_oferta || 0).toLocaleString('es-CR')}` 
                    : '-'
                  }
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pie de Página */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Panel de Administración - Confidencial</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  );
}

export default ReporteProductosPDF;