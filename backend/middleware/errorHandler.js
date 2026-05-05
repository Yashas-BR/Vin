// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message);
  
  // MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      error: 'Duplicate entry — this record already exists'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      success: false,
      error: 'Invalid foreign key reference'
    });
  }

  // Generic error response
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
