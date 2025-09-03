const { AuditLog, User } = require("../models");
const createError = require("http-errors");

// Create an audit log (system-only)
async function createAuditLog({ userId, action, target, details }) {
  // Validate user existence
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    throw createError(404, "User not found");
  }

  // Validate target model if provided
  const validModels = [
    "User",
    "Library",
    "BookItem",
    "Payment",
    "Fine",
    "LibraryCard",
    "Rack",
    "Book",
    "Author",
    "BookLending",
    "BookReservation",
    "Category",
  ];
  if (target && target.model && !validModels.includes(target.model)) {
    throw createError(400, "Invalid target model");
  }

  // Create audit log
  const auditLog = await AuditLog.create({
    user: userId,
    action,
    target: target ? { id: target.id, model: target.model } : undefined,
    details,
    timestamp: new Date(),
  });

  return {
    auditLogId: auditLog._id,
    userId: auditLog.user,
    action: auditLog.action,
    target: auditLog.target,
    details: auditLog.details,
    timestamp: auditLog.timestamp,
  };
}

// Get audit logs by user ID
async function getAuditLogsByUser(userId, { page = 1, limit = 10 }) {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    throw createError(404, "User not found");
  }

  const auditLogs = await AuditLog.find({ user: userId })
    .populate("user", "name email role")
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await AuditLog.countDocuments({ user: userId });
  return { auditLogs, total, page: parseInt(page), limit: parseInt(limit) };
}

// Get audit logs by target model
async function getAuditLogsByModel(model, { page = 1, limit = 10 }) {
  const validModels = [
    "User",
    "Library",
    "BookItem",
    "Payment",
    "Fine",
    "LibraryCard",
    "Rack",
    "Book",
    "Author",
    "BookLending",
    "BookReservation",
    "Category",
  ];
  if (!validModels.includes(model)) {
    throw createError(400, "Invalid target model");
  }

  const auditLogs = await AuditLog.find({ "target.model": model })
    .populate("user", "name email role")
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await AuditLog.countDocuments({ "target.model": model });
  return { auditLogs, total, page: parseInt(page), limit: parseInt(limit) };
}

// Get all audit logs with filters
async function getAllAuditLogs({
  userId,
  model,
  action,
  startDate,
  endDate,
  page = 1,
  limit = 10,
}) {
  const query = {};

  // Filter by user
  if (userId) {
    const user = await User.findOne({ _id: userId, isDeleted: false });
    if (!user) {
      throw createError(404, "User not found");
    }
    query.user = userId;
  }

  // Filter by model
  if (model) {
    const validModels = [
      "User",
      "Library",
      "BookItem",
      "Payment",
      "Fine",
      "LibraryCard",
      "Rack",
      "Book",
      "Author",
      "BookLending",
      "BookReservation",
      "Category",
    ];
    if (!validModels.includes(model)) {
      throw createError(400, "Invalid target model");
    }
    query["target.model"] = model;
  }

  // Filter by action
  if (action) {
    query.action = action;
  }

  // Filter by date range
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
  }

  // Query DB
  const auditLogs = await AuditLog.find(query)
    .populate("user", "name email role")
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await AuditLog.countDocuments(query);

  return { auditLogs, total, page: parseInt(page), limit: parseInt(limit) };
}

module.exports = {
  createAuditLog,
  getAuditLogsByUser,
  getAuditLogsByModel,
  getAllAuditLogs,
};
