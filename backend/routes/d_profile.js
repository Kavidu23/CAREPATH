const express = require('express');
const connection = require('../connection'); // Import connection
const { authenticateDoctor } = require('../services/doctorMiddleware'); // Import middleware
const { authenticateAdmin } = require('../services/adminMiddleware'); // Import middleware
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config();
const session = require('express-session');

// Setup session middleware
router.use(session({
    secret: process.env.SESSION_SECRET, // Store a secret in your .env file
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if you're using HTTPS
}));

// Get doctor profile
router.get('/profile', authenticateDoctor, (req, res) => {
    console.log('Session Data:', req.session.doctor); // Check session content
    if (!req.session.doctor) return res.status(401).json({ message: "Unauthenticated" });
    const { Did } = req.session.doctor;
    const query = `
        SELECT Doctor.Did, Fname, Lname, Image, Doctor_Specialization.Specialization
        FROM Doctor JOIN Doctor_Specialization ON Doctor.Did = Doctor_Specialization.Did
        WHERE Doctor.Did = ?`;
    connection.query(query, [Did], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results[0]);
    });
});

// Get doctor's clinics and availability
router.get('/clinics', authenticateDoctor, (req, res) => {
    const { Did } = req.session.doctor;
    const query = `
        SELECT Clinic.Name, Clinic.Location, clinic_doctor.CCid
        FROM clinic_doctor
        JOIN Clinic ON clinic_doctor.Cid = Clinic.Cid
        WHERE clinic_doctor.Did = ?`;
    
    connection.query(query, [Did], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});

// Get doctor’s financial statistics
router.get('/statistics', authenticateDoctor, (req, res) => {
    const { Did } = req.session.doctor;
    const query = `
        SELECT SUM(FinalAmount) AS TotalBalance,
               SUM(CASE WHEN PaymentStatus = 'Paid' THEN FinalAmount ELSE 0 END) AS Earned,
               SUM(CASE WHEN PaymentStatus = 'Pending' THEN FinalAmount ELSE 0 END) AS Requested
        FROM Invoice
        WHERE Pid IN (SELECT Pid FROM Appointment WHERE Did = ?)`;

    connection.query(query, [Did], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results[0]);
    });
});

// Get doctor's appointments
router.get('/appointments', authenticateDoctor,(req, res) => {
    const { Did } = req.session.doctor;
    const query = `
        SELECT Appointment.Aid, Patient.Fname, Patient.Lname, Appointment.Date, Appointment.Time, Appointment.Type, Appointment.Did
        FROM Appointment
        JOIN Patient ON Appointment.Pid = Patient.Pid
        WHERE Appointment.Did = ?
        ORDER BY Appointment.Date DESC, Appointment.Time DESC`;

    connection.query(query, [Did], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});

// Get doctor’s bank details
router.get('/bank-details', authenticateDoctor,(req, res) => {
    const { Did } = req.session.doctor;
    const query = `SELECT * FROM Accounts WHERE Aid = (SELECT Aid FROM Doctor WHERE Did = ?)`;

    connection.query(query, [Did], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results[0] || {});
    });
});

// Update doctor’s bank details
router.put('/bank-details', authenticateDoctor, (req, res) => {
    const { Did } = req.session.doctor;
    const { BankName, BNumber, Location } = req.body;

    const query = `UPDATE Accounts SET BankName = ?, BNumber = ?, Location = ? WHERE Aid = (SELECT Aid FROM Doctor WHERE Did = ?)`;
    connection.query(query, [BankName, BNumber, Location, Did], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json({ message: "Bank details updated successfully" });
    });
});

// Get medical records
router.get('/medical-records', authenticateDoctor,(req, res) => {
    const { Did } = req.session.doctor;
    const query = `
        SELECT Record.Rid, Patient.Fname, Patient.Lname, Record.Diagnosis, Record.BloodType, Record.MedicalHistory, Record.Allergies, Record.CreatedAt
        FROM Record
        JOIN Patient ON Record.Pid = Patient.Pid
        WHERE Record.Pid IN (SELECT Pid FROM Appointment WHERE Did = ?)
        ORDER BY Record.CreatedAt DESC`;

    connection.query(query, [Did], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});

// Get prescriptions
router.get('/prescriptions', authenticateDoctor, (req, res) => {
    const { Did } = req.session.doctor;
    const query = `
        SELECT Prescription.Rid, Patient.Fname, Patient.Lname, Prescription.Duration, Prescription.Frequency, Prescription.Description
        FROM Prescription
        JOIN Patient ON Prescription.Pid = Patient.Pid
        WHERE Prescription.Did = ?
        ORDER BY Prescription.Rid DESC`;

    connection.query(query, [Did], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});

// Get invoices
router.get('/invoices', authenticateDoctor,(req, res) => {
    const { Did } = req.session.doctor;
    const query = `
        SELECT Invoice.Id, Patient.Fname, Patient.Lname, Invoice.TotalAmount, Invoice.Discount, Invoice.FinalAmount, Invoice.PaymentMethod, Invoice.IssuedDate, Invoice.PaymentStatus
        FROM Invoice
        JOIN Patient ON Invoice.Pid = Patient.Pid
        WHERE Invoice.Pid IN (SELECT Pid FROM Appointment WHERE Did = ?)
        ORDER BY Invoice.IssuedDate DESC`;

    connection.query(query, [Did], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});

router.get('/today_patients', async (req, res) => {
    try {
      // Log session data to check if the doctor data is available
      console.log('Session data:', req.session);
  
      if (!req.session.doctor) {
        return res.status(400).json({ error: 'Doctor data not found in session' });
      }
  
      const { Did } = req.session.doctor;  // Assuming doctorId is stored in session
      if (!Did) {
        return res.status(400).json({ error: 'Doctor ID not found in session' });
      }
  
      const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
      const query = `
        SELECT COUNT(DISTINCT Pid) as total_patients
        FROM appointment
        WHERE Did = ? AND DATE(Date) = ?
      `;
  
      console.log('Executing query with Did:', Did, 'and today:', today); // Log query parameters
  
      // Use connection.query instead of db.query
      connection.query(query, [Did, today], (err, result) => {
        if (err) {
          console.error('Error executing query:', err);  // Log error
          return res.status(500).json({ error: 'Database error', message: err.message });
        }
  
        console.log('Query result:', result);  // Log the result
  
        if (!result || result.length === 0) {
          return res.status(404).json({ error: 'No data found for today\'s patients' });
        }
  
        res.json({ total_patients: result[0]?.total_patients || 0 });
      });
    } catch (error) {
      console.error('Error fetching today\'s patients:', error);  // Log the full error
      res.status(500).json({ error: 'Internal Server Error', message: error.message }); // Return error message
    }
  });
  
  
module.exports = router;
