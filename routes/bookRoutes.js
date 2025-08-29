const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const authenticate = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// POST - create book
router.post("/", authenticate, roleMiddleware(["librarian", "admin"]), bookController.createBook);

// PUT - update book
router.put("/:id", authenticate, roleMiddleware(["librarian", "admin"]), bookController.updateBook);

// GET - search books
router.get("/search", authenticate, bookController.searchBooks);

// GET - get book by ID
router.get("/:id", authenticate, bookController.getBookById);

// GET - get book items
router.get("/:id/items", authenticate, bookController.getBookItems);

// GET - check available
router.get("/:id/available", authenticate, bookController.checkAvailable);

// DELETE - delete book
router.delete("/:id", authenticate, roleMiddleware(["librarian", "admin"]), bookController.deleteBook);

module.exports = router;
