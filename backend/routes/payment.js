require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.SECRET_KEYPAY);
const router = express.Router();

// Make sure express can parse JSON request bodies
router.use(express.json());

// ─────────────────────────────────────────
// STRIPE PAYMENT ROUTE
// ─────────────────────────────────────────
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body; // amount in LKR * 100

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd", // You can change to "lkr" if supported
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment failed" });
  }
});

// ─────────────────────────────────────────
// BOOKING ROUTE FOR PAYPAL
// ─────────────────────────────────────────
router.post("/bookings", async (req, res) => {
  try {
    const {
      doctorId,
      selectedDay,
      selectedClinic,
      totalFee,
      paymentStatus,
      paymentDetails,
    } = req.body;

    // Log booking data
    console.log("Booking Received:");
    console.log({
      doctorId,
      selectedDay,
      selectedClinic,
      totalFee,
      paymentStatus,
      transactionId: paymentDetails?.id,
    });

    // TODO: Save to database here (e.g., MongoDB, MySQL)

    res.status(200).json({ message: "Booking saved successfully!" });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({ message: "Booking save failed" });
  }
});

module.exports = router;
