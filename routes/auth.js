const express = require('express');
const router = express.Router();

// Admin credentials
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin@123';

// Login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: 1,
                email: ADMIN_EMAIL,
                name: 'Admin',
                role: 'admin'
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// Verify token route (for future use)
router.get('/verify', (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        user: {
            id: 1,
            email: ADMIN_EMAIL,
            name: 'Admin',
            role: 'admin'
        }
    });
});

module.exports = router;
