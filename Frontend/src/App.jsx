import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import WhatsAppButton from './components/WhatsAppButton';
import Inicio from './pages/Inicio';
import Tienda from './pages/Tienda'; 
import DetalleProducto from './pages/DetalleProducto'; 
import Nosotros from './pages/Nosotros'; 
import Contacto from './pages/Contacto'; 

// 🌟 CONTENEDOR PARA LAS PÁGINAS PÚBLICAS
// Este componente agrupa y muestra el Navbar, Footer y WhatsApp solo a los clientes de la tienda.
const DisenoPublico = () => {
  return (
    <>
      {/* Menú de navegación fijo superior */}
      <Navbar />
      
      {/* Contenedor principal para las páginas públicas */}
      <main style={{ backgroundColor: '#fcfcfc', minHeight: 'calc(100vh - 120px)' }}>
        <Outlet /> {/* 👈 Aquí se renderizan Inicio, Tienda, Nosotros, etc. */}
      </main>

      {/* Pie de página corporativo unificado */}
      <Footer />

      {/* Botón flotante de WhatsApp activo en el sitio público */}
      <WhatsAppButton />
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        
        {/* 1. 🛍️ RUTAS PÚBLICAS (Llevan el Navbar, Footer y WhatsApp integrados) */}
        <Route element={<DisenoPublico />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
        </Route>

        {/* 2. 🔐 RUTA DE LOGIN (Totalmente limpia y aislada) */}
        <Route path="/login" element={<Login />} />

        {/* 3. 🖥️ RUTA DEL PANEL ADMINISTRATIVO (Limpia para que manejes tu propio diseño de panel) */}
        <Route path="/admin/panel" element={<AdminPanel />} />

      </Routes>
    </Router>
  );
}

export default App;