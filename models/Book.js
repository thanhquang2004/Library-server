const mongoose = require("mongoose");
const AuditLog = require("./AuditLog");

const BookSchema = new mongoose.Schema(
  {
    isbn: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    authors: [
      {
        type: String,
        required: true,
      },
    ],
    publisher: {
      type: String,
    },
    publicationDate: {
      type: Date,
    },
    edition: {
      type: Number,
    },
    categories: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Tạo chỉ mục cho tìm kiếm nhanh
BookSchema.index({ title: "text", authors: "text", categories: "text" });

// Ghi nhật ký hành động
BookSchema.statics.logAction = async function (
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

module.exports = mongoose.model("Book", BookSchema);
