const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Client = require('../models/Client');
const Transaction = require('../models/Transaction');

// Create new loan
router.post('/', async (req, res) => {
    try {
        const { clientId, loanAmount, interestRate, notes } = req.body;

        const monthlyInterest = (loanAmount * interestRate) / 100;

        const loan = new Loan({
            client: clientId,
            loanAmount,
            interestRate,
            monthlyInterest,
            remainingAmount: loanAmount,
            notes
        });

        await loan.save();
        await loan.populate('client');

        res.status(201).json(loan);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all loans
router.get('/', async (req, res) => {
    try {
        const loans = await Loan.find().populate('client');
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get loan by ID
router.get('/:id', async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id).populate('client');
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }
        res.json(loan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Collect interest payment
router.post('/:id/collect-interest', async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        const {
            paymentMethod = 'cash',
            collectedAmount = loan.monthlyInterest,
            collectionDate = new Date(),
            notes = ''
        } = req.body;

        // Create detailed transaction record
        const numericAmount = parseFloat(collectedAmount);
        const transaction = new Transaction({
            loan: loan._id,
            client: loan.client,
            type: 'interest',
            amount: numericAmount,
            description: `Interest collection - ₹${numericAmount}${notes ? ` (${notes})` : ''}`,
            paymentMethod: paymentMethod,
            transactionDate: collectionDate
        });

        await transaction.save();

        // Update loan with collected amount
        loan.totalCollected += numericAmount;
        loan.remainingAmount -= numericAmount;
        await loan.save();

        res.json({
            success: true,
            message: 'Interest collected successfully',
            transaction,
            loan
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Pre-close loan
router.post('/:id/pre-close', async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        const {
            paymentMethod = 'cash',
            finalAmount,
            penaltyAmount = 0,
            discountAmount = 0,
            notes = ''
        } = req.body;

        // Create detailed transaction record
        const transaction = new Transaction({
            loan: loan._id,
            client: loan.client,
            type: 'pre_close',
            amount: finalAmount || loan.remainingAmount,
            description: `Pre-close loan - ₹${finalAmount || loan.remainingAmount}${penaltyAmount > 0 ? ` (Penalty: ₹${penaltyAmount})` : ''}${discountAmount > 0 ? ` (Discount: ₹${discountAmount})` : ''}`,
            paymentMethod: paymentMethod,
            notes: notes
        });

        await transaction.save();

        // Update loan status
        loan.status = 'closed';
        loan.remainingAmount = 0;
        loan.notes = notes || loan.notes;
        await loan.save();

        res.json({
            success: true,
            message: 'Loan pre-closed successfully',
            transaction,
            loan
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Renew loan
router.post('/:id/renew', async (req, res) => {
    try {
        const oldLoan = await Loan.findById(req.params.id);
        if (!oldLoan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        const { loanAmount, interestRate, notes } = req.body;
        const monthlyInterest = (loanAmount * interestRate) / 100;

        const newLoan = new Loan({
            client: oldLoan.client,
            loanAmount,
            interestRate,
            monthlyInterest,
            remainingAmount: loanAmount,
            notes: notes || 'Renewed loan'
        });

        await newLoan.save();

        oldLoan.status = 'renewed';
        await oldLoan.save();

        await newLoan.populate('client');
        res.json(newLoan);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
