const express = require('express');
const connection = require('../connection'); // Import connection
const { authenticateDoctor } = require('../services/doctorMiddleware'); // Import middleware
const { authenticateAdmin } = require('../services/adminMiddleware'); // Import middleware
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Signup doctor
router.post('/signup', async (req, res) => {
    const {
        Fname, Lname, Pnumber, Email, Password, Gender, ConsultationType,
        ConsultationFee, Availability, Image, YearExperience, Location, Degree, Specialization
    } = req.body;

    if (!Fname || !Lname || !Pnumber || !Email || !Password || !Gender || !ConsultationType || 
        !ConsultationFee || !Availability || !Image || !YearExperience || !Location || !Degree || !Specialization) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(Password, 10);

        // Insert doctor details into the Doctor table
        const doctorQuery = "INSERT INTO Doctor (Fname, Lname, Pnumber, Email, Password, Gender, ConsultationType, ConsultationFee, Availability, Image, YearExperience, Location, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        connection.query(
            doctorQuery, 
            [Fname, Lname, Pnumber, Email, hashedPassword, Gender, ConsultationType, ConsultationFee, Availability, Image, YearExperience, Location, 0],  // Setting Status to 0
            (err, result) => {
                if (err && err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: "Email or Phone number already exists" });
                }

                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: "Database error", error: err });
                }

                const doctorId = result.insertId;  // Get the inserted doctor ID

                // Insert degree into Doctor_Degree table
                const degrees = Degree.split(',').map(degree => degree.trim());
                const degreeQuery = "INSERT INTO Doctor_Degree (Did, Degree) VALUES ?";
                const degreeValues = degrees.map(degree => [doctorId, degree]);

                connection.query(degreeQuery, [degreeValues], (err) => {
                    if (err) {
                        console.error("Error inserting degrees:", err);
                        return res.status(500).json({ message: "Error inserting degrees", error: err });
                    }

                    // Insert specialization into Doctor_Specialization table
                    const specializations = Specialization.split(',').map(spec => spec.trim());
                    const specializationQuery = "INSERT INTO Doctor_Specialization (Did, Specialization) VALUES ?";
                    const specializationValues = specializations.map(spec => [doctorId, spec]);

                    connection.query(specializationQuery, [specializationValues], (err) => {
                        if (err) {
                            console.error("Error inserting specializations:", err);
                            return res.status(500).json({ message: "Error inserting specializations", error: err });
                        }

                        res.status(201).json({ message: "Doctor registered successfully" });
                    });
                });
            }
        );
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

//Login doctor
router.post('/login', async (req, res) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return res.status(409).json({ message: "Email and password are required" });
    }

    try {
        // Querying the database for the doctor with the given email
        const query = "SELECT * FROM Doctor WHERE Email = ?";
        connection.query(query, [Email], async (err, results) => {
            if(req.session.doctor){
                return res.status(400).json({ message: "Doctor already logged in" });
            }
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const doctor = results[0];
            const isPasswordValid = await bcrypt.compare(Password, doctor.Password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            // Store only necessary information in the session
            req.session.doctor = {
                Did: doctor.Did,  // assuming Did is the Doctor's ID
                Email: doctor.Email,
                Fname: doctor.Fname,
                Lname: doctor.Lname,
            };

            res.json({ message: "Login successful" , doctor: req.session.doctor});
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


//Logout doctor
router.get('/logout', authenticateDoctor, (req, res) => {
    if(!req.session.doctor){
        return res.status(400).json({ message: "You have not logged in" });
    }
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).json({ message: "Server error" });
        }

        res.clearCookie('connect.sid');
        res.json({ message: "Logout successful" });
    });
});

//delete doctor
router.delete('/delete', authenticateDoctor,authenticateAdmin, (req, res) => {
    const { Did } = req.session.doctor;
    if (!Did) {
        return res.status(400).json({ message: "Doctor ID is required" });
    }

    const query = "DELETE FROM Doctor WHERE Did = ?";
    connection.query(query, [Did], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        res.json({ message: "Doctor deleted successfully" });
    });
});



//update phone number
router.put('/update/phone', authenticateDoctor, (req, res) => {
    console.log("Session doctor object:", req.session.doctor); // Debugging session data
    console.log("Extracted Email:", req.session.doctor?.Email);

    const { Pnumber } = req.body;
    if (!req.session.doctor) {
        return res.status(400).json({ message: "You have not logged in" });
    }
    const { Email } = req.session.doctor;

    if (!Pnumber) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    const query = "UPDATE Doctor SET Pnumber = ? WHERE Email = ?";
    connection.query(query, [Pnumber, Email], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        console.log("Update query executed. Affected rows:", result.affectedRows); // Log affected rows

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Doctor not found (Update failed)" });
        }

        res.json({ message: "Phone number updated successfully" });
    });
});


//Activate doctor
router.put('/activate',authenticateAdmin,(req, res) => {
    const { Did } = req.body;

    const query = "UPDATE Doctor SET Status = '1' WHERE Did = ?";
    connection.query(query, [Did], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        res.json({ message: "Doctor account activated successfully" });
    });
});


//Deactivate doctor
router.put('/deactivate', authenticateAdmin, (req, res) => {
    const { Did } = req.params;

    const query = "UPDATE Doctor SET Status = '0' WHERE Did = ?";
    connection.query(query, [Did], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        res.json({ message: "Doctor account deactivated successfully" });
    });
});

//Get doctor profile
router.get('/profile', authenticateAdmin, (req, res) => {
    const { Did } = req.session.doctor;

    const query = "SELECT Fname, Lname, Pnumber, Email, Gender, ConsultationType, ConsultationFee, Availability, Image, YearExperience, Location,Degree, Specialization FROM Doctor WHERE Did = ?";
    connection.query(query, [Did], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        res.json(result[0]);
    });
});


//Get all doctors
router.get('/all', authenticateAdmin, (req, res) => {
    const query = "SELECT Did, Fname, Lname, Email, Pnumber, Status, Specialization FROM Doctor";

    connection.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json(results);
    });
});


//Update doctor consultation fee
router.put('/update/fee', authenticateDoctor, (req, res) => {
    const { ConsultationFee } = req.body;
    const { Email } = req.session.doctor;

    if (!ConsultationFee) {
        return res.status(400).json({ message: "Consultation fee is required" });
    }

    const query = "UPDATE Doctor SET ConsultationFee = ? WHERE Email = ?";
    connection.query(query, [ConsultationFee, Email], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        res.json({ message: "Consultation fee updated successfully" });
    });
});

//Get patient report
router.get('/reports',authenticateDoctor,(req, res) => {
    if(!req.session.doctor) {
        return res.status(401).json({ message: "Unauthorized: You need to log in first  " });
    }
     const{Pid} = req.body;

    const query = "SELECT * FROM Record WHERE Pid = ?";
    connection.query(query, [Pid], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});












module.exports = router;
