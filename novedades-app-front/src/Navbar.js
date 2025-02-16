// src/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-bold text-2xl">Novedades Central CBT</h1>
        {/* Menú de escritorio */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-gray-300 hover:text-white">Novedades</Link>
          {token ? (
            <>
              <Link to="/admin" className="text-gray-300 hover:text-white">Administración</Link>
              <Link to="/user-management" className="text-gray-300 hover:text-white">Gestión de Usuarios</Link>
              <Link to="/entity-management" className="text-gray-300 hover:text-white">Gestión de Entidades</Link>
              <button onClick={handleLogout} className="text-gray-300 hover:text-white">Cerrar sesión</button>
            </>
          ) : (
            <Link to="/login" className="text-gray-300 hover:text-white">Iniciar sesión</Link>
          )}
        </div>
        {/* Botón para móvil */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} type="button" className="text-gray-300 hover:text-white focus:outline-none">
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              {menuOpen ? (
                <path fillRule="evenodd" clipRule="evenodd" d="M18.3 5.71a1 1 0 00-1.42-1.42L12 9.17 7.12 4.29A1 1 0 105.7 5.71L10.59 10.6 5.7 15.49a1 1 0 101.42 1.42L12 12.83l4.88 4.88a1 1 0 001.42-1.42l-4.89-4.88 4.89-4.88z" />
              ) : (
                <path fillRule="evenodd" d="M4 5h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4">
          <Link onClick={() => setMenuOpen(false)} to="/" className="block text-gray-300 hover:text-white py-1">Novedades</Link>
          {token ? (
            <>
              <Link onClick={() => setMenuOpen(false)} to="/admin" className="block text-gray-300 hover:text-white py-1">Administración</Link>
              <Link onClick={() => setMenuOpen(false)} to="/user-management" className="block text-gray-300 hover:text-white py-1">Gestión de Usuarios</Link>
              <Link onClick={() => setMenuOpen(false)} to="/entity-management" className="block text-gray-300 hover:text-white py-1">Gestión de Entidades</Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="block text-gray-300 hover:text-white py-1"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link onClick={() => setMenuOpen(false)} to="/login" className="block text-gray-300 hover:text-white py-1">Iniciar sesión</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
