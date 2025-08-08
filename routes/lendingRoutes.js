const express = require("express");
const router = express.Router();
const lendingController = require("../controllers/lendingController");
const authenticate = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get(
  "/",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  lendingController.getLendings
);
router.get(
  "/:id",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  lendingController.getLendingById
);
router.post(
  "/",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  lendingController.createLending
);
router.put(
  "/:id/return",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  lendingController.returnLending
);

module.exports = router;
