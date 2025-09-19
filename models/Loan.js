const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    loanAmount: {
        type: Number,
        required: true,
        min: 0
    },
    interestRate: {
        type: Number,
        required: true,
        min: 0
    },
    monthlyInterest: {
        type: Number,
        required: true
    },
    loanDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'renewed'],
        default: 'active'
    },
    totalCollected: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Loan', loanSchema);
