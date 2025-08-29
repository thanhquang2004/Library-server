const express = require("express");
const router = express.Router();
const controller = require("../controllers/bookLendingController");
const authenticate = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Tạo phiếu mượn
router.post(
    "/",
    authenticate,
    roleMiddleware(["librarian"]),
    controller.createLending
);

// Trả sách
router.put(
    "/:id/return",
    authenticate,
    roleMiddleware(["librarian"]),
    controller.returnBook
);

// Gia hạn
router.put(
    "/:id/extend",
    authenticate,
    roleMiddleware(["member", "librarian"]),
    controller.extendLending
);

// Check quá hạn
router.get(
    "/:id/check-overdue",
    authenticate,
    roleMiddleware(["librarian", "admin"]),
    controller.checkOverdue
);

// Lấy danh sách (có filter)
router.get(
    "/",
    authenticate,
    roleMiddleware(["librarian", "admin"]),
    controller.getLendings
);

// Lấy chi tiết
router.get(
    "/:id",
    authenticate,
    roleMiddleware(["member", "librarian", "admin"]),
    controller.getLendingById
);

// Xóa (soft delete)
router.delete(
    "/:id",
    authenticate,
    roleMiddleware(["admin"]),
    controller.deleteLending
);

module.exports = router;
