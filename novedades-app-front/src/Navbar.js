// src/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login'); // Redirige al login o a la página que desees
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white font-bold text-2xl">Novedades Central CBT</h1>
        <div>
          <Link to="/" className="text-gray-300 hover:text-white mx-2">
            Novedades
          </Link>
          <Link to="/admin" className="text-gray-300 hover:text-white mx-2">
            Administración
          </Link>
          <Link to="/user-management" className="text-gray-300 hover:text-white mx-2">
            Gestión de Usuarios
          </Link>
          {token ? (
            <button 
              onClick={handleLogout} 
              className="text-gray-300 hover:text-white mx-2"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link to="/login" className="text-gray-300 hover:text-white mx-2">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
