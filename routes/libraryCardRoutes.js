const express = require("express");
const router = express.Router();
const libraryCardController = require("../controllers/libraryCardController");
const authenticate = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// POST - create new library card
router.post("/", authenticate,
    roleMiddleware(["librarian", "admin"]), libraryCardController.createCard);

// GET - get library card by cardNumber
router.get("/:cardNumber", authenticate,
    roleMiddleware(["librarian"]), libraryCardController.getCardByNumber);

// PUT - toggle status
router.put("/:cardNumber/toggle-status", authenticate,
    roleMiddleware(["librarian", "admin"]), libraryCardController.toggleCardStatus);

// GET - get library card by userId
router.get("/user/:userId", authenticate,
    roleMiddleware(["member", "librarian"]), libraryCardController.getCardByUserId);

// DELETE - mark card as deleted
router.delete("/:cardNumber", authenticate,
    roleMiddleware(["librarian", "admin"]), libraryCardController.deleteCard);

router.delete("/hardDelete/:cardNumber", authenticate,
    roleMiddleware(["librarian", "admin"]), libraryCardController.absoluteDeleteCard);

module.exports = router;
