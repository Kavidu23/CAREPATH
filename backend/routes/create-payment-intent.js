require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('process.env.secretkey'); // Use your secret key
const app = express();

app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'lkr',
      payment_method_types: ['card']
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));


module.exports = router;