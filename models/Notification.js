const mongoose = require("mongoose");
const AuditLog = require("./AuditLog");

const NotificationSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    created: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["email", "sms", "postal"],
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Tạo chỉ mục cho truy vấn nhanh
NotificationSchema.index({ member: 1, created: -1 });

// Ghi nhật ký hành động
NotificationSchema.statics.logAction = async function (
  userId,
  action,
  target,
  details
) {
  await AuditLog.create({
    user: userId,
    action,
    target,
    details,
    timestamp: new Date(),
  });
};

module.exports = mongoose.model("Notification", NotificationSchema);
