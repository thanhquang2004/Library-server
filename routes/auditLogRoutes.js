const express = require("express");
const router = express.Router();
const auditLogController = require("../controllers/auditLogController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const rateLimiter = require("../middlewares/rateLimiter");

// Create audit log (system-only)
router.post("/", rateLimiter, auditLogController.createAuditLog);

// Get audit logs by user ID (admin)
router.get(
  "/user/:userId",
  authMiddleware,
  roleMiddleware(["admin"]),
  rateLimiter,
  auditLogController.getAuditLogsByUser
);

// Get audit logs by model (admin)
router.get(
  "/model/:model",
  authMiddleware,
  roleMiddleware(["admin"]),
  rateLimiter,
  auditLogController.getAuditLogsByModel
);

// Get all audit logs (admin)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  rateLimiter,
  auditLogController.getAllAuditLogs
);

module.exports = router;
