const express = require("express");
const connection = require("../connection");
const { authenticateUser } = require("../services/userMiddleware"); // Import middleware
const { authenticateDoctor } = require("../services/doctorMiddleware"); // Import middleware
const { authenticateAdmin } = require("../services/adminMiddleware"); // Import middleware
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
require("dotenv").config();

// Signup Route
router.post("/signup", (req, res) => {
  const {
    Fname,
    Lname,
    Pnumber,
    Email,
    Password,
    Image,
    Location,
    Gender,
    Birthdate,
  } = req.body;

  // Validate that all required fields are provided
  if (
    !Fname ||
    !Lname ||
    !Pnumber ||
    !Email ||
    !Password ||
    !Image ||
    !Location ||
    !Gender ||
    !Birthdate
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if image size is more than 5MB
  const imageSize = Buffer.byteLength(Image, "base64");
  if (imageSize > 5 * 1024 * 1024) {
    // 5MB
    return res.status(413).json({ message: "Image size exceeds 5MB limit" });
  }

  // Check if the user already exists in the database
  connection.query(
    "SELECT Pid FROM Patient WHERE Email = ?",
    [Email],
    (err, results) => {
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
          [
            Fname,
            Lname,
            Pnumber,
            Email,
            hashedPassword,
            Image,
            Location,
            Gender,
            Birthdate,
          ],
          (err, results) => {
            if (err) {
              console.error("Error executing stored procedure:", err);
              return res.status(500).json({ message: "Error saving data" });
            }

            res.status(201).json({ message: "User registered successfully" });
          }
        );
      });
    }
  );
});

// Logout Route
router.post("/logout", (req, res) => {
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

//Patient Login Route
router.post("/login", (req, res) => {
  const { Email, Password } = req.body;
  if (req.session.user) {
    return res.status(409).json({ message: "You have already loged in" });
  }

  if (!Email || !Password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  const query =
    "SELECT Pid, Fname, Lname, Email, Password, Status FROM Patient WHERE Email = ?";

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
      Lname: results[0].Lname,
    };

    res
      .status(200)
      .json({ message: "Login successful", user: req.session.user });
  });
});

// Change Password Route
router.post("/changepassword", authenticateUser, async (req, res) => {
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
    return res
      .status(400)
      .json({ message: "Old and new password are required" });
  }

  const query = "SELECT Password FROM Patient WHERE Email = ?";
  connection.query(query, [Email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (
      results.length === 0 ||
      !(await bcrypt.compare(oldpassword, results[0].Password))
    ) {
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
router.get("/allP", authenticateAdmin, (req, res) => {
  connection.query("SELECT * FROM Patient", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(200).json(results);
  });
});

// Get a single patient
router.get("/GebyEmail", authenticateDoctor, authenticateAdmin, (req, res) => {
  const Email = req.body;
  connection.query(
    "SELECT * FROM Patient WHERE Email = ?",
    [Email],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Patient not found" });
      res.status(200).json(results[0]);
    }
  );
});

// Update email
router.put("/updateEmail", authenticateUser, (req, res) => {
  const { Email, newEmail } = req.body;
  connection.query(
    "UPDATE Patient SET Email = ? WHERE Email = ?",
    [newEmail, Email],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.status(200).json({ message: "Email updated successfully" });
    }
  );
});

// Delete a patient
router.delete("/delete", authenticateUser, (req, res) => {
  const { Pid } = req.session.user; // Destructure Email from req.body

  if (!Email) {
    return res.status(400).json({ message: "Email is required" });
  }

  connection.query(
    "DELETE FROM Patient WHERE Email = ?",
    [Pid],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.status(200).json({ message: "Patient deleted successfully" });
    }
  );
});

// Deactivate a patient
router.put("/deactivate", authenticateAdmin, (req, res) => {
  const { Email } = req.body; // Destructure Email from req.body

  if (!Email) {
    return res.status(400).json({ message: "Email is required" });
  }

  connection.query(
    "UPDATE Patient SET Status = 0 WHERE Email = ?",
    [Email],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.status(200).json({ message: "Patient deactivated successfully" });
    }
  );
});

// Activate a patient
router.put("/activate", authenticateAdmin, (req, res) => {
  const { Email } = req.body; // Destructure Email from req.body

  if (!Email) {
    return res.status(400).json({ message: "Email is required" });
  }

  connection.query(
    "UPDATE Patient SET Status = 1 WHERE Email = ?",
    [Email],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.status(200).json({ message: "Patient activated successfully" });
    }
  );
});

// Forgot Password Route
router.post("/forgotpassword", (req, res) => {
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

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1); // Token expires in 1 hour

    // Store token in PasswordReset table
    const insertQuery =
      "INSERT INTO PasswordReset (Email, Token, Expiry) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Token = ?, Expiry = ?";
    connection.query(
      insertQuery,
      [Email, resetToken, expiryTime, resetToken, expiryTime],
      (err) => {
        if (err) {
          console.error("Error storing reset token:", err);
          return res
            .status(500)
            .json({ message: "Error generating reset token" });
        }

        // Send reset email
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL,
          to: Email,
          subject: "Password Reset",
          text:
            `Dear ${results[0].Fname} ${results[0].Lname},\n\n` +
            `You requested a password reset.\n\n` +
            `Click the link below to reset your password:\n\n` +
            `http://localhost:4200/reset-password?email=${Email}&token=${resetToken}\n\n` +
            `This link is valid for 1 hour. If you did not request this, ignore this email.\n`,
        };

        transporter.sendMail(mailOptions, (err) => {
          if (err) {
            console.error("Error sending email:", err);
            return res.status(500).json({ message: "Error sending email" });
          }

          res.status(200).json({ message: "Password reset email sent" });
        });
      }
    );
  });
});

// Submit Feedback
router.post("/feedback", authenticateUser, (req, res) => {
  if (!req.session || !req.session.user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: You need to log in first" });
  }

  const { Pid } = req.session.user;
  const { message, rating } = req.body;

  if (!message || !rating) {
    return res.status(400).json({ message: "Message and rating are required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  const query =
    "INSERT INTO Feedback (Pid, Message, Rating, Date) VALUES (?, ?, ?, CURDATE())";
  connection.query(query, [Pid, message, rating], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(201).json({ message: "Feedback submitted successfully" });
  });
});

//Get report
router.get("/reports", authenticateUser, (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: You need to log in first  " });
  }
  const { Pid } = req.session.user;

  const query = "SELECT * FROM Record WHERE Pid = ?";
  connection.query(query, [Pid], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    res.json(results);
  });
});

router.get("/session-patient", authenticateUser, (req, res) => {
  // Check if session exists
  if (!req.session) {
    return res.status(500).json({ message: "Session is not initialized" });
  }

  // Check if user is stored in session
  if (!req.session.user) {
    return res.status(401).json({ message: "Patient session not found" });
  }

  return res.status(200).json(true);
});

// Reset Password Route
router.post("/resetpassword", async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, token, and new password are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters long" });
  }

  try {
    // Verify the token
    const query = "SELECT Token, Expiry FROM PasswordReset WHERE Email = ?";
    const [results] = await new Promise((resolve, reject) => {
      connection.query(query, [email], (err, results) => {
        if (err) reject(err);
        else resolve([results]);
      });
    });

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    const { Token, Expiry } = results[0];

    if (Token !== token) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (new Date() > new Date(Expiry)) {
      return res.status(400).json({ message: "Reset link has expired" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the Patient table
    const updateQuery = "UPDATE Patient SET Password = ? WHERE Email = ?";
    await new Promise((resolve, reject) => {
      connection.query(updateQuery, [hashedPassword, email], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Delete the token from PasswordReset table
    const deleteQuery = "DELETE FROM PasswordReset WHERE Email = ?";
    await new Promise((resolve, reject) => {
      connection.query(deleteQuery, [email], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

//book appointment
router.post("/book-appointment", authenticateUser, (req, res) => {
  const { Did, Date, Time, Type, Link, Cid } = req.body; // Get data from request body
  const { Pid } = req.session.user; // Get Pid from session

  console.log("Received appointment data:", {
    Did,
    Date,
    Time,
    Type,
    Link,
    Cid,
    Pid,
  }); // Log data

  connection.query(
    "INSERT INTO Appointment (Pid, Did, Date, Time, Type, Link, Cid) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [Pid, Did, Date, Time, Type, Link, Cid],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      console.log("Booking result:", result); // Log successful insertion result
      res.status(201).json({ message: "Appointment booked successfully" });
    }
  );
});

// Add patient invoice and send email
router.post("/add-invoice", authenticateUser, (req, res) => {
  const {
    Pid,
    TotalAmount,
    FinalAmount,
    PaymentMethod,
    IssuedDate,
    PaymentStatus,
  } = req.body;

  if (
    !Pid ||
    !TotalAmount ||
    !FinalAmount ||
    !PaymentMethod ||
    !IssuedDate ||
    !PaymentStatus
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO Invoice (
      Pid,
      TotalAmount,
      FinalAmount,
      PaymentMethod,
      IssuedDate,
      PaymentStatus
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    Pid,
    TotalAmount,
    FinalAmount,
    PaymentMethod,
    IssuedDate,
    PaymentStatus,
  ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const invoiceId = result.insertId;

    // Fetch patient email
    const patientQuery = `SELECT Email, Fname FROM Patient WHERE Pid = ?`;

    connection.query(patientQuery, [Pid], (err, patientResult) => {
      if (err || patientResult.length === 0) {
        console.error("Failed to fetch patient:", err);
        return res
          .status(500)
          .json({ message: "Failed to fetch patient details" });
      }

      const patient = patientResult[0];

      // Set up Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL, // Your email address
          pass: process.env.PASSWORD, // App password if using Gmail
        },
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: patient.Email,
        subject: "Your Appointment Invoice - CarePath",
        html: `
          <h3>Dear ${patient.Fname},</h3>
          <p>Thank you for your appointment booking. Here is your invoice:</p>
          <ul>
            <li><strong>Invoice ID:</strong> ${invoiceId}</li>
            <li><strong>Total Amount:</strong> Rs. ${TotalAmount}</li>
            <li><strong>Final Amount:</strong> Rs. ${FinalAmount}</li>
            <li><strong>Payment Method:</strong> ${PaymentMethod}</li>
            <li><strong>Issued Date:</strong> ${IssuedDate}</li>
            <li><strong>Payment Status:</strong> ${PaymentStatus}</li>
          </ul>
          <p>We look forward to serving you.</p>
          <p>CarePath Team</p>
        `,
      };

      // Send the email
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Email sending error:", err);
          return res.status(500).json({
            message: "Invoice saved, but failed to send email",
          });
        }

        return res.status(201).json({
          message: "Invoice generated and email sent successfully",
          invoiceId,
        });
      });
    });
  });
});

// Get invoice by ID
router.get("/get-invoice/:id", authenticateUser, (req, res) => {
  const { id } = req.params;

  // Check if ID is provided and is a number
  if (!id) {
    console.warn("Missing invoice ID in request params");
    return res.status(400).json({ message: "Invoice ID is required" });
  }

  if (isNaN(id)) {
    console.warn(`Invalid invoice ID format: ${id}`);
    return res.status(400).json({ message: "Invalid invoice ID format" });
  }

  const query = `SELECT * FROM Invoice WHERE Id = ?`;

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error while fetching invoice by ID:", err);
      return res
        .status(500)
        .json({ message: "Internal server error while retrieving invoice" });
    }

    if (!Array.isArray(result)) {
      console.error("Unexpected database result:", result);
      return res.status(500).json({ message: "Unexpected error occurred" });
    }

    if (result.length === 0) {
      console.info(`Invoice not found for ID: ${id}`);
      return res.status(404).json({ message: "Invoice not found" });
    }

    console.log(`Invoice fetched successfully for ID: ${id}`);
    return res.status(200).json(result[0]);
  });
});

// Export the router
module.exports = router;
