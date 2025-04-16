const express = require("express");
const connection = require("../connection"); // MySQL connection
const { authenticateDoctor } = require("../services/doctorMiddleware"); // Import middleware
const router = express.Router();
const { authenticateAdmin } = require("../services/adminMiddleware"); // if separated

// 1. Get clinics where the doctor is already registered
router.get("/registered", authenticateAdmin, (req, res) => {
  const { Cid } = req.session.admin; // Get clinic ID from session

  if (!Cid) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No clinic ID found in session" });
  }

  // Join doctor_clinic and Doctor tables to retrieve the doctors registered for the clinic
  const query = `
    SELECT doctor.Did, doctor.Fname, doctor.Lname, doctor.ConsultationType
    FROM doctor
    INNER JOIN doctor_clinic ON doctor.Did = doctor_clinic.Did
    WHERE doctor_clinic.Cid = ?`;

  connection.query(query, [Cid], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(results);
  });
});

// 2. Get new clinics based on doctor's location (where the doctor is NOT registered)
router.get("/new", authenticateAdmin, (req, res) => {
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
router.get("/location", authenticateAdmin, (req, res) => {
  const { location } = req.query;
  const query = `SELECT * FROM Clinic WHERE Location = ? `;
  connection.query(query, [location], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(results);
  });
});

//Get all clinics
router.get("/all", authenticateAdmin, (req, res) => {
  const query = `SELECT * FROM Clinic`;
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(results);
  });
});

//insert into clicnic table
router.post("/add-doc", authenticateAdmin, (req, res) => {
  const { Cid } = req.session.admin; // Get clinic ID from session
  const { Did } = req.body;
  const query = `INSERT INTO doctor_clinic (Cid,Did) VALUES (?,?)`;
  connection.query(query, [Cid, Did], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json({ message: "Clinic added successfully" });
  });
});

//get today patients
router.get("/today-patients", authenticateAdmin, (req, res) => {
  const { Cid } = req.session.admin; // Get doctor ID from session
  const query = `SELECT * FROM appointment WHERE Cid = ? AND Date = CURDATE()`;
  connection.query(query, [Cid], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(results);
  });
});

//get clcinic by id
router.get("/getclinic/:id", authenticateAdmin, (req, res) => {
  const { Cid } = req.session.admin; // Get doctor ID from session
  const query = `SELECT * FROM Clinic WHERE Cid = ?`;
  connection.query(query, [Cid], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Clinic not found" });
    }
    res.json(results[0]);
  });
});
const bcrypt = require("bcrypt");

// Admin Login Route
router.post("/adminlogin", (req, res) => {
  const { email, password } = req.body;

  // If already logged in
  if (req.session.admin) {
    if (req.session.admin.type === "clinic") {
      redirectUrl = `/clinic-admin`;
    } else if (req.session.admin.type === "web") {
      redirectUrl = `/web-admin`;
    } else {
      return res.status(400).json({ message: "Invalid admin type" });
    }
    return res.status(409).json({ message: "You have already logged in" });
  }

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  const query = `SELECT * FROM admin WHERE Email = ?`;

  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Database Query Error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const admin = results[0];

    // Compare hashed password
    const match = await bcrypt.compare(password, admin.Password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Store admin in session
    req.session.admin = {
      Aid: admin.Aid,
      Email: admin.Email,
      type: admin.type,
      Cid: admin.Cid,
    };

    let redirectUrl = "";
    if (admin.type === "clinic") {
      redirectUrl = `/clinic-admin`;
    } else if (admin.type === "web") {
      redirectUrl = `/web-admin`;
    } else {
      return res.status(400).json({ message: "Invalid admin type" });
    }

    res.status(200).json({
      message: "Login successful",
      user: req.session.admin,
      redirectUrl,
    });
  });
});

// Get session admin (clinic admin)
router.get("/get-session-admin", authenticateAdmin, (req, res) => {
  if (req.session.admin) {
    // If admin session exists, return the clinic admin data
    res.json(req.session.admin);
  } else {
    // If no session, return an error message
    res.status(401).json({ message: "Not logged in as admin" });
  }
});

//register new clicnic
router.post("/register-clinic", authenticateAdmin, (req, res) => {
  const { Name, Location, Email, Pnumber, Fee } = req.body;
  const query = `INSERT INTO Clinic (Name, Location, Email, Pnumber, Fee) VALUES (?, ?, ?, ?, ?)`;
  connection.query(
    query,
    [Name, Location, Email, Pnumber, Fee],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json({ message: "Clinic registered successfully" });
    }
  );
});

const saltRounds = 10;

router.post("/create-clinic-admin", authenticateAdmin, (req, res) => {
  const { Username, Password, Email, Cid } = req.body;

  if (!Username || !Password || !Email || !Cid) {
    return res.status(400).json({ message: "All fields are required" });
  }

  bcrypt.hash(Password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error hashing password", error: err });
    }

    const query = `INSERT INTO admin (Username, Password, Email, type, Cid) VALUES (?, ?, ?, 'clinic', ?)`;

    connection.query(
      query,
      [Username, hashedPassword, Email, Cid],
      (err, results) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }
        res.json({ message: "Clinic admin created successfully" });
      }
    );
  });
});

//add new medicine
router.post("/add-medicine", authenticateAdmin, (req, res) => {
  const { Name, Price, Description } = req.body;
  const query = `INSERT INTO medicines (Name, Type, Manufacturer) VALUES (?, ?, ?)`;
  connection.query(query, [Name, type, Manufacturer], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json({ message: "Medicine added successfully" });
  });
});

//add new homecare
router.post("/add-homecare", (req, res) => {
  const { Name, Price, Description } = req.body;
  const query = `INSERT INTO homecare (Name, location, Description) VALUES (?, ?, ?)`;
  connection.query(query, [Name, Price, Description], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json({ message: "Homecare added successfully" });
  });
});

// Get total doctor count
router.get("/total-count", (req, res) => {
  console.log("🔍 total-count route hit");

  const query = "SELECT COUNT(*) AS totalDoctors FROM Doctor";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json({ totalDoctors: results[0].totalDoctors });
  });
});

//total count of patients
router.get("/total-countp", authenticateAdmin, (req, res) => {
  connection.query(
    "SELECT COUNT(*) AS totalCount FROM patient",
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          message: "Failed to fetch patient count",
          error: err.message,
        });
      }
      res.status(200).json(result[0]);
    }
  );
});

//Activate doctor
router.put("/activate/:Did", authenticateAdmin, (req, res) => {
  const { Did } = req.params;

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
router.put("/deactivate/:Did", authenticateAdmin, (req, res) => {
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

module.exports = router;
