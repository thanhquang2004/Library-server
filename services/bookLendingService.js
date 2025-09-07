const BookLending = require("../models/BookLending");
const BookItem = require("../models/BookItem");
const BookReservation = require("../models/BookReservation");
const mongoose = require("mongoose");

function validateObjectId(id, name = "id") {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${name}`);
  }
}

async function createLending({ bookItemId, memberId, dueDate, requestingUser }) {
    validateObjectId(bookItemId, "bookItemId");
    validateObjectId(memberId, "memberId");

    const bookItem = await BookItem.findOne({
        _id: { $eq: new mongoose.Types.ObjectId(bookItemId) }
    });

    if (!bookItem) throw new Error("Sách không tồn tại");
    if (bookItem.status !== "available") throw new Error("Sách đã được mượn");

    const bookReservation = await BookReservation.findOne({
        bookItem: { $eq: new mongoose.Types.ObjectId(bookItemId) },
        status: { $ne: "completed" },
    });

    if (bookReservation) throw new Error("Sách đã được đặt trước");

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

    bookItem.status = "loaned";
    await bookItem.save();

    // Log action and notify admins/librarians
    await BookLending.logAction(
        requestingUser.userId,
        "create_lending",
        { id: lending._id, model: "BookLending" },
        "Book lending created"
    );
    const adminsAndLibrarians = await User.find({
        role: { $in: ["admin", "librarian"] },
        isDeleted: false,
    });
    for (const user of adminsAndLibrarians) {
        await Notification.create({
            member: user._id,
            content: `Book lending created for item "${bookItem.title}" by member "${user.name}".`,
            type: "email",
        });
    }

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

async function returnBook(id, requestingUser) {
    validateObjectId(id, "lendingId");

  const lending = await BookLending.findById(id).populate("bookItem");
  if (!lending || lending.isDeleted) return null;

  lending.returnDate = new Date();
  lending.status = "returned";
  await lending.save();

    // Log action and notify admins/librarians
    await BookLending.logAction(
        requestingUser.userId,
        "return_lending",
        { id: lending._id, model: "BookLending" },
        "Book lending returned"
    );
    const adminsAndLibrarians = await User.find({
        role: { $in: ["admin", "librarian"] },
        isDeleted: false,
    });
    for (const user of adminsAndLibrarians) {
        await Notification.create({
            member: user._id,
            content: `Book lending returned for item "${bookItem.title}" by member "${user.name}".`,
            type: "email",
        });
    }

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

async function extendLending(id, newDueDate, requestingUser) {
    validateObjectId(id, "lendingId");

  const lending = await BookLending.findById(id);
  if (!lending || lending.isDeleted) return null;
  if (lending.status !== "borrowed") throw new Error("Cannot extend");

  lending.dueDate = newDueDate;
  await lending.save();

    // Log action and notify admins/librarians
    await BookLending.logAction(
        requestingUser.userId,
        "extend_lending",
        { id: lending._id, model: "BookLending" },
        "Book lending extended"
    );
    const adminsAndLibrarians = await User.find({
        role: { $in: ["admin", "librarian"] },
        isDeleted: false,
    });
    for (const user of adminsAndLibrarians) {
        await Notification.create({
            member: user._id,
            content: `Book lending extended for item "${lending._id}" by member "${user.name}".`,
            type: "email",
        });
    }

    return { bookLendingId: lending._id, dueDate: lending.dueDate };
}

async function checkOverdue(id, requestingUser) {
    validateObjectId(id, "lendingId");

  const lending = await BookLending.findById(id);
  if (!lending || lending.isDeleted) return null;

    const overdue = new Date() > new Date(lending.dueDate) && lending.status === "borrowed";

    // Log action and notify admins/librarians
    await BookLending.logAction(
        requestingUser.userId,
        "check_overdue",
        { id: lending._id, model: "BookLending" },
        "Book lending overdue checked"
    );
    const adminsAndLibrarians = await User.find({
        role: { $in: ["admin", "librarian"] },
        isDeleted: false,
    });
    for (const user of adminsAndLibrarians) {
        await Notification.create({
            member: user._id,
            content: `Book lending overdue checked for item "${lending._id}" by member "${user.name}".`,
            type: "email",
        });
    }
    return { bookLendingId: lending._id, overdue };
}

async function getLendings({ memberId, status, page = 1, limit = 10 }) {
  page = Math.max(1, parseInt(page, 10));
  limit = Math.min(100, Math.max(1, parseInt(limit, 10)));

  const query = { isDeleted: false };

  if (memberId) {
    validateObjectId(memberId, "memberId");
    query.memberId = { $eq: mongoose.Types.ObjectId(memberId) };
  }

  if (status) {
    query.status = { $eq: status };
  }

  const lendings = await BookLending.find(query)
    .populate("bookItem")
    .skip((page - 1) * limit)
    .limit(limit);

  return lendings.map((l) => ({
    lendingId: l._id,
    bookItem: l.bookItem,
    member: l.memberId,
    lendingDate: l.lendingDate,
    dueDate: l.dueDate,
    returnDate: l.returnDate,
    status: l.status,
  }));
}

async function getLendingById(id) {
  validateObjectId(id, "lendingId");

  const lending = await BookLending.findOne({
    _id: id,
    isDeleted: false,
  }).populate("bookItem");
  if (!lending) return null;

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
  validateObjectId(id, "lendingId");

  const lending = await BookLending.findById(id);
  if (!lending) return null;

  lending.isDeleted = true;
  await lending.save();
  return lending;
}

async function hardDeleteLending(id) {
  validateObjectId(id, "lendingId");

  const lending = await BookLending.findById(id);
  if (!lending) return null;
  await BookLending.deleteOne({ _id: id });
  return true;
}

module.exports = {
  createLending,
  returnBook,
  extendLending,
  checkOverdue,
  getLendings,
  getLendingById,
  deleteLending,
  hardDeleteLending,
};
