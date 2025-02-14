// src/components/AdministracionNovedades.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const socket = io('http://localhost:3002');

const AdministracionNovedades = () => {
  const [novedades, setNovedades] = useState([]);
  const [nuevaNovedad, setNuevaNovedad] = useState({
    titulo: '',
    resumen: '',
    descripcion: '', // Se usará CKEditor para este campo
    prioridad: '1',  // Valor por defecto: Alta
    fechaCaducidad: '',
  });

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

  const handleInputChange = (e) => {
    setNuevaNovedad({
      ...nuevaNovedad,
      [e.target.name]: e.target.value,
    });
  };

  // Actualiza el contenido enriquecido desde CKEditor
  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setNuevaNovedad({
      ...nuevaNovedad,
      descripcion: data,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertir la prioridad a número antes de enviarla
      const novedadParaEnviar = {
        ...nuevaNovedad,
        prioridad: parseInt(nuevaNovedad.prioridad),
      };
      await axios.post('http://localhost:3002/novedades', novedadParaEnviar);
      // Reinicia el formulario
      setNuevaNovedad({
        titulo: '',
        resumen: '',
        descripcion: '',
        prioridad: '1',
        fechaCaducidad: '',
      });
    } catch (error) {
      console.error('Error al agregar la novedad:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/novedades/${id}`);
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
        {/* Campo Resumen */}
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
        {/* Campo Descripción con CKEditor */}
        <div className="mb-4">
          <CKEditor
            editor={ClassicEditor}
            data={nuevaNovedad.descripcion}
            onChange={handleEditorChange}
            config={{
              licenseKey: 'GPL',
              placeholder: 'Escribe la descripción enriquecida...',
            }}
          />
        </div>
        {/* Campo Select para Prioridad */}
        <div className="mb-4">
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

      {/* Listado de novedades (opcional) */}
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
                <p className="text-gray-700">{novedad.resumen}</p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Prioridad:</span>{' '}
                  {novedad.prioridad === 1
                    ? 'Alta'
                    : novedad.prioridad === 2
                    ? 'Media'
                    : 'Baja'}
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
