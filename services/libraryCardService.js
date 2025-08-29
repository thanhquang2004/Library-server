const LibraryCard = require("../models/LibraryCard");

exports.createCard = async ({ userId, cardNumber }) => {
    if (!userId || !cardNumber) throw new Error("Invalid data");

    const exists = await LibraryCard.findOne({ cardNumber });
    if (exists) throw new Error("Card number already exists");

    const card = new LibraryCard({ user: userId, cardNumber });
    await card.save();

    return {
        cardId: card._id,
        cardNumber: card.cardNumber,
        user: card.user,
        active: card.active
    };
};

exports.getCardByNumber = async (cardNumber) => {
    const card = await LibraryCard.findOne({ cardNumber, isDeleted: false }).populate("user");
    if (!card) throw new Error("Card not found");
    return {
        cardId: card._id,
        cardNumber: card.cardNumber,
        user: card.user,
        active: card.active
    };
};

exports.toggleCardStatus = async (cardNumber) => {
    const card = await LibraryCard.findOne({ cardNumber, isDeleted: false });
    if (!card) throw new Error("Card not found");

    card.active = !card.active;
    await card.save();
    return {
        cardId: card._id,
        cardNumber: card.cardNumber,
        active: card.active
    };
};

exports.getCardByUserId = async (userId) => {
    const card = await LibraryCard.findOne({ user: userId, isDeleted: false });
    if (!card) throw new Error("Card not found");
    return {
        cardId: card._id,
        cardNumber: card.cardNumber,
        active: card.active
    };
};

exports.deleteCard = async (cardNumber) => {
    const card = await LibraryCard.findOne({ cardNumber, isDeleted: false });
    if (!card) throw new Error("Card not found");

    card.active = false;
    card.isDeleted = true;
    await card.save();
    return { message: "Card deleted" };
};
