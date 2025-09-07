const express = require("express");
const router = express.Router();
const rackController = require("../controllers/rackController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Create rack (admin/librarian only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "librarian"]),
  rackController.createRack
);

// Update rack (admin/librarian only)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "librarian"]),
  rackController.updateRack
);

// Get rack by ID (admin/librarian only)
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "librarian"]),
  rackController.getRack
);

// Get all racks (admin/librarian only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "librarian"]),
  rackController.getAllRacks
);

// Get books on rack (admin/librarian only)
router.get(
  "/:id/books",
  authMiddleware,
  roleMiddleware(["admin", "member", "librarian"]),
  rackController.getBooksOnRack
);

// Delete rack (admin only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  rackController.deleteRack
);

router.delete(
  "/hardDelete/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  rackController.absoluteDeleteRack
);

module.exports = router;
