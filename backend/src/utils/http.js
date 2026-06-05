function detalleError(error) {
  if (process.env.NODE_ENV === 'production') {
    return {};
  }

  return { error: error.message };
}

function normalizarPaginacion(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function crearMetaPaginacion(total, page, limit) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1)
  };
}

module.exports = {
  crearMetaPaginacion,
  detalleError,
  normalizarPaginacion
};
