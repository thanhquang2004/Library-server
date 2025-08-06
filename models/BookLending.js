const mongoose = require("mongoose");
const AuditLog = require("./AuditLog");

const BookLendingSchema = new mongoose.Schema(
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
    fines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fine",
      },
    ],
    creationDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["borrowed", "returned", "overdue"],
      default: "borrowed",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Tạo chỉ mục cho truy vấn nhanh
BookLendingSchema.index({ member: 1, creationDate: -1 });
BookLendingSchema.index({ bookItem: 1, status: 1 });

// Kiểm tra trạng thái quá hạn
BookLendingSchema.methods.isOverdue = function () {
  return this.status === "borrowed" && new Date() > this.dueDate;
};

// Ghi nhật ký hành động
BookLendingSchema.statics.logAction = async function (
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

module.exports = mongoose.model("BookLending", BookLendingSchema);
