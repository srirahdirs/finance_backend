const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Get all transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('client', 'name email')
            .populate('loan', 'loanAmount interestRate')
            .sort({ transactionDate: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get transactions by client
router.get('/client/:clientId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ client: req.params.clientId })
            .populate('loan', 'loanAmount interestRate')
            .sort({ transactionDate: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get transactions by loan
router.get('/loan/:loanId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ loan: req.params.loanId })
            .populate('client', 'name email')
            .sort({ transactionDate: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get income summary
router.get('/summary/income', async (req, res) => {
    try {
        const incomeTransactions = await Transaction.find({ type: 'interest' });
        const totalIncome = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

        res.json({
            totalIncome,
            transactionCount: incomeTransactions.length,
            monthlyIncome: incomeTransactions.filter(t => {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return t.transactionDate >= monthAgo;
            }).reduce((sum, transaction) => sum + transaction.amount, 0)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
