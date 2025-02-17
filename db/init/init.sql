-- Crear el esquema (si no existe)
CREATE SCHEMA IF NOT EXISTS cbt;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS cbt.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Crear tabla de novedades
CREATE TABLE IF NOT EXISTS cbt.novedades (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  resumen TEXT,
  descripcion TEXT,
  prioridad INTEGER NOT NULL CHECK (prioridad IN (1,2,3)),
  fechaCaducidad DATE NOT NULL
);

-- Crear tabla de tipos de entidad
CREATE TABLE IF NOT EXISTS cbt.tipos_entidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) UNIQUE NOT NULL
);

-- Crear tabla de entidades, con referencia al tipo
CREATE TABLE IF NOT EXISTS cbt.entidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  tipo_id INTEGER NOT NULL REFERENCES cbt.tipos_entidades(id)
);

-- Crear tabla de asociación entre novedades y entidades
CREATE TABLE IF NOT EXISTS cbt.novedades_entidades (
  novedad_id INTEGER REFERENCES cbt.novedades(id) ON DELETE CASCADE,
  entidad_id INTEGER REFERENCES cbt.entidades(id) ON DELETE CASCADE,
  PRIMARY KEY (novedad_id, entidad_id)
);

INSERT INTO cbt.users (username, password)
VALUES ('racunaro', '$2a$10$PrCwyyAxpqhNhD0ujg21nOJBrW.AGZMpGsAPxEIYalCe00Eg14cPe');

