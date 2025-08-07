const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get(
  "/:id",
  authenticate,
  roleMiddleware(["member", "librarian", "admin"]),
  userController.getUser
);

router.put(
  "/:id",
  authenticate,
  roleMiddleware(["member", "librarian", "admin"]),
  userController.updateUser
);

router.get(
  "/",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  userController.getUsers
);

router.get(
  "/:id/borrow-history",
  authenticate,
  roleMiddleware(["member", "librarian", "admin"]),
  userController.getBorrowHistory
);

router.get(
  "/:id/recommended-books",
  authenticate,
  roleMiddleware(["member"]),
  userController.getRecommendedBooks
);

router.put(
  "/:id/toggle-status",
  authenticate,
  roleMiddleware(["admin"]),
  userController.toggleAccountStatus
);

router.delete(
  "/:id",
  authenticate,
  roleMiddleware(["admin"]),
  userController.deleteUser
);

module.exports = router;
