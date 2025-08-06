const mongoose = require("mongoose");
const AuditLog = require("./AuditLog"); // Giả sử có model AuditLog

const LibraryCardSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issued: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }, // Hỗ trợ xóa mềm
  },
  { timestamps: true }
);

// Kiểm tra thẻ có hợp lệ không
LibraryCardSchema.statics.isValidCard = async function (cardNumber) {
  const card = await this.findOne({
    cardNumber,
    active: true,
    isDeleted: false,
  });
  return !!card;
};

// Tìm thẻ theo userId
LibraryCardSchema.statics.findByUser = async function (userId) {
  return await this.findOne({ user: userId, isDeleted: false });
};

// Ghi nhật ký hành động
LibraryCardSchema.statics.logAction = async function (
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

module.exports = mongoose.model("LibraryCard", LibraryCardSchema);
