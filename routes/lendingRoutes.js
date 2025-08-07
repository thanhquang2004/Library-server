const express = require("express");
const router = express.Router();
const lendingController = require("../controllers/lendingController");
const { auth, isLibrarianOrAdmin } = require("../middlewares/authMiddleware");

router.get("/", auth, isLibrarianOrAdmin, lendingController.getLendings);
router.get("/:id", auth, isLibrarianOrAdmin, lendingController.getLendingById);
router.post("/", auth, isLibrarianOrAdmin, lendingController.createLending);
router.put("/:id/return", auth, isLibrarianOrAdmin, lendingController.returnLending);

module.exports = router;
