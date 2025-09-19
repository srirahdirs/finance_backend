const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');

// Clear all data (for testing purposes)
router.delete('/clear-all-data', async (req, res) => {
    try {
        // Delete all transactions first (due to foreign key constraints)
        await Transaction.deleteMany({});

        // Delete all loans
        await Loan.deleteMany({});

        // Delete all clients
        await Client.deleteMany({});

        res.json({
            success: true,
            message: 'All data cleared successfully!',
            deleted: {
                transactions: 'All transactions deleted',
                loans: 'All loans deleted',
                clients: 'All clients deleted'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get data summary (to check what's in the database)
router.get('/data-summary', async (req, res) => {
    try {
        const clientsCount = await Client.countDocuments();
        const loansCount = await Loan.countDocuments();
        const transactionsCount = await Transaction.countDocuments();

        res.json({
            summary: {
                clients: clientsCount,
                loans: loansCount,
                transactions: transactionsCount
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
