const mongoose = require("mongoose");
const AuditLog = require("./AuditLog");

const BookReservationSchema = new mongoose.Schema(
  {
    bookItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookItem",
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creationDate: {
      type: Date,
      default: Date.now,
    },
    reservationDate: {
      type: Date,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "expired"],
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
BookReservationSchema.index({ member: 1, reservationDate: -1 });
BookReservationSchema.index({ bookItem: 1, status: 1 });

// Kiểm tra trạng thái hết hạn
BookReservationSchema.methods.isExpired = function () {
  return this.status === "pending" && new Date() > this.expirationDate;
};

// Ghi nhật ký hành động
BookReservationSchema.statics.logAction = async function (
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

module.exports = mongoose.model("BookReservation", BookReservationSchema);
