// src/EntityManagement.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useConfig } from './ConfigContext';

const EntityManagement = () => {
  const config = useConfig();
  const backendUrl = config ? config.REACT_APP_BACKEND_URL : "";

  // Estado para tipos de entidad
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState({ nombre: '' });

  // Estado para entidades
  const [entities, setEntities] = useState([]);
  const [newEntity, setNewEntity] = useState({ nombre: '', tipo_id: '' });

  // Función para obtener tipos de entidad
  const fetchTypes = async () => {
    try {
      const response = await axios.get(`${backendUrl}/tipos_entidades`);
      setTypes(response.data);
    } catch (error) {
      console.error('Error al obtener tipos de entidad:', error);
    }
  };

  // Función para obtener entidades
  const fetchEntities = async () => {
    try {
      const response = await axios.get(`${backendUrl}/entidades`);
      setEntities(response.data);
    } catch (error) {
      console.error('Error al obtener entidades:', error);
    }
  };

  useEffect(() => {
    if (backendUrl) {
      fetchTypes();
      fetchEntities();
    }
  }, [backendUrl]);

  // Handlers para tipos de entidad
  const handleNewTypeChange = (e) => {
    setNewType({ ...newType, [e.target.name]: e.target.value });
  };

  const handleAddType = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${backendUrl}/tipos_entidades`, newType, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewType({ nombre: '' });
      fetchTypes();
    } catch (error) {
      console.error('Error al agregar tipo de entidad:', error);
    }
  };

  const handleDeleteType = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/tipos_entidades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTypes();
    } catch (error) {
      console.error('Error al eliminar tipo de entidad:', error);
    }
  };

  // Handlers para entidades
  const handleNewEntityChange = (e) => {
    setNewEntity({ ...newEntity, [e.target.name]: e.target.value });
  };

  const handleAddEntity = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${backendUrl}/entidades`, newEntity, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewEntity({ nombre: '', tipo_id: '' });
      fetchEntities();
    } catch (error) {
      console.error('Error al agregar entidad:', error);
    }
  };

  const handleDeleteEntity = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/entidades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEntities();
    } catch (error) {
      console.error('Error al eliminar entidad:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Entidades y Tipos</h1>

      {/* Sección para gestionar tipos de entidad */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Gestión de Tipos de Entidad</h2>
        <form onSubmit={handleAddType} className="mb-4">
          <div className="mb-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del tipo de entidad"
              value={newType.nombre}
              onChange={handleNewTypeChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Agregar Tipo
          </button>
        </form>
        <h3 className="text-xl font-semibold mb-2">Tipos Registrados</h3>
        {types.length === 0 ? (
          <p>No hay tipos registrados.</p>
        ) : (
          <ul>
            {types.map((tipo) => (
              <li key={tipo.id} className="flex justify-between items-center mb-2">
                <span>{tipo.nombre}</span>
                <button
                  onClick={() => handleDeleteType(tipo.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sección para gestionar entidades */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Gestión de Entidades</h2>
        <form onSubmit={handleAddEntity} className="mb-4">
          <div className="mb-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre de la entidad"
              value={newEntity.nombre}
              onChange={handleNewEntityChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Tipo de Entidad</label>
            <select
              name="tipo_id"
              value={newEntity.tipo_id}
              onChange={handleNewEntityChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Seleccione un tipo</option>
              {types.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Agregar Entidad
          </button>
        </form>
        <h3 className="text-xl font-semibold mb-2">Entidades Registradas</h3>
        {entities.length === 0 ? (
          <p>No hay entidades registradas.</p>
        ) : (
          <ul>
            {entities.map((entidad) => {
              // Asegurarse de que types esté cargado para buscar el nombre del tipo
              const tipoEncontrado = types.length > 0 ? types.find(
                (tipo) => Number(tipo.id) === Number(entidad.tipo_id)
              ) : null;
              return (
                <li key={entidad.id} className="flex justify-between items-center mb-2">
                  <span>
                    {entidad.nombre} - {tipoEncontrado ? tipoEncontrado.nombre : 'Sin Tipo'}
                  </span>
                  <button
                    onClick={() => handleDeleteEntity(entidad.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EntityManagement;
