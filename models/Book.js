const mongoose = require("mongoose");
const AuditLog = require("./AuditLog");

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
    },
    categories: [
      {
        type: String,
      },
    ],
    publisher: {
      type: String,
    },
    publicationDate: {
      type: Date,
    },
    language: {
      type: String,
      default: "vi",
    },
    numberOfPages: {
      type: Number,
    },
    format: {
      type: String,
      enum: ["hardcover", "paperback", "ebook"],
    },
    authors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        required: true,
      },
    ],
    digitalUrl: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Tạo chỉ mục cho tìm kiếm nhanh
BookSchema.index({ title: "text", categories: "text" });

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
