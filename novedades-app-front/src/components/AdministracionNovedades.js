// src/components/AdministracionNovedades.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const AdministracionNovedades = () => {
  const [novedades, setNovedades] = useState([]);
  const [nuevaNovedad, setNuevaNovedad] = useState({
    titulo: '',
    descripcion: '',
    prioridad: '',
    fechaCaducidad: '',
  });

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

  const handleInputChange = (e) => {
    setNuevaNovedad({
      ...nuevaNovedad,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/novedades', nuevaNovedad);
      setNuevaNovedad({
        titulo: '',
        descripcion: '',
        prioridad: '',
        fechaCaducidad: '',
      });
    } catch (error) {
      console.error('Error al agregar la novedad:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/novedades/${id}`);
    } catch (error) {
      console.error('Error al eliminar la novedad:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Administración de Novedades</h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white p-4 rounded shadow mb-8"
      >
        <div className="mb-4">
          <input
            type="text"
            name="titulo"
            placeholder="Título"
            value={nuevaNovedad.titulo}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={nuevaNovedad.descripcion}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <input
            type="number"
            name="prioridad"
            placeholder="Prioridad"
            value={nuevaNovedad.prioridad}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <input
            type="date"
            name="fechaCaducidad"
            placeholder="Fecha de caducidad"
            value={nuevaNovedad.fechaCaducidad}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Agregar Novedad
        </button>
      </form>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Listado de Novedades</h2>
        <ul>
          {novedades.map((novedad) => (
            <li
              key={novedad.id}
              className="mb-4 p-4 bg-white rounded shadow flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-bold">{novedad.titulo}</h3>
                <p className="text-gray-700">{novedad.descripcion}</p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Prioridad:</span> {novedad.prioridad}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Caduca:</span> {novedad.fechaCaducidad}
                </p>
              </div>
              <button
                onClick={() => handleDelete(novedad.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdministracionNovedades;
