// src/ConfigContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // Cargar el archivo de configuración
    fetch('/config.json')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error('Error loading config:', err));
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {config ? children : <div>Cargando configuración...</div>}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
