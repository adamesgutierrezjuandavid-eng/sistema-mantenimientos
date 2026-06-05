const express = require('express');
const pool = require('../db');
const { detalleError } = require('../utils/http');
const { crearToken, verificarPassword } = require('../utils/auth');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { usuario = '', password = '' } = req.body;

    if (!usuario.trim() || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Usuario y contrasena son obligatorios'
      });
    }

    const resultado = await pool.query(
      `SELECT id, nombre, usuario, password_hash, rol, activo
       FROM usuarios
       WHERE usuario = $1
       LIMIT 1`,
      [usuario.trim()]
    );

    if (
      resultado.rows.length === 0 ||
      !resultado.rows[0].activo ||
      !verificarPassword(password, resultado.rows[0].password_hash)
    ) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales invalidas'
      });
    }

    const usuarioDb = resultado.rows[0];
    const sesion = {
      id: usuarioDb.id,
      nombre: usuarioDb.nombre,
      usuario: usuarioDb.usuario,
      rol: usuarioDb.rol
    };

    res.json({
      ok: true,
      mensaje: 'Sesion iniciada correctamente',
      token: crearToken(sesion),
      usuario: sesion
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error iniciando sesion',
      ...detalleError(error)
    });
  }
});

router.get('/me', autenticar, (req, res) => {
  res.json({
    ok: true,
    usuario: req.usuario
  });
});

module.exports = router;
