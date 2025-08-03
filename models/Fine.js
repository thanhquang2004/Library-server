const mongoose = require('mongoose');

const FineSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bookLending: { type: mongoose.Schema.Types.ObjectId, ref: 'BookLending' },
  amount: Number,
  status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Fine', FineSchema);
