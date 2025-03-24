const express = require('express');
const router = express.Router();
require('dotenv').config();

// Check if the user session exists
router.get('/check-user-session', (req, res) => {
    try {
        if (!req.session) {
            throw new Error('Session middleware not configured');
        }
        if (req.session.user && typeof req.session.user === 'object') {
            res.status(200).json({ loggedIn: true, user: req.session.user });
        } else {
            res.status(200).json({ loggedIn: false });
        }
    } catch (error) {
        console.error('Error in check-user-session:', error.message);
        res.status(500).json({ loggedIn: false, error: 'Internal server error' });
    }
});

// Check if the doctor session exists
router.get('/check-doctor-session', (req, res) => {
    try {
        if (!req.session) {
            throw new Error('Session middleware not configured');
        }
        if (req.session.doctor && typeof req.session.doctor === 'object') {
            res.status(200).json({ loggedIn: true, doctor: req.session.doctor });
        } else {
            res.status(200).json({ loggedIn: false });
        }
    } catch (error) {
        console.error('Error in check-doctor-session:', error.message);
        res.status(500).json({ loggedIn: false, error: 'Internal server error' });
    }
});

module.exports = router;