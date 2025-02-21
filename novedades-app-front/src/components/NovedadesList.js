// src/components/NovedadesList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useConfig } from '../ConfigContext';

const getPriorityClasses = (prioridad) => {
  switch (prioridad) {
    case 1:
      return "bg-red-100 border-red-300";
    case 2:
      return "bg-yellow-100 border-yellow-300";
    case 3:
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

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha no válida';
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const NovedadesList = () => {
  const config = useConfig();
  const backendUrl = config ? config.REACT_APP_BACKEND_URL : "";
  const [novedades, setNovedades] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [selectedNovedad, setSelectedNovedad] = useState(null);

  // Inicializar el socket dentro de un useEffect, dependiente de backendUrl.
  useEffect(() => {
    if (!backendUrl) return;
    const socket = io(backendUrl);
    
    socket.on('novedadAgregada', (novedad) => {
      setNovedades((prev) => [...prev, novedad]);
    });

    socket.on('novedadEliminada', ({ id }) => {
      setNovedades((prev) => prev.filter((nov) => nov.id !== parseInt(id)));
    });

    // Agregar listener para la edición
    socket.on('novedadEditada', (updatedNovedad) => {
      setNovedades((prev) =>
        prev.map((nov) =>
          nov.id === updatedNovedad.id ? updatedNovedad : nov
        )
      );
    });

    return () => {
      socket.off('novedadAgregada');
      socket.off('novedadEliminada');
      socket.off('novedadEditada');
      socket.disconnect();
    };
  }, [backendUrl]);

  const fetchNovedades = async () => {
    try {
      const response = await axios.get(`${backendUrl}/novedades`);
      setNovedades(response.data);
    } catch (error) {
      console.error('Error al obtener novedades:', error);
    }
  };

  const fetchEntidades = async () => {
    try {
      const response = await axios.get(`${backendUrl}/entidades`);
      setEntidades(response.data);
    } catch (error) {
      console.error('Error al obtener entidades:', error);
    }
  };

  useEffect(() => {
    if (backendUrl) {
      fetchNovedades();
      fetchEntidades();
    }
  }, [backendUrl]);

  const handleCardClick = (novedad) => {
    setSelectedNovedad(novedad);
  };

  const closeModal = () => {
    setSelectedNovedad(null);
  };

  // Filtrar novedades caducadas: mostrar solo las que tienen fechaCaducidad >= hoy
  const today = new Date();
  const novedadesValidas = novedades.filter(
    (novedad) => new Date(novedad.fechacaducidad) >= today
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Novedades</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {novedadesValidas.map((novedad) => (
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
            {/* Mostrar chips de entidades asociadas */}
            {novedad.entidad_ids && novedad.entidad_ids.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {novedad.entidad_ids.map((entId) => {
                  const entidad = entidades.find(e => e.id === Number(entId));
                  if (entidad) {
                    return (
                      <span
                        key={entidad.id}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        {entidad.nombre} ({entidad.tipo})
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedNovedad && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">
              {selectedNovedad.titulo}
            </h2>
            <p className="mb-4 border-b border-gray-300 pb-2">
              {selectedNovedad.resumen}
            </p>
            <div className="mb-4 border-b border-gray-300 pb-2">
              <span className="font-medium">Prioridad:</span> {getPriorityLabel(selectedNovedad.prioridad)}
            </div>
            <div className="mb-4 border-b border-gray-300 pb-2">
              <span className="font-medium">Caduca:</span> {formatDate(selectedNovedad.fechacaducidad)}
            </div>
            <div className="pt-2">
              <span className="font-medium">Descripción:</span>
              <div
                className="mt-1"
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: selectedNovedad.descripcion }}
              />
            </div>
            {selectedNovedad.entidad_ids && selectedNovedad.entidad_ids.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {selectedNovedad.entidad_ids.map((entId) => {
                  const entidad = entidades.find(e => e.id === Number(entId));
                  if (entidad) {
                    return (
                      <span
                        key={entidad.id}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        {entidad.nombre} ({entidad.tipo})
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NovedadesList;
