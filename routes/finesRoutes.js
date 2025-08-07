const express = require("express");
const router = express.Router();
const fineController = require("../controllers/finesController");
const { auth, isLibrarianOrAdmin } = require("../middlewares/authMiddleware");

router.post("/", auth, isLibrarianOrAdmin, fineController.createFine);

router.put("/:id/paid", auth, isLibrarianOrAdmin, fineController.markAsPaid);

router.get("/user/:memberId", auth, fineController.getFinesByUser);

router.get("/user/:memberId/unpaid-total", auth, fineController.getUnpaidTotal);

router.get("/search", auth, isLibrarianOrAdmin, fineController.getFines);

router.delete('/:id', auth, isLibrarianOrAdmin, fineController.deleteFine);

module.exports = router;
