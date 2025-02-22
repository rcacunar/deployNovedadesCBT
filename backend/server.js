// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'Ip200.10.20.226';
const SALT_ROUNDS = 10;

const app = express();
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'cbt_utils',
  password: process.env.POSTGRES_PASSWORD || 'tefasted1',
  port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
});

// Middleware de autenticación JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <token>
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// ==========================
// Rutas de Usuarios
// ==========================

// Registro de usuario
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const query = `
      INSERT INTO cbt.users (username, password)
      VALUES ($1, $2)
      RETURNING id, username
    `;
    const values = [username, hashedPassword];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    if (err.code === '23505') return res.status(400).json({ error: 'El usuario ya existe.' });
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
});

// Login de usuario
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  try {
    const query = `SELECT * FROM cbt.users WHERE username = $1`;
    const result = await pool.query(query, [username]);
    if (result.rowCount === 0)
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const token = jwt.sign({ username: user.username, id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en login' });
  }
});

// Listar usuarios (protegido)
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT id, username FROM cbt.users ORDER BY id ASC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Actualizar contraseña de usuario (protegido)
app.put('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Nueva contraseña requerida.' });
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const query = 'UPDATE cbt.users SET password = $1 WHERE id = $2 RETURNING id, username';
    const result = await pool.query(query, [hashedPassword, id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar contraseña:', err);
    res.status(500).json({ error: 'Error al actualizar contraseña.' });
  }
});

// Eliminar usuario (protegido)
app.delete('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM cbt.users WHERE id = $1 RETURNING id, username';
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json({ message: 'Usuario eliminado.', user: result.rows[0] });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
});

// ==========================
// Rutas de Tipos de Entidad
// ==========================

// Listar tipos de entidad
app.get('/tipos_entidades', async (req, res) => {
  try {
    const query = 'SELECT * FROM cbt.tipos_entidades ORDER BY id ASC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener tipos de entidad:', err);
    res.status(500).json({ error: 'Error al obtener tipos de entidad' });
  }
});

// Agregar un nuevo tipo de entidad (protegido)
app.post('/tipos_entidades', authenticateToken, async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
  try {
    const query = 'INSERT INTO cbt.tipos_entidades (nombre) VALUES ($1) RETURNING *';
    const result = await pool.query(query, [nombre]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar tipo de entidad:', err);
    res.status(500).json({ error: 'Error al agregar tipo de entidad' });
  }
});

// Eliminar un tipo de entidad (protegido)
app.delete('/tipos_entidades/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM cbt.tipos_entidades WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Tipo de entidad no encontrado.' });
    res.json({ message: 'Tipo de entidad eliminado.', tipo: result.rows[0] });
  } catch (err) {
    console.error('Error al eliminar tipo de entidad:', err);
    res.status(500).json({ error: 'Error al eliminar tipo de entidad' });
  }
});

// Editar un tipo de entidad (protegido)
app.put('/tipos_entidades/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
  try {
    const query = 'UPDATE cbt.tipos_entidades SET nombre = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [nombre, id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Tipo de entidad no encontrado.' });
    io.emit('tipoEntidadEditado', result.rows[0]); // Si deseas notificar cambios de tipo
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al editar tipo de entidad:', err);
    res.status(500).json({ error: 'Error al editar tipo de entidad' });
  }
});


// ==========================
// Rutas de Entidades
// ==========================

// Endpoint GET: Listar entidades con su tipo
app.get('/entidades', async (req, res) => {
  try {
    const query = `
      SELECT e.id, e.nombre, te.nombre AS tipo
      FROM cbt.entidades e
      LEFT JOIN cbt.tipos_entidades te ON e.tipo_id = te.id
      ORDER BY e.id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener entidades:', err);
    res.status(500).json({ error: 'Error al obtener entidades' });
  }
});


// Agregar entidad (protegido)
// Ahora espera { nombre, tipo_id } en el body
app.post('/entidades', authenticateToken, async (req, res) => {
  const { nombre, tipo_id } = req.body;
  if (!nombre || !tipo_id)
    return res.status(400).json({ error: 'Nombre y tipo_id son requeridos.' });
  try {
    const query = 'INSERT INTO cbt.entidades (nombre, tipo_id) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [nombre, tipo_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar entidad:', err);
    res.status(500).json({ error: 'Error al agregar entidad' });
  }
});

// Editar una entidad (protegido)
app.put('/entidades/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo_id } = req.body;
  if (!nombre || !tipo_id)
    return res.status(400).json({ error: 'El nombre y tipo_id son requeridos.' });
  try {
    const query = 'UPDATE cbt.entidades SET nombre = $1, tipo_id = $2 WHERE id = $3 RETURNING *';
    const result = await pool.query(query, [nombre, tipo_id, id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Entidad no encontrada.' });
    io.emit('entidadEditada', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al editar entidad:', err);
    res.status(500).json({ error: 'Error al editar entidad' });
  }
});


// Eliminar entidad (protegido)
app.delete('/entidades/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM cbt.entidades WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Entidad no encontrada.' });
    res.json({ message: 'Entidad eliminada', entidad: result.rows[0] });
  } catch (err) {
    console.error('Error al eliminar entidad:', err);
    res.status(500).json({ error: 'Error al eliminar entidad' });
  }
});

// ==========================
// Rutas de Novedades
// ==========================

// Obtener todas las novedades junto con las entidades asociadas
app.get('/novedades', async (req, res) => {
  try {
    const query = `
      SELECT n.*,
        COALESCE(json_agg(ne.entidad_id) FILTER (WHERE ne.entidad_id IS NOT NULL), '[]') AS entidad_ids
      FROM cbt.novedades n
      LEFT JOIN cbt.novedades_entidades ne ON n.id = ne.novedad_id
      GROUP BY n.id
      ORDER BY n.prioridad ASC, n.id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener novedades:', err);
    res.status(500).json({ error: 'Error al obtener novedades' });
  }
});

// Agregar una nueva novedad (opcional: no protegida)
app.post('/novedades', async (req, res) => {
  const { titulo, resumen, descripcion, prioridad, fechaCaducidad, entidad_ids } = req.body;
  const allowedPriorities = [1, 2, 3];
  if (!allowedPriorities.includes(prioridad))
    return res.status(400).json({ error: 'La prioridad debe ser 1, 2 o 3.' });
  try {
    const query = `
      INSERT INTO cbt.novedades (titulo, resumen, descripcion, prioridad, fechaCaducidad)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [titulo, resumen, descripcion, prioridad, fechaCaducidad];
    const result = await pool.query(query, values);
    const nuevaNovedad = result.rows[0];
    if (entidad_ids && Array.isArray(entidad_ids)) {
      for (const entidadId of entidad_ids) {
        await pool.query(
          'INSERT INTO cbt.novedades_entidades (novedad_id, entidad_id) VALUES ($1, $2)',
          [nuevaNovedad.id, entidadId]
        );
      }
    }
    io.emit('novedadAgregada', nuevaNovedad);
    res.json(nuevaNovedad);
  } catch (err) {
    console.error('Error al agregar novedad:', err);
    res.status(500).json({ error: 'Error al agregar novedad' });
  }
});

// Editar una novedad (protegido)
app.put('/novedades/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, resumen, descripcion, prioridad, fechaCaducidad, entidad_ids } = req.body;
  const allowedPriorities = [1, 2, 3];
  if (!allowedPriorities.includes(prioridad))
    return res.status(400).json({ error: 'La prioridad debe ser 1, 2 o 3.' });
  try {
    // Actualizar los datos básicos
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
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Novedad no encontrada' });
    // Actualizar asociaciones: primero borrar las existentes y luego insertarlas
    await pool.query('DELETE FROM cbt.novedades_entidades WHERE novedad_id = $1', [id]);
    if (entidad_ids && Array.isArray(entidad_ids)) {
      for (const entidadId of entidad_ids) {
        await pool.query(
          'INSERT INTO cbt.novedades_entidades (novedad_id, entidad_id) VALUES ($1, $2)',
          [id, entidadId]
        );
      }
    }
    // Volver a consultar la novedad completa (incluyendo asociaciones)
    const completeQuery = `
      SELECT n.*,
        COALESCE(json_agg(ne.entidad_id) FILTER (WHERE ne.entidad_id IS NOT NULL), '[]') AS entidad_ids
      FROM cbt.novedades n
      LEFT JOIN cbt.novedades_entidades ne ON n.id = ne.novedad_id
      WHERE n.id = $1
      GROUP BY n.id
    `;
    const completeResult = await pool.query(completeQuery, [id]);
    const updatedNovedad = completeResult.rows[0];

    io.emit('novedadEditada', updatedNovedad);
    res.json(updatedNovedad);
  } catch (err) {
    console.error('Error al editar novedad:', err);
    res.status(500).json({ error: 'Error al editar novedad' });
  }
});


// Eliminar una novedad (protegido)
app.delete('/novedades/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM cbt.novedades WHERE id = $1';
    await pool.query(query, [id]);
    io.emit('novedadEliminada', { id });
    res.json({ message: 'Novedad eliminada' });
  } catch (err) {
    console.error('Error al eliminar novedad:', err);
    res.status(500).json({ error: 'Error al eliminar novedad' });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
