const mongoose = require('mongoose');

const FineSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bookLending: { type: mongoose.Schema.Types.ObjectId, ref: 'BookLending' },
  amount: Number,
  created: { Date, default: Date.now },
  reason: String,
  status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' }
});

module.exports = mongoose.model('Fine', FineSchema);
