// server.js or routes/payment.js
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const stripe = require("stripe")("process.env.secretkey"); // use your Secret Key
const router = express.Router();

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body; // amount in LKR * 100

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "lkr", // LKR for Sri Lanka
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

module.exports = router;
