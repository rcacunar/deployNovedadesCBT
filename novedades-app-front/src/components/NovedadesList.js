// src/components/NovedadesList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Conexión a Socket.IO en el backend
const socket = io('http://localhost:3001');

const NovedadesList = () => {
  const [novedades, setNovedades] = useState([]);

  const fetchNovedades = async () => {
    try {
      const response = await axios.get('http://localhost:3001/novedades');
      setNovedades(response.data);
    } catch (error) {
      console.error('Error al obtener las novedades:', error);
    }
  };

  useEffect(() => {
    fetchNovedades();

    socket.on('novedadAgregada', (novedad) => {
      setNovedades((prev) => [...prev, novedad]);
    });

    socket.on('novedadEliminada', ({ id }) => {
      setNovedades((prev) => prev.filter((nov) => nov.id !== parseInt(id)));
    });

    return () => {
      socket.off('novedadAgregada');
      socket.off('novedadEliminada');
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Novedades</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {novedades.map((novedad) => (
          <div
            key={novedad.id}
            className="bg-white shadow rounded-lg p-4 border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-2">{novedad.titulo}</h2>
            <p className="text-gray-700 mb-2">{novedad.descripcion}</p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Prioridad:</span> {novedad.prioridad}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Caduca:</span> {novedad.fechaCaducidad}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NovedadesList;
