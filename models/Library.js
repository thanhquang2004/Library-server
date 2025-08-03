const mongoose = require('mongoose');

const LibrarySchema = new mongoose.Schema({
  name: String,
  address: String
}, { timestamps: true });

module.exports = mongoose.model('Library', LibrarySchema);
