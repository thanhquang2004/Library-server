const mongoose = require("mongoose");

const LibrarySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

LibrarySchema.index({ name: 1 });

module.exports = mongoose.model("Library", LibrarySchema);
