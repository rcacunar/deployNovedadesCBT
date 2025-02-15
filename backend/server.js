// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'Ip200.10.20.226';
const SALT_ROUNDS = 10;

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

// Middleware para autenticar token JWT
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

// =======================
// Rutas de Gestión de Usuarios
// =======================

// Endpoint POST: Registro de usuario
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  // Validar que se proporcionen ambos campos
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }
  
  try {
    // Hashear la contraseña
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
    if (err.code === '23505') {
      // Violación de UNIQUE en PostgreSQL
      return res.status(400).json({ error: 'El usuario ya existe.' });
    }
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
});

// Endpoint POST: Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }
  
  try {
    const query = `SELECT * FROM cbt.users WHERE username = $1`;
    const result = await pool.query(query, [username]);
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const user = result.rows[0];
    
    // Comparar la contraseña proporcionada con la hasheada almacenada
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // Generar token JWT
    const token = jwt.sign({ username: user.username, id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en login' });
  }
});

// Endpoint GET: Listar usuarios (protegido)
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT id, username
      FROM cbt.users
      ORDER BY id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Endpoint PUT: Actualizar contraseña de un usuario (protegido)
app.put('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Nueva contraseña requerida.' });
  
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const query = `
      UPDATE cbt.users
      SET password = $1
      WHERE id = $2
      RETURNING id, username
    `;
    const result = await pool.query(query, [hashedPassword, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar contraseña:', err);
    res.status(500).json({ error: 'Error al actualizar contraseña.' });
  }
});

// Endpoint DELETE: Eliminar un usuario (protegido)
app.delete('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM cbt.users WHERE id = $1 RETURNING id, username';
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ message: 'Usuario eliminado.', user: result.rows[0] });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
});

// =======================
// Rutas de Novedades
// =======================

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

    io.emit('novedadAgregada', nuevaNovedad);
    res.json(nuevaNovedad);
  } catch (err) {
    console.error('Error al agregar novedad:', err);
    res.status(500).json({ error: 'Error al agregar novedad' });
  }
});

// Endpoint PUT: Editar una novedad (protegido)
app.put('/novedades/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, resumen, descripcion, prioridad, fechaCaducidad } = req.body;

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
    io.emit('novedadEditada', updatedNovedad);
    res.json(updatedNovedad);
  } catch (err) {
    console.error('Error al editar novedad:', err);
    res.status(500).json({ error: 'Error al editar novedad' });
  }
});

// Endpoint DELETE: Eliminar una novedad (protegido)
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
