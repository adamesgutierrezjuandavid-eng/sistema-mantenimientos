CREATE TABLE IF NOT EXISTS equipos (
  id SERIAL PRIMARY KEY,
  codigo_barras VARCHAR(100) UNIQUE NOT NULL,
  serial VARCHAR(100) UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  ubicacion VARCHAR(150),
  area VARCHAR(150),
  asignacion VARCHAR(150),
  estado VARCHAR(50) DEFAULT 'activo',
  fecha_compra DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipos_codigo_barras ON equipos(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_equipos_serial ON equipos(serial);
