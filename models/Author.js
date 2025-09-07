const mongoose = require("mongoose");
const AuditLog = require("./AuditLog");

const AuthorSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    birthDate: Date,
    nationality: String,
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AuthorSchema.statics.logAction = async function (
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

module.exports = mongoose.model("Author", AuthorSchema);
