const express = require("express");
const connection = require("../connection"); // Import connection
const { authenticateDoctor } = require("../services/doctorMiddleware"); // Import middleware
const { authenticateAdmin } = require("../services/adminMiddleware"); // Import middleware
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const session = require("express-session");
const crypto = require("crypto");
require("dotenv").config();

// Signup doctor
router.post("/signup", async (req, res) => {
  const {
    Fname,
    Lname,
    Pnumber,
    Email,
    Password,
    Gender,
    ConsultationType,
    ConsultationFee,
    Availability,
    Image,
    YearExperience,
    Location,
    Degree,
    Specialization,
  } = req.body;

  if (
    !Fname ||
    !Lname ||
    !Pnumber ||
    !Email ||
    !Password ||
    !Gender ||
    !ConsultationType ||
    !ConsultationFee ||
    !Availability ||
    !Image ||
    !YearExperience ||
    !Location ||
    !Degree ||
    !Specialization
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Insert doctor details into the Doctor table
    const doctorQuery =
      "INSERT INTO Doctor (Fname, Lname, Pnumber, Email, Password, Gender, ConsultationType, ConsultationFee, Availability, Image, YearExperience, Location, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    connection.query(
      doctorQuery,
      [
        Fname,
        Lname,
        Pnumber,
        Email,
        hashedPassword,
        Gender,
        ConsultationType,
        ConsultationFee,
        Availability,
        Image,
        YearExperience,
        Location,
        0,
      ], // Setting Status to 0
      (err, result) => {
        if (err && err.code === "ER_DUP_ENTRY") {
          return res
            .status(409)
            .json({ message: "Email or Phone number already exists" });
        }

        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }

        const doctorId = result.insertId; // Get the inserted doctor ID

        // Insert degree into Doctor_Degree table
        const degrees = Degree.split(",").map((degree) => degree.trim());
        const degreeQuery = "INSERT INTO Doctor_Degree (Did, Degree) VALUES ?";
        const degreeValues = degrees.map((degree) => [doctorId, degree]);

        connection.query(degreeQuery, [degreeValues], (err) => {
          if (err) {
            console.error("Error inserting degrees:", err);
            return res
              .status(500)
              .json({ message: "Error inserting degrees", error: err });
          }

          // Insert specialization into Doctor_Specialization table
          const specializations = Specialization.split(",").map((spec) =>
            spec.trim()
          );
          const specializationQuery =
            "INSERT INTO Doctor_Specialization (Did, Specialization) VALUES ?";
          const specializationValues = specializations.map((spec) => [
            doctorId,
            spec,
          ]);

          connection.query(
            specializationQuery,
            [specializationValues],
            (err) => {
              if (err) {
                console.error("Error inserting specializations:", err);
                return res.status(500).json({
                  message: "Error inserting specializations",
                  error: err,
                });
              }

              res
                .status(201)
                .json({ message: "Doctor registered successfully" });
            }
          );
        });
      }
    );
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Doctor Login route
router.post("/login", async (req, res) => {
  const { Email, Password } = req.body;

  // Check if email and password are provided
  if (!Email || !Password) {
    return res.status(400).json({ message: "Email and password are required" }); // 400 instead of 409
  }

  try {
    // Check if doctor is already logged in
    if (req.session.doctor) {
      return res.status(400).json({ message: "Doctor already logged in" });
    }

    // Query database for doctor with the provided email
    const query = "SELECT * FROM Doctor WHERE Email = ?";
    connection.query(query, [Email], async (err, results) => {
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

      // Store doctor session
      req.session.doctor = {
        Did: doctor.Did,
        Email: doctor.Email,
        Fname: doctor.Fname,
        Lname: doctor.Lname,
        // You can add other doctor details to the session if necessary
      };

      // Respond with success
      res.json({ message: "Login successful", doctor: req.session.doctor });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//Logout doctor
router.post("/logout", (req, res) => {
  if (!req.session.doctor) {
    return res.status(400).json({ message: "You are not logged in." });
  }

  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    // Clear the session cookie
    res.clearCookie("connect.sid"); // Assuming you are using default session cookie name

    res.json({ message: "Logout successful" });
  });
});

//delete doctor
router.delete("/delete", authenticateDoctor, authenticateAdmin, (req, res) => {
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
router.put("/update/phone", authenticateDoctor, (req, res) => {
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
      return res
        .status(404)
        .json({ message: "Doctor not found (Update failed)" });
    }

    res.json({ message: "Phone number updated successfully" });
  });
});

//Get doctor profile
router.get("/profile", authenticateAdmin, (req, res) => {
  const { Did } = req.session.doctor;

  const query =
    "SELECT Fname, Lname, Pnumber, Email, Gender, ConsultationType, ConsultationFee, Availability, Image, YearExperience, Location,Degree, Specialization FROM Doctor WHERE Did = ?";
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
router.get("/all", (req, res) => {
  const query = "SELECT Did, Fname, Lname, Email, Pnumber, Status FROM Doctor";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(results);
  });
});

//Update doctor consultation fee
router.put("/update/fee", authenticateDoctor, (req, res) => {
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
router.get("/reports", authenticateDoctor, (req, res) => {
  if (!req.session.doctor) {
    return res
      .status(401)
      .json({ message: "Unauthorized: You need to log in first  " });
  }
  const { Pid } = req.body;

  const query = "SELECT * FROM Record WHERE Pid = ?";
  connection.query(query, [Pid], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    res.json(results);
  });
});

router.get("/session-doctor", (req, res) => {
  if (req.session.doctor) {
    return res.status(200).json(true);
  } else {
    return res.status(401).json({ message: "Doctor session not found" });
  }
});

// Get doctor by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      doctor.Fname, 
      doctor.Image,
      doctor.Lname, 
      doctor.ConsultationType, 
      doctor.Availability, 
      doctor.ConsultationFee, 
      clinic.Cid AS Cid,
      clinic.Fee AS ClinicFee,
      clinic.Name AS ClinicName,
      clinic.Location AS ClinicLocation
    FROM Doctor 
    JOIN doctor_clinic ON doctor.Did = doctor_clinic.Did 
    JOIN clinic ON doctor_clinic.Cid = clinic.Cid 
    WHERE doctor.Did = ?
  `;

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Format the response to include clinic name + location + ClinicFee and Cid
    const doctorProfile = {
      Fname: result[0].Fname,
      Lname: result[0].Lname,
      ConsultationType: result[0].ConsultationType,
      Availability: result[0].Availability,
      ConsultationFee: result[0].ConsultationFee,
      ClinicFee: result[0].ClinicFee,
      Image: result[0].Image ? `${result[0].Image}` : null, // Handle image path
      Clinics: result.map((row) => ({
        id: row.Cid, // Include the clinic ID
        name: row.ClinicName,
        location: row.ClinicLocation,
      })),
    };

    res.json(doctorProfile);
  });
});

// Reset Password Route for Doctor
router.post("/change-password", async (req, res) => {
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

    // Update the password in the Doctor table
    const updateQuery = "UPDATE Doctor SET Password = ? WHERE Email = ?";
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

// Doctor Forgot Password Route
router.post("/reset-password", (req, res) => {
  const { Email } = req.body;

  if (!Email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const query = "SELECT Fname, Lname, Email FROM Doctor WHERE Email = ?";
  connection.query(query, [Email], (err, results) => {
    if (err) {
      console.error("Database Query Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1); // Token expires in 1 hour

    // Store token in PasswordReset table
    const insertQuery = `
      INSERT INTO PasswordReset (Email, Token, Expiry) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE Token = ?, Expiry = ?`;

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

        const doctor = results[0];
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: Email,
          subject: "Doctor Password Reset",
          text:
            `Dear Dr. ${doctor.Fname} ${doctor.Lname},\n\n` +
            `You requested a password reset.\n\n` +
            `Click the link below to reset your password:\n\n` +
            `http://localhost:4200/reset-doctor-password?email=${Email}&token=${resetToken}\n\n` +
            `This link is valid for 1 hour. If you did not request this, please ignore this email.\n`,
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

module.exports = router;
