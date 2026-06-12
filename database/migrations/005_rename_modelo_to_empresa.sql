DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipos' AND column_name = 'modelo'
  ) THEN
    ALTER TABLE equipos RENAME COLUMN modelo TO empresa;
  END IF;
END$$;
