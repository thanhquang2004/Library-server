const mongoose = require("mongoose");

const BookLendingSchema = new mongoose.Schema(
  {
    bookItem: { type: mongoose.Schema.Types.ObjectId, ref: "BookItem" },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    creationDate: Date,
    dueDate: Date,
    returnDate: Date,
    status: {
      type: String,
      enum: ["borrowed", "returned", "overdue"],
      default: "borrowed",
    },
    fines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fine" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookLending", BookLendingSchema);
