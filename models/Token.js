const mongoose = require('mongoose');
const TokenSchema = new mongoose.Schema({
  timestamp: { type: String, default: Date.now() },
  id: {type: String, default: ''},
  decimals: {type: Number, default: 0},
  icon: {type: String, default: ''},
  name: {type: String, default: ''},
  price: {type: String, default: ''},
  priceUsd: {type: String, default: ''},
  symbol: {type: String, default: ''},
  dueDiligenceComplete: {type: Boolean, default: false},
  isFeeOnTransferToken: {type: Boolean, default: false},
  description: {type: String, default: ''},
  website: {type: String, default: ''},
  sentinelReport: {type: String, default: ''},
  twitterHandle: {type: String, default: ''},
  timestampSecondsLastListingChange: {type: Number, default: 0},
  dailyPriceChange: {type: String, default: ''},
  dailyVolume: {type: String, default: ''},
  liquidity: {type: String, default: ''},
  monthlyPrice: {type: Object, default: ''},
  marketcap: {type: Object, default: ''},
}, { timestamps: true });

module.exports = Token = mongoose.model('Token', TokenSchema);
