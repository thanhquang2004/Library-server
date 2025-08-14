const mongoose = require("mongoose");
const AuditLog = require("./AuditLog");

const RackSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: String,
    },
    capacity: {
      type: Number,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Tạo chỉ mục cho truy vấn nhanh
RackSchema.index({ library: 1 });

// Ghi nhật ký hành động
RackSchema.statics.logAction = async function (
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

module.exports = mongoose.model("Rack", RackSchema);
