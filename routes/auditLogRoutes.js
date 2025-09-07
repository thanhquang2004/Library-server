const express = require("express");
const router = express.Router();
const auditLogController = require("../controllers/auditLogController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Create audit log (system-only)
router.post("/", auditLogController.createAuditLog);

// Get audit logs by user ID (admin)
router.get(
  "/user/:userId",
  authMiddleware,
  roleMiddleware(["admin"]),
  auditLogController.getAuditLogsByUser
);

// Get audit logs by model (admin)
router.get(
  "/model/:model",
  authMiddleware,
  roleMiddleware(["admin"]),
  auditLogController.getAuditLogsByModel
);

// Get all audit logs (admin)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  auditLogController.getAllAuditLogs
);

module.exports = router;
