import React, { useState } from 'react';
import axios from 'axios';
import ReporteManager from './ReporteManager';

export default function Reportes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  // Asumiendo que aquí tienes tus estados de fecha
  const [fecha, setFecha] = useState(''); 

  const handleConsultar = async () => {
    setLoading(true);
    try {
      // Ajusta la URL si necesitas enviar parámetros de fecha
      const res = await axios.get('https://elo-joyeria-backend.vercel.app/api/ventas/datos-reporte');
      setData(res.data);
    } catch (err) {
      console.error("Error al consultar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Generador de Reportes</h1>
      {/* Aquí van tus inputs de calendario */}
      <input type="date" onChange={(e) => setFecha(e.target.value)} />
      <button onClick={handleConsultar}>Consultar</button>

      {/* AQUÍ ES DONDE EL HIJO RECIBE LA DATA */}
      <ReporteManager data={data} loading={loading} />
    </div>
  );
}