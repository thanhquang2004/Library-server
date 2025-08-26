const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificationController");
const authenticate = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// POST - librarian, admin
router.post("/", authenticate, roleMiddleware(["librarian", "admin"]), controller.createNotification);

// PUT send - admin
router.put("/:id/send", authenticate, roleMiddleware(["admin"]), controller.sendNotification);

// GET user notifications - member, librarian, admin
router.get("/user/:memberId", authenticate, roleMiddleware(["member", "librarian", "admin"]), controller.getUserNotifications);

// DELETE notification - member, librarian, admin
router.delete("/:id", authenticate, roleMiddleware(["member", "librarian", "admin"]), controller.deleteNotification);

module.exports = router;
