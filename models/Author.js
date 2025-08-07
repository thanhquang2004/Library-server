const mongoose = require("mongoose");

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

module.exports = mongoose.model("Author", AuthorSchema);
