const express = require("express");
const router = express.Router();
const libraryController = require("../controllers/libraryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Create library (admin only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  libraryController.createLibrary
);

// Update library (admin only)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  libraryController.updateLibrary
);

// Get library by ID (admin/librarian)
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "librarian"]),
  libraryController.getLibrary
);

// Get all libraries (admin/librarian)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "librarian"]),
  libraryController.getAllLibraries
);

// Delete library (admin only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  libraryController.deleteLibrary
);

module.exports = router;
