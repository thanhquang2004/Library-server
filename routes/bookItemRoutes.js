const express = require("express");
const router = express.Router();
const bookItemController = require("../controllers/bookItemController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Create book item (admin/librarian)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "librarian"]),
  bookItemController.createBookItem
);

// Update book item (admin/librarian)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "librarian"]),
  bookItemController.updateBookItem
);

// Get book item by barcode (librarian)
router.get(
  "/:barcode",
  authMiddleware,
  roleMiddleware(["librarian"]),
  bookItemController.getBookItem
);

// Get all book items (member/librarian/admin)
router.get("/", authMiddleware, bookItemController.getAllBookItems);

// Update book item status (librarian)
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["librarian"]),
  bookItemController.updateBookItemStatus
);

// Delete book item (admin/librarian)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "librarian"]),
  bookItemController.deleteBookItem
);

module.exports = router;
