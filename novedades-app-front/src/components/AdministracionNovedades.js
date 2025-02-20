// src/components/AdministracionNovedades.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useConfig } from '../ConfigContext';

const AdministracionNovedades = () => {
  const config = useConfig();
  const backendUrl = config ? config.REACT_APP_BACKEND_URL : "";

  const [nuevaNovedad, setNuevaNovedad] = useState({
    titulo: '',
    resumen: '',
    descripcion: '',
    prioridad: '1',
    fechaCaducidad: '',
    entidad_ids: []
  });
  const [novedades, setNovedades] = useState([]);
  const [editingNovedad, setEditingNovedad] = useState(null);
  const [entidadesDisponibles, setEntidadesDisponibles] = useState([]);
  const [socket, setSocket] = useState(null);

  // Función para obtener novedades usando backendUrl
  const fetchNovedades = async () => {
    try {
      const response = await axios.get(`${backendUrl}/novedades`);
      setNovedades(response.data);
    } catch (error) {
      console.error('Error al obtener novedades:', error);
    }
  };

  // Función para obtener entidades usando backendUrl
  const fetchEntidades = async () => {
    try {
      const response = await axios.get(`${backendUrl}/entidades`);
      setEntidadesDisponibles(response.data);
    } catch (error) {
      console.error('Error al obtener entidades:', error);
    }
  };

  // Efecto para cargar datos cuando backendUrl esté disponible
  useEffect(() => {
    if (backendUrl) {
      fetchNovedades();
      fetchEntidades();
    }
  }, [backendUrl]);

  // Inicializar el socket dentro de useEffect para adaptarse a cambios en backendUrl
  useEffect(() => {
    if (backendUrl) {
      const s = io(backendUrl);
      setSocket(s);

      s.on('novedadAgregada', (novedad) => {
        setNovedades((prev) => [...prev, novedad]);
      });
      s.on('novedadEliminada', ({ id }) => {
        setNovedades((prev) => prev.filter((nov) => nov.id !== parseInt(id)));
      });

      return () => {
        s.off('novedadAgregada');
        s.off('novedadEliminada');
        s.disconnect();
      };
    }
  }, [backendUrl]);

  const handleInputChange = (e) => {
    setNuevaNovedad({ ...nuevaNovedad, [e.target.name]: e.target.value });
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setNuevaNovedad({ ...nuevaNovedad, descripcion: data });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const novedadParaEnviar = {
        ...nuevaNovedad,
        prioridad: parseInt(nuevaNovedad.prioridad)
      };
      await axios.post(`${backendUrl}/novedades`, novedadParaEnviar);
      setNuevaNovedad({
        titulo: '',
        resumen: '',
        descripcion: '',
        prioridad: '1',
        fechaCaducidad: '',
        entidad_ids: []
      });
      fetchNovedades();
    } catch (error) {
      console.error('Error al agregar novedad:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/novedades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNovedades();
    } catch (error) {
      console.error('Error al eliminar novedad:', error);
    }
  };

  // Convierte la fecha al formato "YYYY-MM-DD" para el input type="date"
  const formatForInputDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleEditClick = (novedad) => {
    setEditingNovedad({
      ...novedad,
      prioridad: String(novedad.prioridad),
      fechaCaducidad: formatForInputDate(novedad.fechacaducidad),
      entidad_ids: novedad.entidad_ids ? novedad.entidad_ids.map(String) : []
    });
  };

  const handleEditInputChange = (e) => {
    setEditingNovedad({ ...editingNovedad, [e.target.name]: e.target.value });
  };

  const handleEditEditorChange = (event, editor) => {
    const data = editor.getData();
    setEditingNovedad({ ...editingNovedad, descripcion: data });
  };

  const handleEntidadSelectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    if (editingNovedad) {
      setEditingNovedad({ ...editingNovedad, entidad_ids: selected });
    } else {
      setNuevaNovedad({ ...nuevaNovedad, entidad_ids: selected });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedNovedad = {
        ...editingNovedad,
        prioridad: parseInt(editingNovedad.prioridad)
      };
      const token = localStorage.getItem('token');
      await axios.put(`${backendUrl}/novedades/${editingNovedad.id}`, updatedNovedad, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNovedades();
      setEditingNovedad(null);
    } catch (error) {
      console.error('Error al editar novedad:', error);
    }
  };

  const closeEditModal = () => {
    setEditingNovedad(null);
  };

  // Filtrar novedades caducadas: mostrar solo las que tienen fechaCaducidad >= hoy
  const today = new Date();
  const novedadesValidas = novedades.filter(
    (novedad) => new Date(novedad.fechacaducidad) >= today
  );

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


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Administración de Novedades</h1>

      {/* Formulario para agregar una nueva novedad */}
      <form onSubmit={handleSubmit} className="w-full p-4 bg-white rounded shadow mb-8">
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
            name="resumen"
            placeholder="Resumen"
            value={nuevaNovedad.resumen}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <CKEditor
            editor={ClassicEditor}
            data={nuevaNovedad.descripcion}
            onChange={handleEditorChange}
            config={{ licenseKey: 'GPL' }}
          />
        </div>
        <div className="mb-4">
        <label className="block mb-1">Prioridad</label>
          <select
            name="prioridad"
            value={nuevaNovedad.prioridad}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="1">Alta</option>
            <option value="2">Media</option>
            <option value="3">Baja</option>
          </select>
        </div>
        <div className="mb-4">
        <label className="block mb-1">Fecha Caducidad</label>
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
        {/* Campo multi-select para asociar entidades */}
        <div className="mb-4">
          <label className="block mb-1">Entidades Asociadas</label>
          <select
            name="entidad_ids"
            multiple
            value={nuevaNovedad.entidad_ids}
            onChange={handleEntidadSelectChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            {entidadesDisponibles.map((entidad) => (
              <option key={entidad.id} value={entidad.id}>
                {entidad.nombre} ({entidad.tipo})
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Agregar Novedad
        </button>
      </form>

      {/* Listado de novedades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {novedadesValidas.map((novedad) => (
          <div
            key={novedad.id}
            className={`cursor-pointer shadow rounded-lg p-4 border ${getPriorityClasses(novedad.prioridad)}`}
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
                  const entidad = entidadesDisponibles.find(e => e.id === Number(entId));
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
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleEditClick(novedad)}
                className="mr-2 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(novedad.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {editingNovedad && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={closeEditModal}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={closeEditModal}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Editar Novedad</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  name="titulo"
                  placeholder="Título"
                  value={editingNovedad.titulo}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <textarea
                  name="resumen"
                  placeholder="Resumen"
                  value={editingNovedad.resumen}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <CKEditor
                  editor={ClassicEditor}
                  data={editingNovedad.descripcion}
                  onChange={handleEditEditorChange}
                  config={{ licenseKey: 'GPL' }}
                />
              </div>
              <div className="mb-4">
                <select
                  name="prioridad"
                  value={editingNovedad.prioridad}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="1">Alta</option>
                  <option value="2">Media</option>
                  <option value="3">Baja</option>
                </select>
              </div>
              <div className="mb-4">
                <input
                  type="date"
                  name="fechaCaducidad"
                  placeholder="Fecha de caducidad"
                  value={editingNovedad.fechaCaducidad}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              {/* Campo multi-select para editar entidades asociadas */}
              <div className="mb-4">
                <label className="block mb-1">Entidades Asociadas</label>
                <select
                  name="entidad_ids"
                  multiple
                  value={editingNovedad.entidad_ids || []}
                  onChange={handleEntidadSelectChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  {entidadesDisponibles.map((entidad) => (
                    <option key={entidad.id} value={entidad.id}>
                      {entidad.nombre} ({entidad.tipo})
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

export default AdministracionNovedades;
