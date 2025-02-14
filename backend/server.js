// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');

// Crear la aplicación Express
const app = express();

// Crear un servidor HTTP para integrar Socket.IO
const server = http.createServer(app);

// Configurar Socket.IO
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*', // En producción, especifica los orígenes permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware para CORS y para parsear JSON
app.use(cors());
app.use(express.json());

// Configurar la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',          // Reemplaza con tu usuario de PostgreSQL
  host: 'localhost',         // O la dirección de tu servidor de base de datos
  database: 'cbt_utils',     // Nombre de tu base de datos
  password: 'tefasted1',     // Reemplaza con tu contraseña
  port: 5432,                // Puerto por defecto de PostgreSQL
});

// Endpoint GET: Obtener todas las novedades
app.get('/novedades', async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM cbt.novedades
      ORDER BY prioridad ASC, id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener novedades:', err);
    res.status(500).json({ error: 'Error al obtener novedades' });
  }
});

// Endpoint POST: Agregar una nueva novedad
app.post('/novedades', async (req, res) => {
  const { titulo, resumen, descripcion, prioridad, fechaCaducidad } = req.body;
  
  // Validar que la prioridad sea 1 (Alta), 2 (Media) o 3 (Baja)
  const allowedPriorities = [1, 2, 3];
  if (!allowedPriorities.includes(prioridad)) {
    return res.status(400).json({ error: 'La prioridad debe ser 1 (Alta), 2 (Media) o 3 (Baja).' });
  }

  try {
    const query = `
      INSERT INTO cbt.novedades (titulo, resumen, descripcion, prioridad, fechaCaducidad)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [titulo, resumen, descripcion, prioridad, fechaCaducidad];
    const result = await pool.query(query, values);
    const nuevaNovedad = result.rows[0];

    // Emitir un evento a todos los clientes conectados
    io.emit('novedadAgregada', nuevaNovedad);

    res.json(nuevaNovedad);
  } catch (err) {
    console.error('Error al agregar novedad:', err);
    res.status(500).json({ error: 'Error al agregar novedad' });
  }
});

// Endpoint PUT: Editar una novedad existente
app.put('/novedades/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, resumen, descripcion, prioridad, fechaCaducidad } = req.body;

  // Validar que la prioridad sea 1 (Alta), 2 (Media) o 3 (Baja)
  const allowedPriorities = [1, 2, 3];
  if (!allowedPriorities.includes(prioridad)) {
    return res.status(400).json({ error: 'La prioridad debe ser 1 (Alta), 2 (Media) o 3 (Baja).' });
  }

  try {
    const query = `
      UPDATE cbt.novedades
      SET titulo = $1,
          resumen = $2,
          descripcion = $3,
          prioridad = $4,
          fechaCaducidad = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [titulo, resumen, descripcion, prioridad, fechaCaducidad, id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Novedad no encontrada' });
    }
    const updatedNovedad = result.rows[0];
    // Emitir evento para notificar la actualización
    io.emit('novedadEditada', updatedNovedad);
    res.json(updatedNovedad);
  } catch (err) {
    console.error('Error al editar novedad:', err);
    res.status(500).json({ error: 'Error al editar novedad' });
  }
});

// Endpoint DELETE: Eliminar una novedad por ID
app.delete('/novedades/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM cbt.novedades WHERE id = $1';
    await pool.query(query, [id]);

    // Emitir un evento para notificar la eliminación
    io.emit('novedadEliminada', { id });
    res.json({ message: 'Novedad eliminada' });
  } catch (err) {
    console.error('Error al eliminar novedad:', err);
    res.status(500).json({ error: 'Error al eliminar novedad' });
  }
});

// Iniciar el servidor en el puerto 3002 (o el que definas en la variable de entorno PORT)
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
