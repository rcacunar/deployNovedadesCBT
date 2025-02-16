// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import NovedadesList from './components/NovedadesList';
import AdministracionNovedades from './components/AdministracionNovedades';
import UserManagement from './UserManagement';
import EntityManagement from './EntityManagement';
import PrivateRoute from './PrivateRoute';
import Login from './Login';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto mt-6">
        <Routes>
          <Route path="/" element={<NovedadesList />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdministracionNovedades />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <PrivateRoute>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/entity-management"
            element={
              <PrivateRoute>
                <EntityManagement />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
