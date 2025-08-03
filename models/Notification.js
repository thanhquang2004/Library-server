const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  content: String,
  created: { type: Date, default: Date.now },
  type: { type: String, enum: ['email', 'postal'] },
  email: String,
  address: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
