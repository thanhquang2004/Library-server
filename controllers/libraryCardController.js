const libraryCardService = require("../services/libraryCardService");

const {
  validateCreateLibraryCard,
} = require("../utils/validate");

exports.createCard = async (req, res) => {
  try {
    const { error } = validateCreateLibraryCard(req.body);
    if (error) throw new Error(error.details.map((d) => d.message).join(", "));

    const card = await libraryCardService.createCard(req.body);
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCardByNumber = async (req, res) => {
  try {
    const card = await libraryCardService.getCardByNumber(req.params.cardNumber);
    res.json(card);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.toggleCardStatus = async (req, res) => {
  try {
    const card = await libraryCardService.toggleCardStatus(req.params.cardNumber);
    res.json({ cardId: card._id, cardNumber: card.cardNumber, active: card.active });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.getCardByUserId = async (req, res) => {
  try {
    const card = await libraryCardService.getCardByUserId(req.params.userId);
    res.json(card);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const result = await libraryCardService.deleteCard(req.params.cardNumber);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
