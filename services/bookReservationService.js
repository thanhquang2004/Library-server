const mongoose = require("mongoose");
const BookReservation = require("../models/BookReservation");
const BookItem = require("../models/BookItem");
const Notification = require("../models/Notification")

function validateObjectId(id, name = "id") {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${name}`);
  }
}

async function createReservation({ bookItemId, memberId, requestingUser }) {
    validateObjectId(bookItemId, "bookItemId");
    validateObjectId(memberId, "memberId");

    const bookItem = await BookItem.findOne({ _id: { $eq: bookItemId } });

    if (!bookItem || bookItem.status !== "available") {
        return { error: "Book not reservable" };
    }

    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setDate(now.getDate() + 1);

    const reservation = await BookReservation.create({
        bookItem: bookItemId,
        member: memberId,
        creationDate: now,
        reservationDate: now,
        expirationDate,
        status: "pending",
        isDeleted: false,
    });

    // Log action and notify admins/librarians
    await BookReservation.logAction(
        requestingUser.userId,
        "create_reservation",
        { id: reservation._id, model: "BookReservation" },
        "Book reservation created"
    );
    const adminsAndLibrarians = await User.find({
        role: { $in: ["admin", "librarian"] },
        isDeleted: false,
    });
    for (const user of adminsAndLibrarians) {
        await Notification.create({
            member: user._id,
            content: `Book reservation created for item "${bookItem.title}" by member "${user.name}".`,
            type: "email",
        });
    }

    return {
        reservationId: reservation._id,
        bookItemId: reservation.bookItem,
        memberId: reservation.member._id,
        creationDate: reservation.creationDate,
        reservationDate: reservation.reservationDate,
        expirationDate: reservation.expirationDate,
        status: reservation.status,
        isDeleted: reservation.isDeleted,
    };
}

async function cancelReservation(reservationId, requestingUser) {
    validateObjectId(reservationId, "reservationId");

  const reservation = await BookReservation.findById(reservationId);
  if (!reservation) return { error: "Reservation not found" };

  reservation.status = "cancelled";
  await reservation.save();

    // Log action and notify member and admins/librarians
    await BookReservation.logAction(
        requestingUser.userId,
        "cancel_reservation",
        { id: reservation._id, model: "BookReservation" },
        `Reservation ${reservation._id} cancelled`
    );
    await Notification.create({
        member: reservation.member,
        content: `Your reservation for book item "${reservation.bookItem.title}" has been cancelled.`,
        type: "email",
    });
    const adminsAndLibrarians = await User.find({
        role: { $in: ["admin", "librarian"] },
        isDeleted: false,
    });
    for (const user of adminsAndLibrarians) {
        await Notification.create({
            member: user._id,
            content: `Reservation ${reservation._id} cancelled for book item "${reservation.bookItem.title}" by member "${user.name}".`,
            type: "email",
        });
    }

    return { reservationId: reservation._id, status: reservation.status };
}

async function completeReservation(reservationId, requestingUser) {
    validateObjectId(reservationId, "reservationId");

  const reservation = await BookReservation.findById(reservationId);
  if (!reservation) return { error: "Reservation not found" };

  reservation.status = "completed";
  reservation.reservationDate = new Date();
  await reservation.save();

    // Log action and notify member and admins/librarians
    await BookReservation.logAction(
        requestingUser.userId,
        "complete_reservation",
        { id: reservation._id, model: "BookReservation" },
        `Reservation ${reservation._id} completed`
    );
    await Notification.create({
        member: reservation.member,
        content: `Your reservation for book item "${reservation.bookItem.title}" has been completed.`,
        type: "email",
    });
    const adminsAndLibrarians = await User.find({
        role: { $in: ["admin", "librarian"] },
        isDeleted: false,
    });
    for (const user of adminsAndLibrarians) {
        await Notification.create({
            member: user._id,
            content: `Reservation ${reservation._id} completed for book item "${reservation.bookItem.title}" by member "${user.name}".`,
            type: "email",
        });
    }

    return {
        reservationId: reservation._id,
        status: reservation.status,
        reservationDate: reservation.reservationDate,
    };
}

async function checkExpiration(reservationId) {
  validateObjectId(reservationId, "reservationId");

  const reservation = await BookReservation.findById(reservationId);
  if (!reservation) return { error: "Reservation not found" };

  if (
    reservation.expirationDate < new Date() &&
    reservation.status === "completed"
  ) {
    reservation.status = "expired";
    await reservation.save();
  }

  return { reservationId: reservation._id, status: reservation.status };
}

async function getUserReservations(memberId) {
  validateObjectId(memberId, "memberId");

  const reservations = await BookReservation.find({
    member: memberId,
    isDeleted: false,
  }).populate("bookItem");

  return reservations.map((r) => ({
    reservationId: r._id,
    bookItem: r.bookItem,
    member: r.member,
    creationDate: r.creationDate,
    reservationDate: r.reservationDate,
    expirationDate: r.expirationDate,
    status: r.status,
  }));
}

async function getAllReservations({ memberId, status, page = 1, limit = 10 }) {
  const query = { isDeleted: false };

  if (memberId) {
    validateObjectId(memberId, "memberId");
    query.member = new mongoose.Types.ObjectId(memberId);
  }

  if (
    typeof status === "string" &&
    ["pending", "completed", "cancelled", "expired"].includes(status)
  ) {
    query.status = status;
  }

  const safePage = Number.isInteger(Number(page))
    ? Math.max(1, parseInt(page, 10))
    : 1;
  const safeLimit = Number.isInteger(Number(limit))
    ? Math.min(100, Math.max(1, parseInt(limit, 10)))
    : 10;

  const reservations = await BookReservation.find(query)
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .populate("bookItem");

  return reservations.map((r) => ({
    reservationId: r._id,
    bookItem: r.bookItem,
    member: r.member,
    creationDate: r.creationDate,
    reservationDate: r.reservationDate,
    expirationDate: r.expirationDate,
    status: r.status,
  }));
}

async function softDeleteReservation(reservationId, requestingUser) {
    validateObjectId(reservationId, "reservationId");

  const reservation = await BookReservation.findById(reservationId);
  if (!reservation) return { error: "Reservation not found" };

  reservation.isDeleted = true;
  await reservation.save();

  return { message: "Reservation deleted" };
}

async function hardDeleteReservation(reservationId) {
  validateObjectId(reservationId, "reservationId");

  const reservation = await BookReservation.findById(reservationId);
  if (!reservation) return { error: "Reservation not found" };
  await BookReservation.deleteOne({ _id: reservationId });

    // Log action and notify member and admins/librarians
    await BookReservation.logAction(
        requestingUser.userId,
        "soft_deleted_reservation",
        { id: reservation._id, model: "BookReservation" },
        `Reservation ${reservation._id} soft deleted`
    );
    await Notification.create({
        member: reservation.member,
        content: `Your reservation for book item "${reservation.bookItem.title}" has been soft deleted.`,
        type: "email",
    });
    const adminsAndLibrarians = await User.find({
        role: { $in: ["admin", "librarian"] },
        isDeleted: false,
    });
    for (const user of adminsAndLibrarians) {
        await Notification.create({
            member: user._id,
            content: `Reservation ${reservation._id} soft deleted for book item "${reservation.bookItem.title}" by member "${user.name}".`,
            type: "email",
        });
    }

    return { message: "Reservation soft deleted" };
}

module.exports = {
    createReservation,
    cancelReservation,
    completeReservation,
    checkExpiration,
    getUserReservations,
    getAllReservations,
    softDeleteReservation
};
