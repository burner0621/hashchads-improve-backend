const mongoose = require('mongoose');
const PriceChangeSchema = new mongoose.Schema({
  timestamp: { type: String, default: Date.now() },
  tokenId: {type: String, default: ''},
  value: {type: Number, default: 0},
}, { timestamps: true });

module.exports = PriceChange = mongoose.model('PriceChange', PriceChangeSchema);
