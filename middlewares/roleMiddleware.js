const createError = require("http-errors");

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    try {
      // Kiểm tra xem user đã được xác thực chưa
      if (!req.user || !req.user.role) {
        throw createError(401, "Authentication required");
      }

      const userRole = req.user.role.toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map((role) =>
        role.toLowerCase()
      );

      // Kiểm tra role có hợp lệ không
      if (!normalizedAllowedRoles.includes(userRole)) {
        throw createError(403, "Insufficient permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = roleMiddleware;
