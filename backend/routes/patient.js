const express = require('express');
const connection = require('../connection');
const { authenticateUser } = require('../services/userMiddleware'); // Import middleware
const { authenticateDoctor } = require('../services/doctorMiddleware'); // Import middleware
const { authenticateAdmin } = require('../services/adminMiddleware'); // Import middleware
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config();


// Signup Route
router.post('/signup', (req, res) => {
    const { Fname, Lname, Pnumber, Email, Password, Image, Location, Gender, Birthdate } = req.body;

    // Validate that all required fields are provided
    if (!Fname || !Lname || !Pnumber || !Email || !Password || !Image || !Location || !Gender || !Birthdate) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists in the database
    connection.query("SELECT Pid FROM Patient WHERE Email = ?", [Email], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        bcrypt.hash(Password, 10, (err, hashedPassword) => {
            if (err) {
                console.error("Error hashing password:", err);
                return res.status(500).json({ message: "Error hashing password" });
            }

            // Call the stored procedure to insert the user details
            connection.query(
                "CALL InsertPatientWithDetails(?, ?, ?, ?, ?, ?, ?, ?,'1',?)",
                [Fname, Lname, Pnumber, Email, hashedPassword, Image, Location, Gender, Birthdate],
                (err, results) => {
                    if (err) {
                        console.error("Error executing stored procedure:", err);
                        return res.status(500).json({ message: "Error saving data" });
                    }

                    res.status(201).json({ message: "User registered successfully" });
                }
            );
        });
    });
});

module.exports = router;


// Login Route
// Logout Route
router.get('/logout', (req, res) => {
    if (!req.session.user) {
        return res.status(400).json({ message: "No active session to log out" });
    }

    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ message: "Error destroying session" });
        }
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logout successful" });
    });
});


router.post('/login', (req, res) => {
    const { Email, Password } = req.body;
    if (req.session.user) {
        return res.status(409).json({ message: "You have already loged in" });
    }

    if (!Email || !Password) {
        return res.status(400).json({ message: "Email and Password are required" });
    }

    const query = "SELECT Pid, Fname, Lname, Email, Password, Status FROM Patient WHERE Email = ?";
    
    connection.query(query, [Email], async (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare hashed password
        const match = await bcrypt.compare(Password, results[0].Password);
        if (!match) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check if user is approved by admin
        if (!results[0].Status || results[0].Status == 0) { 
            return res.status(403).json({ message: "Wait for admin approval" });
        }

        // Store user in session
        req.session.user = { 
            Pid: results[0].Pid,
            Email: results[0].Email, 
            Fname: results[0].Fname, 
            Lname: results[0].Lname 
        };

        res.status(200).json({ message: "Login successful", user: req.session.user });
    });
});





// Change Password Route
router.post('/changepassword',authenticateUser,async (req, res) => {
    const { oldpassword, newpassword } = req.body;

    // Declare Email outside of try block
    let Email;
    try {
        if (!req.session || !req.session.user) {
            throw new Error("Unauthorized");
        }
        Email = req.session.user.Email;
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    if (!oldpassword || !newpassword) {
        return res.status(400).json({ message: "Old and new password are required" });
    }

    const query = "SELECT Password FROM Patient WHERE Email = ?";
    connection.query(query, [Email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length === 0 || !(await bcrypt.compare(oldpassword, results[0].Password))) {
            return res.status(401).json({ message: "Incorrect old password" });
        }

        const hashedPassword = await bcrypt.hash(newpassword, 10);
        const updateQuery = "UPDATE Patient SET Password = ? WHERE Email = ?";
        connection.query(updateQuery, [hashedPassword, Email], (err) => {
            if (err) return res.status(500).json({ message: "Database error" });

            res.status(200).json({ message: "Password changed successfully" });
        });
    });
});


// Get all patients
router.get('/allP',authenticateAdmin,(req,res)=>{
    connection.query("SELECT * FROM Patient",(err,results)=>{
        if(err) return res.status(500).json({message:"Database error"});
        res.status(200).json(results);
    });
})

// Get a single patient
router.get('/GebyEmail',authenticateDoctor,authenticateAdmin,(req,res)=>{
    const Email = req.body;
    connection.query("SELECT * FROM Patient WHERE Email = ?",[Email],(err,results)=>{
        if(err) return res.status(500).json({message:"Database error"});
        if(results.length === 0) return res.status(404).json({message:"Patient not found"});
        res.status(200).json(results[0]);
    });
})

// Update email
router.put('/updateEmail',authenticateUser,(req,res)=>{
    const {Email, newEmail} = req.body;
    connection.query("UPDATE Patient SET Email = ? WHERE Email = ?",[newEmail, Email],(err,results)=>{
        if(err) return res.status(500).json({message:"Database error"});
        res.status(200).json({message:"Email updated successfully"});
    });
})  

// Delete a patient
router.delete('/delete', authenticateUser, (req, res) => {
    const { Email } = req.body; // Destructure Email from req.body

    if (!Email) {
        return res.status(400).json({ message: "Email is required" });
    }

    connection.query("DELETE FROM Patient WHERE Email = ?", [Email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json({ message: "Patient deleted successfully" });
    });
});

// Deactivate a patient
router.put('/deactivate', authenticateAdmin, (req, res) => {
    const { Email } = req.body; // Destructure Email from req.body

    if (!Email) {
        return res.status(400).json({ message: "Email is required" });
    }

    connection.query("UPDATE Patient SET Status = 0 WHERE Email = ?", [Email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json({ message: "Patient deactivated successfully" });
    });
});

// Activate a patient
router.put('/activate', authenticateAdmin, (req, res) => {
    const { Email } = req.body; // Destructure Email from req.body

    if (!Email) {
        return res.status(400).json({ message: "Email is required" });
    }

    connection.query("UPDATE Patient SET Status = 1 WHERE Email = ?", [Email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json({ message: "Patient activated successfully" });
    });
});

// Forgot Password Route
router.post('/forgotpassword', (req, res) => {
    const { Email } = req.body;

    if (!Email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const query = "SELECT Fname, Lname, Email FROM Patient WHERE Email = ?";
    connection.query(query, [Email], (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: Email,
            subject: 'Password Reset',
            text: `Dear ${results[0].Fname} ${results[0].Lname},\n\n` +
                `You are receiving this email because you requested a password reset.\n\n` +
                `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                `http://localhost:3000/resetpassword?email=${Email}\n\n` +
                `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error("Error sending email:", err);
                return res.status(500).json({ message: "Error sending email" });
            }

            res.status(200).json({ message: "Email sent" });
        });
    });
});


// Submit Feedback
router.post('/feedback', authenticateUser, (req, res) => {
  
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized: You need to log in first" });
    }

    const { Pid } = req.session.user;
    const { message, rating } = req.body;

    if (!message || !rating) {
        return res.status(400).json({ message: "Message and rating are required" });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const query = "INSERT INTO Feedback (Pid, Message, Rating, Date) VALUES (?, ?, ?, CURDATE())";
    connection.query(query, [Pid, message, rating], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(201).json({ message: "Feedback submitted successfully" });
    });
});


//Get report
router.get('/reports',authenticateUser,(req, res) => {
    if(!req.session.user) {
        return res.status(401).json({ message: "Unauthorized: You need to log in first  " });
    }
     const{Pid} = req.session.user;

    const query = "SELECT * FROM Record WHERE Pid = ?";
    connection.query(query, [Pid], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json(results);
    });
});






// Export the router
module.exports = router;

