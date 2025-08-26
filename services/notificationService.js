const Notification = require("../models/Notification");

async function createNotification({ memberId, content, type }) {
    const notification = await Notification.create({
        member: memberId,
        content,
        type,
        status: "pending",
    });

    return {
        notificationId: notification._id,
        content: notification.content,
        type: notification.type,
        status: notification.status,
    };
}

async function sendNotification(id) {
    const notification = await Notification.findById(id);
    if (!notification) return null;

    notification.status = "sent";
    await notification.save();

    return {
        notificationId: notification._id,
        status: notification.status,
    };
}

async function getUserNotifications(memberId) {
    const notifications = await Notification.find({ member: memberId, isDeleted: false, status: "sent" });
    return notifications.map((n) => ({
        notificationId: n._id,
        content: n.content,
        type: n.type,
        status: n.status,
    }));
}

async function deleteNotification(id) {
    const notification = await Notification.findById(id);
    if (!notification) return null;

    notification.isDeleted = true;
    await notification.save();

    return { message: "Notification deleted" };
}

module.exports = {
    createNotification,
    sendNotification,
    getUserNotifications,
    deleteNotification,
};
