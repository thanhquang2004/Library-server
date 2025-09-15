const { LibraryCard, Notification, User } = require("../models");

exports.createCard = async ({ userId, cardNumber }, requestingUser) => {
    let card; // Khai báo bên ngoài try
    try {
        if (!userId || !cardNumber) throw new Error("Invalid data");

        const exists = await LibraryCard.findOne({ cardNumber });
        if (exists) throw new Error("Card number already exists");

        card = new LibraryCard({ user: userId, cardNumber });
        await card.save();

        await LibraryCard.logAction(
            requestingUser.userId,
            "create_card",
            { id: card._id, model: "LibraryCard" },
            `Library card created for user ${userId}`
        );

        await Notification.create({
            member: userId,
            content: `Your library card ${cardNumber} has been created.`,
            type: "email",
        });

        const adminsAndLibrarians = await User.find({
            role: { $in: ["admin", "librarian"] },
            isDeleted: false,
        });

        for (const user of adminsAndLibrarians) {
            await Notification.create({
                member: user._id,
                content: `Library card ${cardNumber} created for user ${userId}.`,
                type: "email",
            });
        }

        // Trả về kết quả thành công
        return {
            cardId: card._id,
            cardNumber: card.cardNumber,
            user: card.user,
            active: card.active
        };

    } catch (error) {
        console.log(error);
        // Ném lỗi 400 cho client
        throw { status: 400, message: error.message };
    }
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

exports.toggleCardStatus = async (cardNumber, requestingUser) => {
    const card = await LibraryCard.findOne({ cardNumber, isDeleted: false });
    if (!card) throw new Error("Card not found");

    // Đổi trạng thái trước
    card.active = !card.active;
    await card.save();

    const userId = card.user; // lấy userId từ card

    // Log hành động
    await LibraryCard.logAction(
        requestingUser.userId,
        "update_status_card",
        { id: card._id, model: "LibraryCard" },
        `Library card status updated for user ${userId}`
    );

    // Gửi thông báo cho user
    await Notification.create({
        member: userId,
        content: `Your library card ${cardNumber} status has been updated.`,
        type: "email",
    });

    // Gửi thông báo cho admins và librarians
    const adminsAndLibrarians = await User.find({
        role: { $in: ["admin", "librarian"] },
        isDeleted: false,
    });

    for (const user of adminsAndLibrarians) {
        await Notification.create({
            member: user._id,
            content: `Library card ${cardNumber} status has been updated for user ${userId}.`,
            type: "email",
        });
    }

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
exports.deleteCard = async (cardNumber, requestingUser) => {
    const card = await LibraryCard.findOne({ cardNumber, isDeleted: false });
    if (!card) throw new Error("Card not found");

    // Cập nhật trạng thái xóa
    card.active = false;
    card.isDeleted = true;
    await card.save();

    const userId = card.user;

    // Log hành động
    await LibraryCard.logAction(
        requestingUser.userId,
        "delete_card",
        { id: card._id, model: "LibraryCard" },
        `Library card deleted by user ${requestingUser.userId}`
    );

    // Tạo notification cho user
    const userNotification = Notification.create({
        member: userId,
        content: `Your library card ${cardNumber} has been deleted.`,
        type: "email",
    });

    // Tạo notification cho admins và librarians
    const adminsAndLibrarians = await User.find({
        role: { $in: ["admin", "librarian"] },
        isDeleted: false,
    });

    const adminNotifications = adminsAndLibrarians.map(user =>
        Notification.create({
            member: user._id,
            content: `Library card ${cardNumber} deleted by user ${requestingUser.userId}.`,
            type: "email",
        })
    );

    // Chạy song song tất cả notifications
    await Promise.all([userNotification, ...adminNotifications]);

    return { message: "Card deleted" };
};

exports.absoluteDeleteCard = async (cardNumber, requestingUser) => {
    const card = await LibraryCard.findOne({ cardNumber, isDeleted: true });
    if (!card) throw new Error("Card not found");

    const userId = card.user;

    // Log hành động
    await LibraryCard.logAction(
        requestingUser.userId,
        "absolute_delete_card",
        { id: card._id, model: "LibraryCard" },
        `Library card absolutely deleted by user ${requestingUser.userId}`
    );

    // Tạo notification cho user
    const userNotification = Notification.create({
        member: userId,
        content: `Your library card ${cardNumber} has been absolutely deleted.`,
        type: "email",
    });

    // Tạo notification cho admins/librarians
    const adminsAndLibrarians = await User.find({
        role: { $in: ["admin", "librarian"] },
        isDeleted: false,
    });

    const adminNotifications = adminsAndLibrarians.map(user =>
        Notification.create({
            member: user._id,
            content: `Library card ${cardNumber} absolutely deleted by user ${requestingUser.userId}.`,
            type: "email",
        })
    );

    // Chạy song song tất cả notifications
    await Promise.all([userNotification, ...adminNotifications]);

    // Xóa vật lý card
    await card.deleteOne();

    return { message: "Card absolutely deleted" };
};
