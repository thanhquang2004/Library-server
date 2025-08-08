const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const authenticate = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get("/", bookController.getBooks);
router.get("/:id", bookController.getBookById);

// Các route thêm/sửa/xoá yêu cầu Librarian
router.post(
  "/",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  bookController.createBook
);
router.put(
  "/:id",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  bookController.updateBook
);
router.delete(
  "/:id",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  bookController.deleteBook
);

module.exports = router;
