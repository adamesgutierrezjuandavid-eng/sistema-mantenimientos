CREATE TABLE IF NOT EXISTS mantenimientos (
  id SERIAL PRIMARY KEY,
  equipo_id INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  fecha_mantenimiento DATE NOT NULL,
  tipo_mantenimiento VARCHAR(80) NOT NULL,
  tecnico VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
  observaciones TEXT,
  estado VARCHAR(50) DEFAULT 'terminado',
  proxima_fecha DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mantenimientos_equipo_id ON mantenimientos(equipo_id);
