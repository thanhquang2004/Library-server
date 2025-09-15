const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Create payment (librarian)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["librarian"]),
  paymentController.createPayment
);

// Get payments by fine ID (librarian, admin)
router.get(
  "/fine/:fineId",
  authMiddleware,
  roleMiddleware(["librarian", "admin"]),
  paymentController.getPaymentsByFine
);

// Get payments by member ID (member, librarian, admin)
router.get(
  "/user/:memberId",
  authMiddleware,
  paymentController.getPaymentsByMember
);

// Get all payments (librarian, admin)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["librarian", "admin"]),
  paymentController.getAllPayments
);

// Delete payment (admin)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  paymentController.deletePayment
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  paymentController.absoluteDeletePayment
);

module.exports = router;
