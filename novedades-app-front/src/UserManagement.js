// src/UserManagement.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [editPassword, setEditPassword] = useState('');

  // Función para obtener usuarios, enviando el token en el header
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Manejo de cambios en el formulario para agregar usuario
  const handleNewUserChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Agregar nuevo usuario
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3002/register', newUser);
      setNewUser({ username: '', password: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error al agregar usuario:', error);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3002/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  // Abrir modal de edición para cambiar contraseña
  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditPassword(''); // inicializamos la contraseña en vacío
  };

  // Manejar cambios en el input del modal de edición
  const handleEditPasswordChange = (e) => {
    setEditPassword(e.target.value);
  };

  // Enviar actualización de contraseña
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3002/users/${editingUser.id}`,
        { password: editPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingUser(null);
      setEditPassword('');
      fetchUsers();
    } catch (error) {
      console.error('Error al editar contraseña:', error);
    }
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditPassword('');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Gestión de Usuarios</h1>
      
      {/* Formulario para agregar un nuevo usuario */}
      <form
        onSubmit={handleAddUser}
        className="max-w-md mx-auto bg-white p-4 rounded shadow mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Agregar Usuario</h2>
        <div className="mb-4">
          <input
            type="text"
            name="username"
            placeholder="Nombre de usuario"
            value={newUser.username}
            onChange={handleNewUserChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={newUser.password}
            onChange={handleNewUserChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Agregar Usuario
        </button>
      </form>

      {/* Listado de usuarios */}
      <div className="max-w-4xl mx-auto bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Usuarios Registrados</h2>
        {users.length === 0 ? (
          <p>No hay usuarios registrados.</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Usuario</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border px-4 py-2">{user.id}</td>
                  <td className="border px-4 py-2">{user.username}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="mr-2 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                    >
                      Editar Contraseña
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para editar contraseña */}
      {editingUser && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={closeEditModal}
        >
          <div 
            className="bg-white p-6 rounded shadow-lg max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={closeEditModal}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Editar Contraseña</h2>
            <p className="mb-4">
              Usuario: <span className="font-semibold">{editingUser.username}</span>
            </p>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <input 
                  type="password"
                  name="password"
                  placeholder="Nueva contraseña"
                  value={editPassword}
                  onChange={handleEditPasswordChange}
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
    </div>
  );
};

export default UserManagement;
