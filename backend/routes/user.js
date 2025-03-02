const express = require('express');
const connection = require('../connection');
const { result } = require('underscore');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');   // Import nodemailer
var auth = require('../services/authenticaton')
var checkRole=require('../services/checkRole');


require('dotenv').config();

router.post('/signup', (req, res) => {    
    const { name, contactNumber, email, password } = req.body;

    if (!name || !contactNumber || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    connection.query("SELECT id FROM user WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        if (results.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Insert the new user
        const insertQuery = "INSERT INTO user (name, contactNumber, email, password, status, role) VALUES (?, ?, ?, ?, 'false', 'user')";
        connection.query(insertQuery, [name, contactNumber, email, password], (err, results) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            res.status(201).json({ message: "User registered successfully" });
        });
    });
});

router.post('/login', (req, res) => {
    const user = req.body;
    query="select email,password,role,status from user where email=?";
    connection.query(query,[user.email],(err,results)=>{
        if(!err){
            if(results.length<= 0||results[0].password!=user.password){
                return res.status(401).json({message:"Invalid Username or password"});
            }
            else if(results[0].status ==='false'){
                return res.status(401).json({message:"Wait for Admin Approval"});

            }
            else if(results[0].password==user.password){
                const response = {email:results[0].email,role:results[0].role}
                const accessToken = jwt.sign(response,process.env.ACCESS_TOKEN,{expiresIn:'8h'})
                res.status(200).json({token:accessToken});
            }
            else{
                return res.status(200).json({message:"User login successful"});
            }
        }
        else{
            return res.status(500).json({ message: "Database error", error: err });
        }
    });

});

var transporter = nodemailer.createTransport({   // Create a transporter
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,   // Email
        pass: process.env.PASSWORD   // Password
    }
});

router.post('/forgotpassword', (req, res) => {
    const user = req.body;
    // Check if the user exists
    const query = "SELECT email, password FROM user WHERE email = ?";
    connection.query(query, [user.email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userPassword = results[0].password;

        // Mail options
        const mailOptions = {
            from: process.env.EMAIL,
            to: results[0].email,
            subject: 'Password Recovery',
            text: `Your password is: ${userPassword}`
        };

        // Send email
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({ message: "Failed to send email", error: err });
            }
            res.status(200).json({ message: "Password sent successfully" });
        });
    });
});

router.get('/get',auth.authenticateToken,checkRole.checkRole,(req, res) => {
    const query = "SELECT id, name, email, contactNumber, status FROM user where role='user' ";
    connection.query(query, (err, results) => {
        if(!err){
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json({ message: "Database error", error: err });
        }
    });
});

router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    const user = req.body;
    const query = "UPDATE user SET status = ? WHERE email = ?";
    connection.query(query,[user.status,user.email],(err,results)=>{
        if(!err){
            if(results.affectedRows>0){
                return res.status(200).json({message:"User updated successfully"});
            }
            else{
                return res.status(404).json({message:"User not found"});
            }
        }
        else{
            return res.status(500).json({ message: "Database error", error: err });
        }
    });
});

router.get('/checkToken',auth.authenticateToken,(req,res)=>{
    const token = req.headers['authorization'];
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    jwt.verify(token,process.env.ACCESS_TOKEN,(err,user)=>{
        if(err){
            return res.status(403).json({message:"Forbidden"});
        }
        return res.status(200).json({message:"Authorized"});
    });
});

router.post('/changepassword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = req.user.email; // Extract email from JWT token payload

    if (!email) {
        return res.status(400).json({ message: "Unauthorized request" });
    }

    const query = "SELECT * FROM user WHERE email = ? AND password = ?";
    
    connection.query(query, [email, user.oldpassword], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (results.length <= 0) {
            return res.status(404).json({ message: "Incorrect old password" });
        }

        // If the old password matches, update the password
        const updateQuery = "UPDATE user SET password = ? WHERE email = ?";
        connection.query(updateQuery, [user.newpassword, email], (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err });
            }

            return res.status(200).json({ message: "Password changed successfully" });
        });
    });
});

 

module.exports = router;
