const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true }, // ví dụ: 'BORROW_BOOK'
  targetId: { type: String }, // id của tài nguyên bị tác động
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AuditLog", AuditLogSchema);
