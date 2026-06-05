const express = require('express');
const pool = require('../db');
const { detalleError } = require('../utils/http');

const router = express.Router();

router.get('/resumen', async (_req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM equipos) AS total_equipos,
        (SELECT COUNT(*)::int FROM mantenimientos) AS total_mantenimientos,
        (
          SELECT COUNT(*)::int
          FROM mantenimientos
          WHERE estado IN ('pendiente', 'en proceso')
        ) AS mantenimientos_pendientes,
        (
          SELECT COUNT(*)::int
          FROM mantenimientos
          WHERE proxima_fecha IS NOT NULL
            AND proxima_fecha <= CURRENT_DATE + INTERVAL '7 days'
        ) AS proximos_mantenimientos
    `);

    res.json({
      ok: true,
      resumen: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error consultando resumen',
      ...detalleError(error)
    });
  }
});

module.exports = router;
