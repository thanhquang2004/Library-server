const mongoose = require("mongoose");
const AuditLog = require("./AuditLog");

const FineSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bookLending: { type: mongoose.Schema.Types.ObjectId, ref: "BookLending" },
  amount: Number,
  created: { type: Date, default: Date.now },
  reason: String,
  status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  isDeleted: { type: Boolean, default: false },
});

FineSchema.statics.logAction = async function (
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

module.exports = mongoose.model("Fine", FineSchema);
