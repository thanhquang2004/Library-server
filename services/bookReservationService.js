const mongoose = require("mongoose");
const BookReservation = require("../models/BookReservation");
const BookItem = require("../models/BookItem");

function validateObjectId(id, name = "id") {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ${name}`);
    }
}

async function createReservation({ bookItemId, memberId }) {
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

async function cancelReservation(reservationId) {
    validateObjectId(reservationId, "reservationId");

    const reservation = await BookReservation.findById(reservationId);
    if (!reservation) return { error: "Reservation not found" };

    reservation.status = "cancelled";
    await reservation.save();

    return { reservationId: reservation._id, status: reservation.status };
}

async function completeReservation(reservationId) {
    validateObjectId(reservationId, "reservationId");

    const reservation = await BookReservation.findById(reservationId);
    if (!reservation) return { error: "Reservation not found" };

    reservation.status = "completed";
    reservation.reservationDate = new Date();
    await reservation.save();

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

    if (reservation.expirationDate < new Date() && reservation.status === "completed") {
        reservation.status = "expired";
        await reservation.save();
    }

    return { reservationId: reservation._id, status: reservation.status };
}

async function getUserReservations(memberId) {
    validateObjectId(memberId, "memberId");

    const reservations = await BookReservation.find({ member: memberId, isDeleted: false })
        .populate("bookItem");

    return reservations.map(r => ({
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
        query.member = memberId;
    }

    if (status && ["pending", "completed", "cancelled", "expired"].includes(status)) {
        query.status = status;
    }

    page = Number.isInteger(Number(page)) ? Math.max(1, parseInt(page, 10)) : 1;
    limit = Number.isInteger(Number(limit)) ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 10;

    const reservations = await BookReservation.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("bookItem");

    return reservations.map(r => ({
        reservationId: r._id,
        bookItem: r.bookItem,
        member: r.member,
        creationDate: r.creationDate,
        reservationDate: r.reservationDate,
        expirationDate: r.expirationDate,
        status: r.status,
    }));
}

async function softDeleteReservation(reservationId) {
    validateObjectId(reservationId, "reservationId");

    const reservation = await BookReservation.findById(reservationId);
    if (!reservation) return { error: "Reservation not found" };

    reservation.isDeleted = true;
    await reservation.save();

    return { message: "Reservation deleted" };
}

module.exports = {
    createReservation,
    cancelReservation,
    completeReservation,
    checkExpiration,
    getUserReservations,
    getAllReservations,
    softDeleteReservation,
};
