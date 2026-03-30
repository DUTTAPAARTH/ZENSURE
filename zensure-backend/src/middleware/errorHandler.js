function errorHandler(error, req, res, next) {
  console.error(`[${new Date().toISOString()}]`, error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal server error',
  });
}

module.exports = errorHandler;
