const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: String,
  subject: String,
  publisher: String,
  publicationDate: Date,
  language: String,
  numberOfPages: Number,
  format: { type: String, enum: ['paperback', 'hardcover', 'ebook'] },
  authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Author' }]
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
