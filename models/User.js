const mongoose = require("mongoose");

const LibraryCardSchema = new mongoose.Schema({
  cardNumber: String,
  issued: Date,
  active: { type: Boolean, default: true },
});

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    address: String,
    phone: String,
    role: {
      type: String,
      enum: ["member", "librarian", "admin"],
      default: "member",
    },
    dateOfMembership: Date,
    totalBooksCheckedOut: { type: Number, default: 0 },
    accountStatus: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    libraryCard: LibraryCardSchema,
    fines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fine" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
