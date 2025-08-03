const mongoose = require('mongoose');

const RackSchema = new mongoose.Schema({
  number: String,
  locationIdentifier: String
}, { timestamps: true });

module.exports = mongoose.model('Rack', RackSchema);
