// src/components/NovedadesList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './NovedadesList.css'; // Opcional, para estilos

// Conectar al servidor Socket.IO
const socket = io('http://localhost:3001');

const NovedadesList = () => {
  const [novedades, setNovedades] = useState([]);

  // Función para obtener las novedades del backend
  const fetchNovedades = async () => {
    try {
      const response = await axios.get('http://localhost:3001/novedades');
      setNovedades(response.data);
    } catch (error) {
      console.error('Error al obtener las novedades', error);
    }
  };

  useEffect(() => {
    fetchNovedades();

    // Escuchar el evento de novedad agregada
    socket.on('novedadAgregada', (novedad) => {
      setNovedades((prevNovedades) => [...prevNovedades, novedad]);
    });

    // Escuchar el evento de novedad eliminada
    socket.on('novedadEliminada', ({ id }) => {
      setNovedades((prevNovedades) =>
        prevNovedades.filter((novedad) => novedad.id !== parseInt(id))
      );
    });

    // Limpiar listeners al desmontar el componente
    return () => {
      socket.off('novedadAgregada');
      socket.off('novedadEliminada');
    };
  }, []);

  return (
    <div>
      <h1>Novedades</h1>
      <div className="card-container">
        {novedades.map((novedad) => (
          <div key={novedad.id} className="card">
            <h2>{novedad.titulo}</h2>
            <p>{novedad.descripcion}</p>
            <p><strong>Prioridad:</strong> {novedad.prioridad}</p>
            <p>
              <strong>Caduca:</strong> {novedad.fechaCaducidad}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NovedadesList;
