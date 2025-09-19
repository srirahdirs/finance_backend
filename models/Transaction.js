const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    loan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    type: {
        type: String,
        enum: ['interest', 'principal', 'pre_close', 'renewal'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'cheque'],
        default: 'cash'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
