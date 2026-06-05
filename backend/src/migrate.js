const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('[MIGRATION] Iniciando ejecucion de migraciones...');

    // 1. Crear tabla de log si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Leer archivos en el directorio de migraciones
    const migrationsDir = path.join(__dirname, '..', '..', 'database', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.warn(`[MIGRATION] El directorio de migraciones no existe: ${migrationsDir}`);
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Asegurar orden alfabetico/secuencial (001, 002, 003...)

    // 3. Obtener migraciones ya aplicadas
    const { rows } = await client.query('SELECT name FROM migrations_log');
    const appliedMigrations = new Set(rows.map(r => r.name));

    // 4. Ejecutar las pendientes en una transaccion
    for (const file of files) {
      if (!appliedMigrations.has(file)) {
        console.log(`[MIGRATION] Aplicando migracion: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        await client.query('BEGIN');
        try {
          // Ejecutar el script SQL de la migracion
          await client.query(sql);
          
          // Registrar en el log de migraciones
          await client.query('INSERT INTO migrations_log (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`[MIGRATION] Migracion ${file} aplicada correctamente.`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[MIGRATION] Error aplicando migracion ${file}. Transaccion revertida.`);
          throw err;
        }
      }
    }

    console.log('[MIGRATION] Todas las migraciones estan al dia.');
  } catch (error) {
    console.error('[MIGRATION] Error durante la ejecucion de migraciones:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Permitir ejecutar directamente desde terminal: node src/migrate.js
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('[MIGRATION] Script de migraciones terminado.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[MIGRATION] Fallo al ejecutar migraciones:', err.message);
      process.exit(1);
    });
}

module.exports = { runMigrations };
