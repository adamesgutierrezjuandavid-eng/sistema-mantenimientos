const { verificarToken } = require('../utils/auth');

function autenticar(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    req.usuario = verificarToken(token);
    next();
  } catch (_error) {
    res.status(401).json({
      ok: false,
      mensaje: 'Sesion invalida o expirada'
    });
  }
}

function permitirRoles(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: 'No tiene permisos para realizar esta accion'
      });
    }

    next();
  };
}

module.exports = {
  autenticar,
  permitirRoles
};
