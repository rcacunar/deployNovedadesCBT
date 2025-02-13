// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NovedadesList from './components/NovedadesList';
import AdministracionNovedades from './components/AdministracionNovedades';

function App() {
  return (
    <Router>
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
          </div>
        </div>
      </nav>
      <div className="container mx-auto mt-6">
        <Routes>
          <Route path="/" element={<NovedadesList />} />
          <Route path="/admin" element={<AdministracionNovedades />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
