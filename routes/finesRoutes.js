const express = require("express");
const router = express.Router();
const fineController = require("../controllers/finesController");
const authenticate = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post(
  "/",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  fineController.createFine
);

router.put(
  "/:id/paid",
  authenticate,
  roleMiddleware(["librarian"]),
  fineController.markAsPaid
);

router.get("/user/:memberId", authenticate, fineController.getFinesByUser);

router.get(
  "/user/:memberId/unpaid-total",
  authenticate,
  fineController.getUnpaidTotal
);

router.get(
  "/search",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  fineController.getFines
);

router.delete(
  "/:id",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  fineController.deleteFine
);

router.delete(
  "/hardDelete/:id",
  authenticate,
  roleMiddleware(["librarian", "admin"]),
  fineController.absoluteDeleteFine
);

module.exports = router;
