CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  usuario VARCHAR(80) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(30) NOT NULL DEFAULT 'tecnico',
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nombre, usuario, password_hash, rol)
VALUES (
  'Administrador',
  'admin',
  '0db1dea5cd743bb9d8956ee8a9c45db8:5282c13f6f50d5184b5c520721cc04393d9f05bc8be1acfad8041effe5e0cacd62a0ae1b671192d7bc6e3ae18c4617d95d4b75a9a05c104485e48c10def55345',
  'admin'
)
ON CONFLICT (usuario) DO NOTHING;
