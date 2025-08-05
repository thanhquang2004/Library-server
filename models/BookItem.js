const mongoose = require('mongoose');

const BookItemSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  barcode: String,
  isReferenceOnly: { type: Boolean, default: false },
  price: Number,
  status: { type: String, enum: ['available', 'reserved', 'loaned', 'lost'], default: 'available' },
  dateOfPurchase: Date,
  rack: {
    rack: { type: mongoose.Schema.Types.ObjectId, ref: 'Rack' }
  }
}, { timestamps: true });

module.exports = mongoose.model('BookItem', BookItemSchema);
