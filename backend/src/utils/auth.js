const crypto = require('crypto');

const TOKEN_TTL_SECONDS = 8 * 60 * 60;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET es obligatorio. Defina JWT_SECRET en el archivo .env.');
}

function base64Url(input) {
  return Buffer.from(input).toString('base64url');
}

function firmar(data) {
  return crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64url');
}

function crearToken(usuario) {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    sub: usuario.id,
    nombre: usuario.nombre,
    usuario: usuario.usuario,
    rol: usuario.rol,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  }));
  const signature = firmar(`${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
}

function verificarToken(token) {
  const [header, payload, signature] = String(token || '').split('.');

  if (!header || !payload || !signature) {
    throw new Error('Token invalido');
  }

  const expectedSignature = firmar(`${header}.${payload}`);

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error('Token invalido');
  }

  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

  if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expirado');
  }

  return data;
}

function verificarPassword(password, passwordHash) {
  const [salt, storedHash] = String(passwordHash || '').split(':');

  if (!salt || !storedHash) {
    return false;
  }

  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

module.exports = {
  crearToken,
  verificarPassword,
  verificarToken
};
