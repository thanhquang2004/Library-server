const { validateCreateNotification, validateNotificationId, validateReservationId } = require("../utils/validate");
const notificationService = require("../services/notificationService");

// POST /api/notifications
async function createNotification(req, res) {
    const error = validateCreateNotification(req.body);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    try {
        const { memberId, content, type } = req.body;
        const notification = await notificationService.createNotification({ memberId, content, type });
        res.status(201).json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// PUT /api/notifications/:id/send
async function sendNotification(req, res) {
    const error = validateNotificationId(req.params);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    try {
        const notification = await notificationService.sendNotification(req.params.id);
        if (!notification) return res.status(404).json({ error: "Notification not found" });
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// GET /api/notifications/user/:memberId
async function getUserNotifications(req, res) {
    const { memberId } = req.params;
    // Lấy id từ token (auth middleware phải decode sẵn và gắn vào req.user)
    const userIdFromToken = req.user.userId;

    // Nếu memberId khác id trong token thì không cho truy cập
    if (memberId !== userIdFromToken) {
        return res.status(403).json({ error: "memberId không hợp lệ" });
    }

    const error = validateNotificationId(req.params);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    try {
        const notifications = await notificationService.getUserNotifications(memberId);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// DELETE /api/notifications/:id
async function deleteNotification(req, res) {
    const error = validateReservationId(req.params);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    try {
        const result = await notificationService.deleteNotification(req.params.id);
        if (!result) return res.status(404).json({ error: "Notification not found" });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createNotification,
    sendNotification,
    getUserNotifications,
    deleteNotification,
};
