const cron = require("node-cron");
const nodemailer = require("nodemailer");
const connection = require("../connection"); // Your MySQL connection
require("dotenv").config();

// Set up transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "process.env.EMAIL",
    pass: "process.env.PASSWORD",
  },
});

// Cron job that runs every day at 8 AM
cron.schedule("0 8 * * *", () => {
  const query = `
    SELECT a.Aid, a.Date, a.Time, a.Type, a.Link, p.Email, p.Name
    FROM Appointment a
    JOIN Patient p ON a.Pid = p.Pid
    WHERE a.Date = CURDATE() + INTERVAL 1 DAY;
  `;

  connection.query(query, (err, results) => {
    if (err) return console.error("DB error:", err);

    results.forEach((row) => {
      const { Email, Name, Date, Time, Type, Link } = row;

      let mailOptions = {
        from: "your-email@gmail.com",
        to: Email,
        subject: "Reminder: Your Appointment is Tomorrow",
        html: `
          <h3>Dear ${Name},</h3>
          <p>This is a reminder for your ${Type} appointment scheduled tomorrow.</p>
          <ul>
            <li><strong>Date:</strong> ${Date}</li>
            <li><strong>Time:</strong> ${Time}</li>
            ${
              Type === "Online"
                ? `<li><strong>Meeting Link:</strong> <a href="${Link}">${Link}</a></li>`
                : ""
            }
          </ul>
          <p>Thank you for using CarePath!</p>
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email to", Email, err);
        } else {
          console.log("Reminder sent to:", Email);
        }
      });
    });
  });
});
