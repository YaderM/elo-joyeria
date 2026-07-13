import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; // 👈 Importamos el Provider
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import WhatsAppButton from './components/WhatsAppButton';
import Inicio from './pages/Inicio';
import Tienda from './pages/Tienda'; 
import DetalleProducto from './pages/DetalleProducto'; 
import Nosotros from './pages/Nosotros'; 
import Contacto from './pages/Contacto'; 
import Checkout from './pages/Checkout'; // 👈 IMPORTACIÓN AGREGADA

// 🌟 CONTENEDOR PARA LAS PÁGINAS PÚBLICAS
const DisenoPublico = () => {
  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#fcfcfc', minHeight: 'calc(100vh - 120px)' }}>
        <Outlet /> 
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

function App() {
  return (
    <CartProvider> {/* 👈 Envolvemos todo el Router para proveer el estado del carrito */}
      <Router>
        <Routes>
          
          {/* 1. 🛍️ RUTAS PÚBLICAS */}
          <Route element={<DisenoPublico />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/producto/:id" element={<DetalleProducto />} />
            <Route path="/checkout" element={<Checkout />} /> {/* 👈 RUTA AGREGADA */}
          </Route>

          {/* 2. 🔐 RUTA DE LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* 3. 🖥️ RUTA DEL PANEL ADMINISTRATIVO */}
          <Route path="/admin/panel" element={<AdminPanel />} />

        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;