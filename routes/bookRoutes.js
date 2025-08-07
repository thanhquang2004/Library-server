const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
// const { auth, isLibrarian } = require("../middlewares/authMiddleware");

// router.get("/", bookController.getBooks);
// router.get("/:id", bookController.getBookById);

// // Các route thêm/sửa/xoá yêu cầu Librarian
// router.post("/", auth, isLibrarian, bookController.createBook);
// router.put("/:id", auth, isLibrarian, bookController.updateBook);
// router.delete("/:id", auth, isLibrarian, bookController.deleteBook);

module.exports = router;
