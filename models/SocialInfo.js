const mongoose = require('mongoose');
const SocialInfoSchema = new mongoose.Schema({
  timestamp: { type: String, default: Date.now() },
  "Contract ID": {type: String, default: ''},
  Symbol: {type: String, default: ''},
  Saucerswap: {type: String, default: ''},
  Linktree: {type: String, default: ''},
  Website: {type: String, default: ''},
  Twitter: {type: String, default: ''},
  Discord: {type: String, default: ''},
  Telegram: {type: String, default: ''},
  Reddit: {type: String, default: ''},
  GitHub: {type: String, default: ''},
}, { timestamps: true });

module.exports = SocialInfo = mongoose.model('SocialInfo', SocialInfoSchema);
