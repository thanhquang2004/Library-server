const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Get all categories (member, librarian, admin)
router.get("/", authMiddleware, categoryController.getAllCategories);

// Create category (librarian, admin)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["librarian", "admin"]),
  categoryController.createCategory
);

// Update category (librarian, admin)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["librarian", "admin"]),
  categoryController.updateCategory
);

// Get books by category name (member, librarian, admin)
router.get(
  "/:name/books",
  authMiddleware,
  categoryController.getBooksByCategory
);

// Get subcategories (member, librarian, admin)
router.get(
  "/:id/subcategories",
  authMiddleware,
  categoryController.getSubcategories
);

// Delete category (librarian, admin)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["librarian", "admin"]),
  categoryController.deleteCategory
);

module.exports = router;
