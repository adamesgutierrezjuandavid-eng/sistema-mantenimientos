const fs = require('fs');
const path = require('path');

const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');

function resolverRutaEvidencia(rutaArchivo) {
  const rutaRelativa = String(rutaArchivo || '').replace(/^[/\\]+/, '');
  const rutaFisica = path.resolve(path.join(__dirname, '..', '..', rutaRelativa));

  if (!rutaFisica.startsWith(path.resolve(uploadsRoot))) {
    throw new Error('Ruta de evidencia fuera del directorio de uploads');
  }

  return rutaFisica;
}

async function eliminarArchivosEvidencia(evidencias) {
  for (const evidencia of evidencias) {
    try {
      await fs.promises.unlink(resolverRutaEvidencia(evidencia.ruta_archivo));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('No se pudo eliminar archivo de evidencia:', error.message);
      }
    }
  }
}

module.exports = {
  eliminarArchivosEvidencia
};
