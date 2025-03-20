const express = require('express');
const connection = require('../connection');
const router = express.Router();
require('dotenv').config();


// Get all home care services
router.get('/home-care', (req, res) => {
    const sql = "SELECT * FROM homecare";
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// Get a single home care service by ID
router.get('/home-care/:id', (req, res) => {
    const sql = "SELECT * FROM Homecare WHERE Hid = ?";
    connection.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Home Care Service not found" });
        res.json(result[0]);
    });
});

// Add a new home care service
router.post('/home-care', (req, res) => {
    const { Name, Location, Description } = req.body;
    if (!Name || !Location) return res.status(400).json({ message: "Name and Location are required" });

    const sql = "INSERT INTO Homecare (Name, Location, Description) VALUES (?, ?, ?)";
    connection.query(sql, [Name, Location, Description], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Home Care Service added", id: result.insertId });
    });
});

// Update a home care service
router.put('/home-care/:id', (req, res) => {
    const { Name, Location, Description } = req.body;
    const sql = "UPDATE Homecare SET Name = ?, Location = ?, Description = ? WHERE Hid = ?";
    connection.query(sql, [Name, Location, Description, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Home Care Service not found" });
        res.json({ message: "Home Care Service updated" });
    });
});

// Delete a home care service
router.delete('/home-care/:id', (req, res) => {
    const sql = "DELETE FROM Homecare WHERE Hid = ?";
    connection.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Home Care Service not found" });
        res.json({ message: "Home Care Service deleted" });
    });
});

module.exports = router;
