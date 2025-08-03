const mongoose = require('mongoose');

const BookReservationSchema = new mongoose.Schema({
  bookItem: { type: mongoose.Schema.Types.ObjectId, ref: 'BookItem' },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creationDate: Date,
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('BookReservation', BookReservationSchema);
