const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
