const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");
const authenticate = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post(
  "/",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  authorController.createAuthor
);

router.put(
  "/:id",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  authorController.updateAuthor
);

router.get("/search", authenticate, authorController.searchAuthors);

router.get("/", authenticate, authorController.getAllAuthors);

router.get("/:id", authenticate, authorController.getAuthor);

router.get("/:id/books", authenticate, authorController.getBooksByAuthor);

router.delete(
  "/:id",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  authorController.deleteAuthor
);

router.delete(
  "/hardDelete/:id",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  authorController.hardDeleteAuthor
);

module.exports = router;
