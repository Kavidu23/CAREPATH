const express = require('express');
const connection = require('../connection'); // Import connection
const { authenticateDoctor } = require('../services/doctorMiddleware'); // Import middleware
const { authenticateAdmin } = require('../services/adminMiddleware'); // Import middleware
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { authenticateUser } = require('../services/userMiddleware');
require('dotenv').config();


router.get('/search', (req, res) => {
    const { type, date, location } = req.query;

    let query = `
        SELECT d.Did, d.Fname, d.Lname, d.Gender, d.ConsultationType, d.ConsultationFee, 
               d.Availability, d.Image, d.YearExperience, d.Status, d.Location, ds.Specialization 
        FROM Doctor d
        LEFT JOIN Doctor_Specialization ds ON d.Did = ds.Did
        WHERE 1=1`;
    
    let params = [];

    // Handle the type search with LIKE for partial matches
    if (type) {
        query += ` AND ds.Specialization LIKE ?`;
        params.push(`%${type}%`);
    }

    // Handle the date search (assuming it's in a valid format for the query)
    if (date) {
        query += ` AND d.Availability LIKE ?`;
        params.push(`%${date}%`);
    }

    // Handle the location search
    if (location) {
        query += ` AND d.Location LIKE ?`;
        params.push(`%${location}%`);
    }

    // Execute the query
    connection.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});



//Book appointment
router.post('/appointment', authenticateUser, (req, res) => {
    const { Did, date, time, type } = req.body;
    if (!Did || !date || !time || !type) return res.status(400).json({ message: "Missing fields" });
    if(!req.session.user) return res.status(401).json({ message: "Unauthorized" }); // Check if user is logged in
    const Pid = req.session.user.id;

    const query = "INSERT INTO Appointment (Pid, Did, Date, Time, Type) VALUES (?, ?, ?, ?, ?)";
    connection.query(query, [Pid, Did, date, time, type], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json({ message: "Appointment booked successfully", appointmentId: result.insertId });
    });
});

//List doctors by specialization
router.get('/specialization', (req, res) => {
    const query = `
        SELECT d.Did, d.Fname, d.Lname, d.Image, s.Specialization 
        FROM Doctor d
        JOIN Doctor_Specialization s ON d.Did = s.Did
        WHERE d.Status = 1
    `;

    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});

//Get newly registered active doctors
router.get('/newly-registered', (req, res) => {
    const query = `
        SELECT d.Fname, d.Lname, d.Image, s.Specialization 
        FROM Doctor d
        JOIN Doctor_Specialization s ON d.Did = s.Did
        WHERE d.Status = 1
        ORDER BY d.CreatedAt DESC
        LIMIT 10
    `;

    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});

//Get feedbacks
router.get('/feedback', (req, res) => {
    const query = `
        SELECT f.Message, f.Rating, p.Fname, p.Lname, p.Image 
        FROM Feedback f
        JOIN Patient p ON f.Pid = p.Pid
    `;

    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});


//Get Dashboard Statistics
router.get('/dashboard-status', (req, res) => {
    const queries = {
        doctors: "SELECT COUNT(*) AS totalDoctors FROM Doctor",
        specializations: "SELECT COUNT(DISTINCT Specialization) AS totalSpecializations FROM Doctor_Specialization",
        bookings: "SELECT COUNT(*) AS totalBookings FROM Appointment"
    };

    let results = {};

    connection.query(queries.doctors, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        results.doctors = result[0].totalDoctors;

        connection.query(queries.specializations, (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            results.specializations = result[0].totalSpecializations;

            connection.query(queries.bookings, (err, result) => {
                if (err) return res.status(500).json({ message: "Database error", error: err });
                results.bookings = result[0].totalBookings;
                res.json(results);
            });
        });
    });
});

// Get doctor counts for each specialty
router.get('/doctor-counts', (req, res) => {
    const query = `
        SELECT ds.Specialization, COUNT(d.Did) AS doctorCount
        FROM Doctor d
        JOIN Doctor_Specialization ds ON d.Did = ds.Did
        WHERE d.Status = 1  -- Only active doctors
        GROUP BY ds.Specialization
    `;

    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});





module.exports = router;    // Export router