const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
    timestamp: { type: String, default: '' },
    accountId: {type: String, default: ''},
    tokenId: { type: String, default: '' },
    amount: { type: String, default: '' },
    state: { type: String, default: '' },
    datetime: { type: String, default: '' },
    transactionId: { type: String, default: '' },
}, { timestamps: true });

module.exports = Transaction = mongoose.model('Transaction', TransactionSchema);
