// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');

// Crear la aplicación Express
const app = express();
app.use(cors());
app.use(express.json());

// Crear el servidor HTTP (necesario para Socket.IO)
const server = http.createServer(app);

// Configurar Socket.IO
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*'  // En producción, especifica el dominio del frontend
  }
});

// Configurar la conexión a PostgreSQL (ajusta según tu configuración)
const pool = new Pool({
  user: 'tu_usuario',          // por ejemplo: 'postgres'
  host: 'localhost',
  database: 'novedadesdb',
  password: 'tu_password',     // tu contraseña
  port: 5432,
});

// Notificar conexión de nuevos clientes
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Endpoint para obtener las novedades activas (no caducadas) y ordenadas por prioridad
app.get('/novedades', async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM novedades
      WHERE fechaCaducidad >= CURRENT_DATE
      ORDER BY prioridad ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener las novedades:', err);
    res.status(500).json({ error: 'Error al obtener las novedades' });
  }
});

// Endpoint para agregar una novedad
app.post('/novedades', async (req, res) => {
  const { titulo, descripcion, prioridad, fechaCaducidad } = req.body;
  try {
    const query = `
      INSERT INTO novedades (titulo, descripcion, prioridad, fechaCaducidad)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [titulo, descripcion, prioridad, fechaCaducidad];
    const result = await pool.query(query, values);
    const nuevaNovedad = result.rows[0];

    // Emitir un evento a todos los clientes: se ha agregado una novedad
    io.emit('novedadAgregada', nuevaNovedad);
    res.json(nuevaNovedad);
  } catch (err) {
    console.error('Error al agregar la novedad:', err);
    res.status(500).json({ error: 'Error al agregar la novedad' });
  }
});

// Endpoint para eliminar una novedad
app.delete('/novedades/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const query = 'DELETE FROM novedades WHERE id = $1';
    await pool.query(query, [id]);

    // Emitir un evento a todos los clientes: se ha eliminado la novedad
    io.emit('novedadEliminada', { id });
    res.json({ message: 'Novedad eliminada' });
  } catch (err) {
    console.error('Error al eliminar la novedad:', err);
    res.status(500).json({ error: 'Error al eliminar la novedad' });
  }
});

// Iniciar el servidor en el puerto 3001
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
