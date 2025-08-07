const express = require("express");
const router = express.Router();
const lendingController = require("../controllers/lendingController");
// const { auth, isLibrarian } = require("../middlewares/authMiddleware");

// router.get("/", auth, isLibrarian, lendingController.getLendings);
// router.get("/:id", auth, isLibrarian, lendingController.getLendingById);
// router.post("/", auth, isLibrarian, lendingController.createLending);
// router.put("/:id/return", auth, isLibrarian, lendingController.returnLending);

module.exports = router;
