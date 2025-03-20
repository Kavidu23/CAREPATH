const express = require('express');
const connection = require('../connection'); // Import connection
const { authenticateUser } = require('../services/userMiddleware'); // Import middleware
const router = express.Router();
require('dotenv').config();

// Get patient profile
router.get('/profile', authenticateUser, (req, res) => {
    if (!req.session.patient) return res.status(401).json({ message: "Unauthenticated" });

    const { Pid } = req.session.user;
    const query = `SELECT Pid, Fname, Lname, Gender,Image,TIMESTAMPDIFF(YEAR, Birthdate, CURDATE()) AS Age 
                   FROM Patient
                   JOIN Patient_Details ON Patient.Pid = Patient_Details.Pid
                   WHERE Patient.Pid = ?`;

    connection.query(query, [Pid], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results[0]);
    });
});

// Get upcoming appointments
router.get('/appointments/upcoming',authenticateUser, (req, res) => {
    const { Pid } = req.session.user;
    const query = `SELECT Appointment.Aid, Doctor.Fname AS DoctorName, Doctor.Lname, Doctor.Specialization, 
                          Appointment.Date, Appointment.Time, Appointment.Type 
                   FROM Appointment 
                   JOIN Doctor ON Appointment.Did = Doctor.Did
                   WHERE Appointment.Pid = ? AND Appointment.Date >= CURDATE() 
                   ORDER BY Appointment.Date, Appointment.Time`;

    connection.query(query, [Pid], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});

// Cancel an appointment
router.delete('/appointments/cancel/:Aid',authenticateUser, (req, res) => {
    const { Pid } = req.session.user;
    const { Aid } = req.params;
    
    const query = `DELETE FROM Appointment WHERE Aid = ? AND Pid = ?`;
    
    connection.query(query, [Aid, Pid], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Appointment not found" });
        res.json({ message: "Appointment canceled successfully" });
    });
});

// Get past appointments
router.get('/appointments/past',authenticateUser, (req, res) => {
    const { Pid } = req.session.user;
    const query = `SELECT Appointment.Aid, Doctor.Fname AS DoctorName, Doctor.Lname, Doctor.Specialization, 
                          Appointment.Date, Appointment.Time, Appointment.Type 
                   FROM Appointment 
                   JOIN Doctor ON Appointment.Did = Doctor.Did
                   WHERE Appointment.Pid = ? AND Appointment.Date < CURDATE() 
                   ORDER BY Appointment.Date DESC`;

    connection.query(query, [Pid], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});

// Reschedule an appointment
router.put('/appointments/reschedule/:Aid', authenticateUser, (req, res) => {
    const { Pid } = req.session.patient;
    const { Aid } = req.params;
    const { newDate, newTime } = req.body;

    const query = `UPDATE Appointment SET Date = ?, Time = ? WHERE Aid = ? AND Pid = ?`;

    connection.query(query, [newDate, newTime, Aid, Pid], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Appointment not found" });
        res.json({ message: "Appointment rescheduled successfully" });
    });
});

// Get reports (Appointments, Medical Records, Prescriptions, Invoices)
router.get('/reports', authenticateUser, (req, res) => {
    const { Pid } = req.session.patient;

    const queries = {
        appointments: `SELECT Aid, Date, Time, Type FROM Appointment WHERE Pid = ?`,
        medicalRecords: `SELECT Diagnosis, BloodType, MedicalHistory, Allergies FROM Record WHERE Pid = ?`,
        prescriptions: `SELECT Prescription.Rid, Duration, Frequency, Description, GROUP_CONCAT(Medicine.Name SEPARATOR ', ') AS Medicines
                        FROM Prescription
                        LEFT JOIN Prescription_Medicine ON Prescription.Rid = Prescription_Medicine.Rid
                        LEFT JOIN Medicine ON Prescription_Medicine.Mid = Medicine.Mid
                        WHERE Prescription.Pid = ?
                        GROUP BY Prescription.Rid`,
        invoices: `SELECT Id, TotalAmount, Discount, FinalAmount, PaymentMethod, IssuedDate, PaymentStatus FROM Invoice WHERE Pid = ?`
    };

    const results = {};

    connection.query(queries.appointments, [Pid], (err, appointments) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        results.appointments = appointments;
        
        connection.query(queries.medicalRecords, [Pid], (err, records) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            results.medicalRecords = records;

            connection.query(queries.prescriptions, [Pid], (err, prescriptions) => {
                if (err) return res.status(500).json({ message: "Database error", error: err });

                results.prescriptions = prescriptions;

                connection.query(queries.invoices, [Pid], (err, invoices) => {
                    if (err) return res.status(500).json({ message: "Database error", error: err });

                    results.invoices = invoices;
                    res.json(results);
                });
            });
        });
    });
});

module.exports = router;
