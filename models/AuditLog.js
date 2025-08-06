const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    target: {
      id: { type: mongoose.Schema.Types.ObjectId },
      model: { type: String },
    },
    details: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Tạo chỉ mục cho các trường thường xuyên truy vấn
AuditLogSchema.index({ user: 1, timestamp: -1 });
AuditLogSchema.index({ "target.model": 1, timestamp: -1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
