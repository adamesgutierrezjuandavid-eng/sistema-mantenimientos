const express = require('express');
const pool = require('../db');
const { validarEquipo } = require('../middleware/validator');
const { eliminarArchivosEvidencia } = require('../utils/evidencias');
const { crearMetaPaginacion, detalleError, normalizarPaginacion } = require('../utils/http');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { texto = '', area = '', estado = '', asignacion = '' } = req.query;
    const { page, limit, offset } = normalizarPaginacion(req.query);

    const filtros = [texto, area, estado, asignacion];
    const totalResultado = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM equipos
       WHERE (
          $1 = ''
          OR codigo_barras ILIKE '%' || $1 || '%'
          OR serial ILIKE '%' || $1 || '%'
          OR nombre ILIKE '%' || $1 || '%'
          OR marca ILIKE '%' || $1 || '%'
          OR empresa ILIKE '%' || $1 || '%'
       )
       AND ($2 = '' OR area ILIKE '%' || $2 || '%')
       AND ($3 = '' OR estado = $3)
       AND ($4 = '' OR asignacion ILIKE '%' || $4 || '%')`,
      filtros
    );

    const resultado = await pool.query(
      `SELECT *
       FROM equipos
       WHERE (
          $1 = ''
          OR codigo_barras ILIKE '%' || $1 || '%'
          OR serial ILIKE '%' || $1 || '%'
          OR nombre ILIKE '%' || $1 || '%'
          OR marca ILIKE '%' || $1 || '%'
          OR empresa ILIKE '%' || $1 || '%'
       )
       AND ($2 = '' OR area ILIKE '%' || $2 || '%')
       AND ($3 = '' OR estado = $3)
       AND ($4 = '' OR asignacion ILIKE '%' || $4 || '%')
       ORDER BY nombre ASC
       LIMIT $5 OFFSET $6`,
      [...filtros, limit, offset]
    );

    res.json({
      ok: true,
      equipos: resultado.rows,
      pagination: crearMetaPaginacion(totalResultado.rows[0].total, page, limit)
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error listando equipos',
      ...detalleError(error)
    });
  }
});

router.get('/buscar/:valor', async (req, res) => {
  try {
    const { valor } = req.params;

    const resultado = await pool.query(
      `SELECT *
       FROM equipos
       WHERE codigo_barras = $1 OR serial = $1
       LIMIT 1`,
      [valor]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Equipo no encontrado'
      });
    }

    res.json({
      ok: true,
      equipo: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error buscando equipo',
      ...detalleError(error)
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT *
       FROM equipos
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Equipo no encontrado'
      });
    }

    res.json({
      ok: true,
      equipo: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error consultando equipo',
      ...detalleError(error)
    });
  }
});

router.get('/:id/mantenimientos', async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT
        m.*,
        COUNT(e.id)::int AS evidencias_count
       FROM mantenimientos m
       LEFT JOIN evidencias_mantenimiento e ON e.mantenimiento_id = m.id
       WHERE m.equipo_id = $1
       GROUP BY m.id
       ORDER BY m.fecha_mantenimiento DESC`,
      [id]
    );

    res.json({
      ok: true,
      mantenimientos: resultado.rows
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error consultando mantenimientos del equipo',
      ...detalleError(error)
    });
  }
});
router.post('/', validarEquipo, async (req, res) => {
  try {
    const {
      codigo_barras,
      serial,
      nombre,
      marca,
      empresa,
      ubicacion,
      area,
      asignacion,
      estado,
      fecha_compra
    } = req.body;

    const resultado = await pool.query(
      `INSERT INTO equipos (
        codigo_barras,
        serial,
        nombre,
        marca,
        empresa,
        ubicacion,
        area,
        asignacion,
        estado,
        fecha_compra
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'activo'), $10)
      RETURNING *`,
      [
        codigo_barras,
        serial,
        nombre,
        marca,
        empresa,
        ubicacion,
        area,
        asignacion,
        estado,
        fecha_compra
      ]
    );

    res.status(201).json({
      ok: true,
      mensaje: 'Equipo registrado correctamente',
      equipo: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error registrando equipo',
      ...detalleError(error)
    });
  }
});

router.put('/:id', validarEquipo, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigo_barras,
      serial,
      nombre,
      marca,
      empresa,
      ubicacion,
      area,
      asignacion,
      estado,
      fecha_compra
    } = req.body;

    const resultado = await pool.query(
      `UPDATE equipos
       SET
        codigo_barras = $1,
        serial = $2,
        nombre = $3,
        marca = $4,
        empresa = $5,
        ubicacion = $6,
        area = $7,
        asignacion = $8,
        estado = $9,
        fecha_compra = $10,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        codigo_barras,
        serial,
        nombre,
        marca,
        empresa,
        ubicacion,
        area,
        asignacion,
        estado,
        fecha_compra,
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Equipo no encontrado'
      });
    }

    res.json({
      ok: true,
      mensaje: 'Equipo actualizado correctamente',
      equipo: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error actualizando equipo',
      ...detalleError(error)
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const evidenciasResultado = await pool.query(
      `SELECT ev.ruta_archivo
       FROM evidencias_mantenimiento ev
       INNER JOIN mantenimientos m ON m.id = ev.mantenimiento_id
       WHERE m.equipo_id = $1`,
      [id]
    );

    const resultado = await pool.query(
      `DELETE FROM equipos
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Equipo no encontrado'
      });
    }

    await eliminarArchivosEvidencia(evidenciasResultado.rows);

    res.json({
      ok: true,
      mensaje: 'Equipo eliminado correctamente',
      equipo: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error eliminando equipo',
      ...detalleError(error)
    });
  }
});

module.exports = router;
