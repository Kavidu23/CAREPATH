const express = require('express');
const connection = require('../connection'); // MySQL connection
const { authenticateDoctor } = require('../services/doctorMiddleware'); // Import middleware
const router = express.Router();

// 1. Get clinics where the doctor is already registered
router.get('/registered', authenticateDoctor, (req, res) => {
    const { Did } = req.session.doctor; // Get doctor ID from session

    // Join clinic_doctor and Clinic tables to retrieve registered clinics
    const query = `
        SELECT Clinic.Cid, Clinic.Name, Clinic.Location, Clinic.Email, Clinic.Pnumber
        FROM clinic_doctor
        JOIN Clinic ON clinic_doctor.Cid = Clinic.Cid
        WHERE clinic_doctor.Did = ?`;

    connection.query(query, [Did], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json(results);
    });
});


// 2. Get new clinics based on doctor's location (where the doctor is NOT registered)
router.get('/new', authenticateDoctor, (req, res) => {
    const { Did } = req.session.doctor; // Get doctor ID from session

    // First, retrieve the doctor's location from the Doctor table
    const doctorQuery = `SELECT Location FROM Doctor WHERE Did = ?`;

    connection.query(doctorQuery, [Did], (err, doctorResults) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (doctorResults.length === 0) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        const location = doctorResults[0].Location;

        // Now, select clinics in that location where the doctor is not registered.
        // The subquery returns clinic IDs that the doctor is already linked with.
        const clinicsQuery = `
            SELECT Clinic.Cid, Clinic.Name, Clinic.Location, Clinic.Email, Clinic.Pnumber
            FROM Clinic
            WHERE Clinic.Location = ? 
              AND Clinic.Cid NOT IN (
                    SELECT Cid FROM clinic_doctor WHERE Did = ?
              )`;

        connection.query(clinicsQuery, [location, Did], (err, clinicResults) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err });
            }
            res.json(clinicResults);
        });
    });
});


//Get clinics by location
router.get('/location',(req,res)=>{
    const {location} = req.query;
    const query = `SELECT * FROM Clinic WHERE Location = ? `;
    connection.query(query,[location],(err,results)=>{
        if(err){
            return res.status(500).json({message:"Database error",error:err});
        }
        res.json(results);
    });
})



//Get all clinics
router.get('/all',(req,res)=>{
    const query = `SELECT * FROM Clinic`;
    connection.query(query,(err,results)=>{
        if(err){
            return res.status(500).json({message:"Database error",error:err});
        }
        res.json(results);
    });
})

module.exports = router;
