const mongoose = require("mongoose");
const AuditLog = require("./AuditLog");

const LibrarySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    address: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LibrarySchema.statics.logAction = async function (
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

module.exports = mongoose.model("Library", LibrarySchema);
