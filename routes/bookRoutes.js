const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const { auth, isLibrarianOrAdmin } = require("../middlewares/authMiddleware");

router.get("/", bookController.getBooks);
router.get("/:id", bookController.getBookById);

// Các route thêm/sửa/xoá yêu cầu Librarian
router.post("/", auth, isLibrarianOrAdmin, bookController.createBook);
router.put("/:id", auth, isLibrarianOrAdmin, bookController.updateBook);
router.delete("/:id", auth, isLibrarianOrAdmin, bookController.deleteBook);

module.exports = router;
