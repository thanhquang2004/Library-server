const express = require("express");
const router = express.Router();
const controller = require("../controllers/bookReservationController");

const authenticate = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// POST /api/book-reservations
router.post(
    "/",
    authenticate,
    roleMiddleware(["member", "librarian"]),
    controller.createReservation
);

// PUT /api/book-reservations/:id/cancel
router.put(
    "/:id/cancel",
    authenticate,
    roleMiddleware(["member", "librarian"]),
    controller.cancelReservation
);

// PUT /api/book-reservations/:id/complete
router.put(
    "/:id/complete",
    authenticate,
    roleMiddleware(["member", "librarian"]),
    controller.completeReservation
);

// GET /api/book-reservations/:id/check-expiration
router.get(
    "/:id/check-expiration",
    authenticate,
    roleMiddleware(["librarian", "admin"]),
    controller.checkExpiration
);

// GET /api/book-reservations (member lấy của chính mình)
router.get(
    "/",
    authenticate,
    roleMiddleware(["member"]),
    controller.getMyReservations
);

// GET /api/book-reservations/all (admin, librarian)
router.get(
    "/all",
    authenticate,
    roleMiddleware(["librarian", "admin"]),
    controller.getAllReservations
);

// DELETE /api/book-reservations/:id (soft delete)
router.delete(
    "/:id",
    authenticate,
    roleMiddleware(["librarian", "admin"]),
    controller.deleteReservation
);

module.exports = router;
