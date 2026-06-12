const pool = require('../db');
const { detalleError } = require('../utils/http');

const validarEquipo = async (req, res, next) => {
  try {
    const {
      codigo_barras,
      serial,
      nombre,
      estado,
      fecha_compra
    } = req.body;
    
    const { id } = req.params; // Para el caso de PUT
    const errores = [];

    // Validar campos obligatorios
    if (!codigo_barras || String(codigo_barras).trim() === '') {
      errores.push('El codigo de barras es obligatorio.');
    }
    if (!serial || String(serial).trim() === '') {
      errores.push('El serial es obligatorio.');
    }
    if (!nombre || String(nombre).trim() === '') {
      errores.push('El nombre del equipo es obligatorio.');
    }

    // Validar estado
    const estadosPermitidos = ['activo', 'inactivo', 'en mantenimiento'];
    if (estado && !estadosPermitidos.includes(estado)) {
      errores.push(`El estado debe ser uno de: ${estadosPermitidos.join(', ')}.`);
    }

    // Validar fecha de compra
    if (fecha_compra && String(fecha_compra).trim() !== '') {
      if (isNaN(Date.parse(fecha_compra))) {
        errores.push('La fecha de compra no es una fecha valida.');
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Errores de validacion',
        errores
      });
    }

    // Validar duplicidad de codigo de barras en BD
    if (codigo_barras) {
      const queryCodigo = id 
        ? ['SELECT id FROM equipos WHERE codigo_barras = $1 AND id != $2::int LIMIT 1', [codigo_barras, id]]
        : ['SELECT id FROM equipos WHERE codigo_barras = $1 LIMIT 1', [codigo_barras]];

      const resultadoCodigo = await pool.query(queryCodigo[0], queryCodigo[1]);
      if (resultadoCodigo.rows.length > 0) {
        errores.push('El codigo de barras ya se encuentra registrado.');
      }
    }

    // Validar duplicidad de serial en BD
    if (serial) {
      const querySerial = id 
        ? ['SELECT id FROM equipos WHERE serial = $1 AND id != $2::int LIMIT 1', [serial, id]]
        : ['SELECT id FROM equipos WHERE serial = $1 LIMIT 1', [serial]];

      const resultadoSerial = await pool.query(querySerial[0], querySerial[1]);
      if (resultadoSerial.rows.length > 0) {
        errores.push('El serial ya se encuentra registrado.');
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Errores de validacion',
        errores
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error de servidor durante la validacion del equipo',
      ...detalleError(error)
    });
  }
};

const validarMantenimiento = async (req, res, next) => {
  try {
    const {
      equipo_id,
      fecha_mantenimiento,
      tipo_mantenimiento,
      tecnico,
      descripcion,
      estado,
      proxima_fecha
    } = req.body;

    const { id } = req.params; // Para PUT (id de mantenimiento)
    const errores = [];

    // Validar campos obligatorios
    // Nota: en un PUT, equipo_id puede no enviarse si no se cambia, pero el frontend actual envia todos los campos.
    // De cualquier forma, validamos equipo_id si es POST o si viene en el body
    const esPost = req.method === 'POST';
    if (esPost || equipo_id !== undefined) {
      if (!equipo_id || isNaN(parseInt(equipo_id))) {
        errores.push('El ID de equipo es obligatorio y debe ser numerico.');
      }
    }

    if (!fecha_mantenimiento || String(fecha_mantenimiento).trim() === '') {
      errores.push('La fecha de mantenimiento es obligatoria.');
    } else if (isNaN(Date.parse(fecha_mantenimiento))) {
      errores.push('La fecha de mantenimiento no es valida.');
    }

    const tiposPermitidos = ['preventivo', 'correctivo', 'predictivo'];
    if (!tipo_mantenimiento || !tiposPermitidos.includes(tipo_mantenimiento)) {
      errores.push(`El tipo de mantenimiento debe ser uno de: ${tiposPermitidos.join(', ')}.`);
    }

    if (!tecnico || String(tecnico).trim() === '') {
      errores.push('El tecnico es obligatorio.');
    }

    if (req.method === 'POST' || req.body.tecnico_id !== undefined) {
      if (!req.body.tecnico_id || isNaN(parseInt(req.body.tecnico_id))) {
        errores.push('El ID de tecnico es obligatorio y debe ser numerico.');
      }
    }

    if (!descripcion || String(descripcion).trim() === '') {
      errores.push('La descripcion es obligatoria.');
    }

    const estadosPermitidos = ['terminado', 'pendiente', 'en proceso'];
    if (estado && !estadosPermitidos.includes(estado)) {
      errores.push(`El estado debe ser uno de: ${estadosPermitidos.join(', ')}.`);
    }

    // Validar proxima fecha
    if (proxima_fecha && String(proxima_fecha).trim() !== '') {
      if (isNaN(Date.parse(proxima_fecha))) {
        errores.push('La proxima fecha de mantenimiento no es valida.');
      } else if (fecha_mantenimiento && Date.parse(proxima_fecha) < Date.parse(fecha_mantenimiento)) {
        errores.push('La proxima fecha de mantenimiento no puede ser anterior a la fecha actual de mantenimiento.');
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Errores de validacion',
        errores
      });
    }

    // Validar que el equipo exista en la BD
    const equipoIdBuscar = equipo_id || (id ? await obtenerEquipoIdDeMantenimiento(id) : null);
    if (equipoIdBuscar) {
      const resultadoEquipo = await pool.query('SELECT id FROM equipos WHERE id = $1 LIMIT 1', [equipoIdBuscar]);
      if (resultadoEquipo.rows.length === 0) {
        errores.push('El equipo especificado no existe.');
      }
    } else {
      errores.push('No se pudo determinar el equipo para el mantenimiento.');
    }

    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Errores de validacion',
        errores
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error de servidor durante la validacion del mantenimiento',
      ...detalleError(error)
    });
  }
};

// Helper para obtener equipo_id a partir de un mantenimiento_id (usado en PUT /api/mantenimientos/:id)
async function obtenerEquipoIdDeMantenimiento(mantenimientoId) {
  const resultado = await pool.query('SELECT equipo_id FROM mantenimientos WHERE id = $1 LIMIT 1', [mantenimientoId]);
  return resultado.rows.length > 0 ? resultado.rows[0].equipo_id : null;
}

module.exports = {
  validarEquipo,
  validarMantenimiento
};
