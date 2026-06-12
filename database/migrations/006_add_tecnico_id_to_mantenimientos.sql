ALTER TABLE mantenimientos
  ADD COLUMN IF NOT EXISTS tecnico_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_mantenimientos_tecnico_id ON mantenimientos(tecnico_id);
