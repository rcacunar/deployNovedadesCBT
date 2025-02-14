// src/components/NovedadesList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3002');

const getPriorityClasses = (prioridad) => {
  switch (prioridad) {
    case 1: // Alta
      return "bg-red-100 border-red-300";
    case 2: // Media
      return "bg-yellow-100 border-yellow-300";
    case 3: // Baja
      return "bg-green-100 border-green-300";
    default:
      return "bg-white";
  }
};

const getPriorityLabel = (valor) => {
  switch (valor) {
    case 1:
      return 'Alta';
    case 2:
      return 'Media';
    case 3:
      return 'Baja';
    default:
      return valor;
  }
};

// Función para formatear la fecha en formato DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha no válida';
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const NovedadesList = () => {
  const [novedades, setNovedades] = useState([]);
  const [selectedNovedad, setSelectedNovedad] = useState(null);

  const fetchNovedades = async () => {
    try {
      const response = await axios.get('http://localhost:3002/novedades');
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

  const handleCardClick = (novedad) => {
    setSelectedNovedad(novedad);
  };

  const closeModal = () => {
    setSelectedNovedad(null);
  };

  // Filtrar las novedades no caducadas: se muestra solo si la fecha es mayor o igual a la fecha actual
  const currentDate = new Date();
  const validNovedades = novedades.filter(nov => new Date(nov.fechacaducidad) >= currentDate);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Novedades</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {validNovedades.map((novedad) => (
          <div
            key={novedad.id}
            className={`cursor-pointer shadow rounded-lg p-4 border ${getPriorityClasses(novedad.prioridad)}`}
            onClick={() => handleCardClick(novedad)}
          >
            <h2 className="text-xl font-semibold mb-2">{novedad.titulo}</h2>
            <p className="text-gray-700 mb-2">{novedad.resumen}</p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Prioridad:</span> {getPriorityLabel(novedad.prioridad)}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Caduca:</span> {formatDate(novedad.fechacaducidad)}
            </p>
          </div>
        ))}
      </div>

      {/* Modal: Popup para mostrar el contenido completo de la novedad */}
      {selectedNovedad && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedNovedad.titulo}</h2>
            <p className="mb-4">{selectedNovedad.resumen}</p>
            <div className="mb-4">
              <span className="font-medium">Prioridad:</span> {getPriorityLabel(selectedNovedad.prioridad)}
            </div>
            <div className="mb-4">
              <span className="font-medium">Caduca:</span> {formatDate(selectedNovedad.fechacaducidad)}
            </div>
            <div
              className="description-content"
              style={{ whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: selectedNovedad.descripcion }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NovedadesList;
