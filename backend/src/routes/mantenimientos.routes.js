const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { validarMantenimiento } = require('../middleware/validator');
const { eliminarArchivosEvidencia } = require('../utils/evidencias');
const { crearMetaPaginacion, detalleError, normalizarPaginacion } = require('../utils/http');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'evidencias');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9-_]/g, '-');
    cb(null, `${Date.now()}-${baseName}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imagenes'));
    }

    cb(null, true);
  }
});

router.get('/', async (req, res) => {
  try {
    const {
      fecha_inicio = '',
      fecha_fin = '',
      tecnico = '',
      estado = '',
      tipo = ''
    } = req.query;
    const { page, limit, offset } = normalizarPaginacion(req.query);
    const filtros = [fecha_inicio, fecha_fin, tecnico, estado, tipo];

    const totalResultado = await pool.query(
      `SELECT COUNT(DISTINCT m.id)::int AS total
       FROM mantenimientos m
       INNER JOIN equipos e ON e.id = m.equipo_id
       WHERE ($1 = '' OR m.fecha_mantenimiento >= $1::date)
       AND ($2 = '' OR m.fecha_mantenimiento <= $2::date)
       AND ($3 = '' OR m.tecnico ILIKE '%' || $3 || '%')
       AND ($4 = '' OR m.estado = $4)
       AND ($5 = '' OR m.tipo_mantenimiento = $5)`,
      filtros
    );

    const resultado = await pool.query(
      `SELECT
        m.*,
        e.nombre AS equipo,
        e.codigo_barras,
        e.serial,
        e.area,
        e.asignacion,
        COUNT(ev.id)::int AS evidencias_count
       FROM mantenimientos m
       INNER JOIN equipos e ON e.id = m.equipo_id
       LEFT JOIN evidencias_mantenimiento ev ON ev.mantenimiento_id = m.id
       WHERE ($1 = '' OR m.fecha_mantenimiento >= $1::date)
       AND ($2 = '' OR m.fecha_mantenimiento <= $2::date)
       AND ($3 = '' OR m.tecnico ILIKE '%' || $3 || '%')
       AND ($4 = '' OR m.estado = $4)
       AND ($5 = '' OR m.tipo_mantenimiento = $5)
       GROUP BY m.id, e.nombre, e.codigo_barras, e.serial, e.area, e.asignacion
       ORDER BY m.fecha_mantenimiento DESC
       LIMIT $6 OFFSET $7`,
      [...filtros, limit, offset]
    );

    res.json({
      ok: true,
      mantenimientos: resultado.rows,
      pagination: crearMetaPaginacion(totalResultado.rows[0].total, page, limit)
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error listando mantenimientos',
      ...detalleError(error)
    });
  }
});

router.post('/', validarMantenimiento, async (req, res) => {
  try {
    const {
      equipo_id,
      fecha_mantenimiento,
      tipo_mantenimiento,
      tecnico,
      descripcion,
      observaciones,
      estado,
      proxima_fecha
    } = req.body;

    const resultado = await pool.query(
      `INSERT INTO mantenimientos (
        equipo_id,
        fecha_mantenimiento,
        tipo_mantenimiento,
        tecnico,
        descripcion,
        observaciones,
        estado,
        proxima_fecha
      )
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'terminado'), $8)
      RETURNING *`,
      [
        equipo_id,
        fecha_mantenimiento,
        tipo_mantenimiento,
        tecnico,
        descripcion,
        observaciones,
        estado,
        proxima_fecha
      ]
    );

    res.status(201).json({
      ok: true,
      mensaje: 'Mantenimiento registrado correctamente',
      mantenimiento: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error registrando mantenimiento',
      ...detalleError(error)
    });
  }
});

router.get('/:id/evidencias', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      `SELECT *
       FROM evidencias_mantenimiento
       WHERE mantenimiento_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      ok: true,
      evidencias: resultado.rows
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error consultando evidencias',
      ...detalleError(error)
    });
  }
});

router.post('/:id/evidencias', upload.array('fotos', 5), async (req, res) => {
  const archivos = req.files || [];

  try {
    const { id } = req.params;

    if (archivos.length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe subir al menos una foto'
      });
    }

    const mantenimiento = await pool.query(
      'SELECT id FROM mantenimientos WHERE id = $1 LIMIT 1',
      [id]
    );

    if (mantenimiento.rows.length === 0) {
      await eliminarArchivosEvidencia(
        archivos.map((archivo) => ({ ruta_archivo: `/uploads/evidencias/${archivo.filename}` }))
      );

      return res.status(404).json({
        ok: false,
        mensaje: 'Mantenimiento no encontrado'
      });
    }

    const evidencias = [];
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const archivo of archivos) {
        const rutaArchivo = `/uploads/evidencias/${archivo.filename}`;
        const resultado = await client.query(
          `INSERT INTO evidencias_mantenimiento (
            mantenimiento_id,
            nombre_archivo,
            ruta_archivo,
            tipo_archivo
          )
          VALUES ($1, $2, $3, $4)
          RETURNING *`,
          [id, archivo.originalname, rutaArchivo, archivo.mimetype]
        );

        evidencias.push(resultado.rows[0]);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    res.status(201).json({
      ok: true,
      mensaje: 'Evidencias subidas correctamente',
      evidencias
    });
  } catch (error) {
    await eliminarArchivosEvidencia(
      archivos.map((archivo) => ({ ruta_archivo: `/uploads/evidencias/${archivo.filename}` }))
    );

    res.status(500).json({
      ok: false,
      mensaje: 'Error subiendo evidencias',
      ...detalleError(error)
    });
  }
});

router.delete('/evidencias/:evidenciaId', async (req, res) => {
  try {
    const { evidenciaId } = req.params;

    const resultado = await pool.query(
      `DELETE FROM evidencias_mantenimiento
       WHERE id = $1
       RETURNING *`,
      [evidenciaId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Evidencia no encontrada'
      });
    }

    const evidencia = resultado.rows[0];
    await eliminarArchivosEvidencia([evidencia]);

    res.json({
      ok: true,
      mensaje: 'Evidencia eliminada correctamente',
      evidencia
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error eliminando evidencia',
      ...detalleError(error)
    });
  }
});

router.put('/:id', validarMantenimiento, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fecha_mantenimiento,
      tipo_mantenimiento,
      tecnico,
      descripcion,
      observaciones,
      estado,
      proxima_fecha
    } = req.body;

    const resultado = await pool.query(
      `UPDATE mantenimientos
       SET
        fecha_mantenimiento = $1,
        tipo_mantenimiento = $2,
        tecnico = $3,
        descripcion = $4,
        observaciones = $5,
        estado = $6,
        proxima_fecha = $7,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        fecha_mantenimiento,
        tipo_mantenimiento,
        tecnico,
        descripcion,
        observaciones,
        estado,
        proxima_fecha,
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Mantenimiento no encontrado'
      });
    }

    res.json({
      ok: true,
      mensaje: 'Mantenimiento actualizado correctamente',
      mantenimiento: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error actualizando mantenimiento',
      ...detalleError(error)
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const evidenciasResultado = await pool.query(
      `SELECT ruta_archivo
       FROM evidencias_mantenimiento
       WHERE mantenimiento_id = $1`,
      [id]
    );

    const resultado = await pool.query(
      `DELETE FROM mantenimientos
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Mantenimiento no encontrado'
      });
    }

    await eliminarArchivosEvidencia(evidenciasResultado.rows);

    res.json({
      ok: true,
      mensaje: 'Mantenimiento eliminado correctamente',
      mantenimiento: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error eliminando mantenimiento',
      ...detalleError(error)
    });
  }
});

module.exports = router;
