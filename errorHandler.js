const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err.message);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    error = {
      statusCode: 400,
      message: 'Validation error',
      errors: message
    };
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Resource already exists';
    error = {
      statusCode: 409,
      message
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      statusCode: 401,
      message
    };
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      statusCode: 401,
      message
    };
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = {
      statusCode: 400,
      message
    };
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;