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
  const [editingType, setEditingType] = useState(null);

  // Estado para entidades
  const [entities, setEntities] = useState([]);
  const [newEntity, setNewEntity] = useState({ nombre: '', tipo_id: '' });
  const [editingEntity, setEditingEntity] = useState(null);

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

  const handleEditType = (tipo) => {
    setEditingType(tipo);
  };

  const handleEditTypeChange = (e) => {
    setEditingType({ ...editingType, [e.target.name]: e.target.value });
  };

  const handleUpdateType = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${backendUrl}/tipos_entidades/${editingType.id}`, editingType, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingType(null);
      fetchTypes();
    } catch (error) {
      console.error('Error al actualizar tipo de entidad:', error);
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

  const handleEditEntity = (entidad) => {
    setEditingEntity(entidad);
  };

  const handleEditEntityChange = (e) => {
    setEditingEntity({ ...editingEntity, [e.target.name]: e.target.value });
  };

  const handleUpdateEntity = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${backendUrl}/entidades/${editingEntity.id}`, editingEntity, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingEntity(null);
      fetchEntities();
    } catch (error) {
      console.error('Error al actualizar entidad:', error);
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
                <div>
                  <button
                    onClick={() => handleEditType(tipo)}
                    className="mr-2 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteType(tipo.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal para editar Tipo de Entidad */}
      {editingType && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setEditingType(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setEditingType(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Editar Tipo de Entidad</h2>
            <form onSubmit={handleUpdateType}>
              <div className="mb-4">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nuevo nombre"
                  value={editingType.nombre}
                  onChange={handleEditTypeChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

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
              const tipoEncontrado = types.find(
                (tipo) => Number(tipo.id) === Number(entidad.tipo_id)
              );
              return (
                <li key={entidad.id} className="flex justify-between items-center mb-2">
                  <span>
                    {entidad.nombre} - {tipoEncontrado ? tipoEncontrado.nombre : 'Sin Tipo'}
                  </span>
                  <div>
                    <button
                      onClick={() => handleEditEntity(entidad)}
                      className="mr-2 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteEntity(entidad.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal para editar Entidad */}
      {editingEntity && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setEditingEntity(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setEditingEntity(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Editar Entidad</h2>
            <form onSubmit={handleUpdateEntity}>
              <div className="mb-4">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre de la entidad"
                  value={editingEntity.nombre}
                  onChange={handleEditEntityChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Tipo de Entidad</label>
                <select
                  name="tipo_id"
                  value={editingEntity.tipo_id}
                  onChange={handleEditEntityChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seleccione un tipo</option>
                  {types.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityManagement;
