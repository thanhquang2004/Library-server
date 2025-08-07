const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  fine: { type: mongoose.Schema.Types.ObjectId, ref: "Fine", required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["cash", "credit", "online"], required: true },
  paidDate: { type: Date, default: Date.now },
  transactionId: String,
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Payment", PaymentSchema);
