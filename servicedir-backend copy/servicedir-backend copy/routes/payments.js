const express = require('express');
const router = express.Router();
require('dotenv').config();
const Stripe = require('stripe');

const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_YOUR_STRIPE_SECRET_KEY' ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

router.post('/create-intent', async (req, res) => {
  try {
    const { amount, bookingId, paymentMethod } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // if no real stripe key is set, use mock
    if (!stripe) {
       console.log("💳 Creating MOCK payment intent for amount:", amount);
       return res.json({ clientSecret: 'pi_mock_secret', status: 'mock_success' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { bookingId: bookingId || 'unknown' },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('❌ Payment Intent Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
