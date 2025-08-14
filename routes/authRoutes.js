const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticate = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post(
  "/register",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  authController.register
);
router.post("/login", authController.login);

module.exports = router;
