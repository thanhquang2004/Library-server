const BookLending = require("../models/BookLending");
const BookItem = require("../models/BookItem");
const BookReservation = require("../models/BookReservation");
const mongoose = require("mongoose");

async function createLending({ bookItemId, memberId, dueDate }) {
    if (!mongoose.Types.ObjectId.isValid(bookItemId)) {
        throw new Error("Invalid book item ID");
    }

    // Ensure bookItemId is a string or valid ObjectId and not an object
    if (typeof bookItemId !== "string" && !(bookItemId instanceof mongoose.Types.ObjectId)) {
        throw new Error("Invalid bookItemId type");
    }
    if (!mongoose.Types.ObjectId.isValid(bookItemId)) {
        throw new Error("Invalid bookItemId format");
    }
    const bookItem = await BookItem.findById(bookItemId);
    if (!bookItem) throw new Error("Sách không tồn tại");
    if (bookItem.status !== "available") throw new Error("Sách đã được mượn");

    const bookReservation = await BookReservation.findById(bookItemId);
    if (bookReservation && bookReservation.status !== "completed") throw new Error("Sách đã được đặt trước");

    const lending = await BookLending.create({
        bookItem: bookItemId,
        member: memberId,
        fines: null,
        creationDate: new Date(),
        dueDate,
        returnDate: null,
        status: "borrowed",
        isDeleted: false
    });

    // cập nhật trạng thái sách
    bookItem.status = "loaned";
    await bookItem.save();

    return {
        bookLendingId: lending._id,
        bookItem: lending.bookItem,
        member: lending.member,
        fines: lending.fines,
        creationDate: lending.creationDate,
        dueDate: lending.dueDate,
        returnDate: lending.returnDate,
        status: lending.status,
    };
}

async function returnBook(id) {
    const lending = await BookLending.findById(id).populate("bookItem");
    if (!lending || lending.isDeleted) return null;

    lending.returnDate = new Date();
    lending.status = "returned";
    await lending.save();

    // cập nhật status bookItem lại thành available
    if (lending.bookItem) {
        lending.bookItem.status = "available";
        await lending.bookItem.save();
    }

    return {
        bookLendingId: lending._id,
        returnDate: lending.returnDate,
        status: lending.status,
    };
}

async function extendLending(id, newDueDate) {
    const lending = await BookLending.findById(id);
    if (!lending || lending.isDeleted) return null;

    if (lending.status !== "borrowed") throw new Error("Cannot extend");

    lending.dueDate = newDueDate;
    await lending.save();

    return {
        bookLendingId: lending._id,
        dueDate: lending.dueDate,
    };
}

async function checkOverdue(id) {
    const lending = await BookLending.findById(id);
    if (!lending || lending.isDeleted) return null;

    const overdue = new Date() > new Date(lending.dueDate) && lending.status === "borrowed";
    return {
        bookLendingId: lending._id,
        "overdue": overdue
    };
}

async function getLendings({ memberId, status, page = 1, limit = 10 }) {
    const query = { isDeleted: false };
    // Validate and safely add memberId to query
    if (memberId) {
        // Only allow valid ObjectId or string values for memberId
        if (typeof memberId === "string" && mongoose.Types.ObjectId.isValid(memberId)) {
            query.member = { $eq: memberId };
        } else if (memberId instanceof mongoose.Types.ObjectId) {
            query.member = { $eq: memberId };
        } else {
            throw new Error("Invalid memberId format");
        }
    }
    if (status) query.status = status;

    const lendings = await BookLending.find(query)
        .populate("bookItem")
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

    // map để trả kết quả chuẩn
    return lendings.map((l) => ({
        bookLendingId: l._id,
        bookItem: l.bookItem,
        member: l.member,
        fines: l.fines,
        creationDate: l.creationDate,
        dueDate: l.dueDate,
        returnDate: l.returnDate,
        status: l.status,
    }));
}

async function getLendingById(id) {
    const lending = await BookLending.findOne({ _id: id, isDeleted: false }).populate("bookItem");
    return {
        bookLendingId: lending._id,
        bookItem: lending.bookItem,
        member: lending.member,
        fines: lending.fines,
        creationDate: lending.creationDate,
        dueDate: lending.dueDate,
        returnDate: lending.returnDate,
        status: lending.status,
    };
}

async function deleteLending(id) {
    const lending = await BookLending.findById(id);
    if (!lending) return null;

    lending.isDeleted = true;
    await lending.save();
    return lending;
}

module.exports = {
    createLending,
    returnBook,
    extendLending,
    checkOverdue,
    getLendings,
    getLendingById,
    deleteLending
};
