const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./db');
const { runMigrations } = require('./migrate');
const { detalleError } = require('./utils/http');
const { autenticar } = require('./middleware/auth');
const authRoutes = require('./routes/auth.routes');
const equiposRoutes = require('./routes/equipos.routes');
const mantenimientosRoutes = require('./routes/mantenimientos.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/equipos', autenticar, equiposRoutes);
app.use('/api/mantenimientos', autenticar, mantenimientosRoutes);
app.use('/api/dashboard', autenticar, dashboardRoutes);

app.get('/api/salud', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT current_database()');
    res.json({
      ok: true,
      mensaje: 'Backend funcionando',
      base_datos: resultado.rows[0].current_database
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error conectando a PostgreSQL',
      ...detalleError(error)
    });
  }
});

runMigrations()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error inicializando el servidor (migraciones fallidas):', error.message);
    process.exit(1);
  });
