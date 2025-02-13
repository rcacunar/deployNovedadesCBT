// src/components/AdministracionNovedades.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Conectar al servidor Socket.IO
const socket = io('http://localhost:3001');

const AdministracionNovedades = () => {
  const [novedades, setNovedades] = useState([]);
  const [nuevaNovedad, setNuevaNovedad] = useState({
    titulo: '',
    descripcion: '',
    prioridad: '',
    fechaCaducidad: ''
  });

  // Obtener las novedades al cargar el componente
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

    // Escuchar eventos en caso de cambios hechos desde otro cliente
    socket.on('novedadAgregada', (novedad) => {
      setNovedades((prev) => [...prev, novedad]);
    });
    socket.on('novedadEliminada', ({ id }) => {
      setNovedades((prev) => prev.filter((novedad) => novedad.id !== parseInt(id)));
    });

    return () => {
      socket.off('novedadAgregada');
      socket.off('novedadEliminada');
    };
  }, []);

  const handleInputChange = (e) => {
    setNuevaNovedad({
      ...nuevaNovedad,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/novedades', nuevaNovedad);
      // No es necesario actualizar el estado manualmente ya que el evento socket se encargará de ello
      setNuevaNovedad({
        titulo: '',
        descripcion: '',
        prioridad: '',
        fechaCaducidad: ''
      });
    } catch (error) {
      console.error('Error al agregar la novedad', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/novedades/${id}`);
      // Tampoco es necesario actualizar el estado manualmente
    } catch (error) {
      console.error('Error al eliminar la novedad', error);
    }
  };

  return (
    <div>
      <h1>Administración de Novedades</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="titulo"
            placeholder="Título"
            value={nuevaNovedad.titulo}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={nuevaNovedad.descripcion}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <input
            type="number"
            name="prioridad"
            placeholder="Prioridad"
            value={nuevaNovedad.prioridad}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <input
            type="date"
            name="fechaCaducidad"
            placeholder="Fecha de caducidad"
            value={nuevaNovedad.fechaCaducidad}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Agregar Novedad</button>
      </form>

      <h2>Listado de Novedades</h2>
      <ul>
        {novedades.map((novedad) => (
          <li key={novedad.id}>
            <strong>{novedad.titulo}</strong> - {novedad.descripcion} (Prioridad: {novedad.prioridad} - Caduca: {novedad.fechaCaducidad})
            <button onClick={() => handleDelete(novedad.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdministracionNovedades;
