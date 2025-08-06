const mongoose = require("mongoose");

const BookItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    barcode: {
      type: String,
      unique: true,
    },
    isReferenceOnly: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["available", "loaned", "reserved"],
      default: "available",
    },
    dateOfPurchase: {
      type: Date,
      default: Date.now,
    },
    rack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rack",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

BookItemSchema.index({ book: 1, status: 1 });

module.exports = mongoose.model("BookItem", BookItemSchema);
