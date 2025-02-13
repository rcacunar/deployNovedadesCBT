// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NovedadesList from './components/NovedadesList';
import AdministracionNovedades from './components/AdministracionNovedades';

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', background: '#eee' }}>
        <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem' }}>
          <li><Link to="/">Novedades</Link></li>
          <li><Link to="/admin">Administración</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<NovedadesList />} />
        <Route path="/admin" element={<AdministracionNovedades />} />
      </Routes>
    </Router>
  );
}

export default App;
