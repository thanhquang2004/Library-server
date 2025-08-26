const BookReservation = require("../services/bookReservationService");
const {
    validateCreateReservation,
    validateReservationId,
} = require("../utils/validate");

// Tạo đặt trước
const createReservation = async (req, res) => {
    const error = validateCreateReservation(req.body);
    if (error)
        return res.status(400).json({ error: error.details.map((e) => e.message) });

    try {
        const reservation = await BookReservation.createReservation(req.body);
        res.status(201).json(reservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Hủy đặt trước
const cancelReservation = async (req, res) => {
    const error = validateReservationId(req.params);
    if (error)
        return res.status(400).json({ error: error.details.map((e) => e.message) });

    try {
        const reservation = await BookReservation.cancelReservation(req.params.id);
        if (reservation.error) return res.status(404).json({ error: reservation.error });
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Hoàn thành đặt trước
const completeReservation = async (req, res) => {
    const error = validateReservationId(req.params);
    if (error)
        return res.status(400).json({ error: error.details.map((e) => e.message) });

    try {
        const reservation = await BookReservation.completeReservation(req.params.id);
        if (reservation.error) return res.status(404).json({ error: reservation.error });
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Kiểm tra hết hạn
const checkExpiration = async (req, res) => {
    const error = validateReservationId(req.params);
    if (error)
        return res.status(400).json({ error: error.details.map((e) => e.message) });

    try {
        const reservation = await BookReservation.checkExpiration(req.params.id);
        if (reservation.error) return res.status(404).json({ error: reservation.error });
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Member lấy của chính mình
const getMyReservations = async (req, res) => {
    // Lấy id từ token 
    const userIdFromToken = req.user.userId;

    try {
        const reservations = await BookReservation.getUserReservations(userIdFromToken);
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin/librarian lấy tất cả
const getAllReservations = async (req, res) => {
    try {
        const reservations = await BookReservation.getAllReservations(req.query);
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa mềm
const deleteReservation = async (req, res) => {
    const error = validateReservationId(req.params);
    if (error)
        return res.status(400).json({ error: error.details.map((e) => e.message) });

    try {
        const reservation = await BookReservation.softDeleteReservation(req.params.id);
        if (reservation.error) return res.status(404).json({ error: reservation.error });
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createReservation,
    cancelReservation,
    completeReservation,
    checkExpiration,
    getMyReservations,
    getAllReservations,
    deleteReservation,
};
