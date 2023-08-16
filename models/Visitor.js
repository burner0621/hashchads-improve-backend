const mongoose = require('mongoose');
const VisitorSchema = new mongoose.Schema({
    timestamp: { type: String, default: '' },
    count: {type: Number, default: ''},
}, { timestamps: true });

module.exports = Visitor = mongoose.model('Visitor', VisitorSchema);
