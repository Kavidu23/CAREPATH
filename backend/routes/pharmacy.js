const express = require('express');
const connection = require('../connection');
const router = express.Router();
require('dotenv').config();

//add pharmacy
router.post('/pharmacies', (req, res) => {
    const { name, location, description, wLink } = req.body;

    if (!name || !location) {
        return res.status(400).json({ message: "Name and location are required" });
    }

    const query = 'INSERT INTO MedicineSupplier (Name, Location, Description, WLink) VALUES (?, ?, ?, ?)';
    const values = [name, location, description || null, wLink || null];

    connection.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(201).json({ message: "Pharmacy added successfully", msId: results.insertId });
    });
});

//update pharmacy
router.put('/pharmacies/:msId', (req, res) => {
    const { msId } = req.params;
    const { name, location, description, wLink } = req.body;

    const query = `
        UPDATE MedicineSupplier 
        SET Name = ?, Location = ?, Description = ?, WLink = ? 
        WHERE MsId = ?`;

    const values = [name, location, description, wLink, msId];

    connection.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Pharmacy not found" });
        }
        res.json({ message: "Pharmacy updated successfully" });
    });
});


//delete pharmacy
router.delete('/pharmacies/:msId', (req, res) => {
    const { msId } = req.params;

    const query = 'DELETE FROM MedicineSupplier WHERE MsId = ?';

    connection.query(query, [msId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Pharmacy not found" });
        }
        res.json({ message: "Pharmacy deleted successfully" });
    });
});


// get all pharmacies
router.get('/all', (req, res) => {
    const query = 'SELECT * FROM MedicineSupplier';

    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json(results);
    });
});

module.exports = router;    // Export router