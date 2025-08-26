const BookReservation = require("../models/BookReservation");
const BookItem = require("../models/BookItem");

async function createReservation({ bookItemId, memberId }) {
    const bookItem = await BookItem.findById(bookItemId);
    if (!bookItem || bookItem.status !== "available") {
        return { error: "Book not reservable" };
    }

    const now = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(now.getDate() + 1); // hết hạn sau 1 ngày

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
        bookItemId: reservation.bookItemId,
        member: reservation.member,
        creationDate: reservation.creationDate,
        reservationDate: reservation.reservationDate,
        expirationDate: reservation.expirationDate,
        status: reservation.status,
        isDeleted: reservation.isDeleted,
    };
}

// Hủy đặt trước
async function cancelReservation(reservationId) {
    const reservation = await BookReservation.findOne({ _id: reservationId });
    if (!reservation) return { error: "Reservation not found" };

    reservation.status = "cancelled";
    await reservation.save();

    return {
        reservationId: reservation._id,
        status: reservation.status,
    };
}

// Hoàn thành đặt trước
async function completeReservation(reservationId) {
    const reservation = await BookReservation.findOne({ _id: reservationId });
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

// Kiểm tra hết hạn
async function checkExpiration(reservationId) {
    const reservation = await BookReservation.findById(reservationId);
    if (!reservation) return { error: "Reservation not found" };

    if (reservation.expirationDate < new Date() && reservation.status === "completed") {
        reservation.status = "expired";
        await reservation.save();
    }

    return {
        reservationId: reservation._id,
        status: reservation.status,
    };
}

// Lấy danh sách đặt trước của chính member
async function getUserReservations(memberId) {
    const reservations = await BookReservation.find({ member: memberId, isDeleted: false })
        .populate("bookItem");

    return reservations.map(r => ({
        reservationId: r._id,
        bookItem: r.bookItemId,
        member: r.memberId,
        creationDate: r.creationDate,
        reservationDate: r.reservationDate,
        expirationDate: r.expirationDate,
        status: r.status,
    }));
}

// Lấy tất cả đặt trước (admin, librarian)
async function getAllReservations({ memberId, status, page = 1, limit = 10 }) {
    const query = { isDeleted: false };
    if (memberId) query.memberId = memberId;
    if (status) query.status = status;

    const reservations = await BookReservation.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("bookItem");

    return reservations.map(r => ({
        reservationId: r._id,
        bookItem: r.bookItemId,
        member: r.memberId,
        creationDate: r.creationDate,
        reservationDate: r.reservationDate,
        expirationDate: r.expirationDate,
        status: r.status,
    }));
}

// Xóa mềm (isDeleted = true)
async function softDeleteReservation(reservationId) {
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
}
