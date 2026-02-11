const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const Wallet = require('../models/Wallet');
const Service = require('../models/Service');
const User = require('../models/User');

// Helper function to generate invoice number
const generateInvoiceNumber = () => {
  return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// 1. Create Payment Intent (for Stripe)
router.post('/create-intent', async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        bookingId,
        paymentMethod: paymentMethod || 'card'
      }
    });

    // Create Payment record in DB (pending)
    const booking = await Booking.findById(bookingId).populate('serviceId');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const platformFee = amount * 0.1; // 10% platform fee
    const providerAmount = amount - platformFee;

    const payment = new Payment({
      bookingId,
      customerId: booking.customerId,
      providerId: booking.providerId,
      serviceId: booking.serviceId._id,
      amount,
      paymentMethod: paymentMethod || 'card',
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      platformFee,
      providerAmount,
      description: `Payment for ${booking.serviceId.name}`
    });

    await payment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      amount,
      currency: 'usd'
    });
  } catch (err) {
    console.error('Payment Intent Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Confirm Payment (Called after Stripe confirms payment)
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId, paymentId } = req.body;

    // Verify with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // Update Payment record
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: 'succeeded',
        completedAt: new Date()
      },
      { new: true }
    );

    // Update Booking status
    await Booking.findByIdAndUpdate(payment.bookingId, { status: 'confirmed' });

    // Add funds to provider's wallet
    let providerWallet = await Wallet.findOne({ userId: payment.providerId });
    if (!providerWallet) {
      providerWallet = new Wallet({ userId: payment.providerId });
    }
    providerWallet.balance += payment.providerAmount;
    providerWallet.totalAdded += payment.providerAmount;
    providerWallet.transactions.push({
      type: 'credit',
      amount: payment.providerAmount,
      description: `Payment received for booking`,
      relatedPaymentId: payment._id,
      balanceAfter: providerWallet.balance
    });
    await providerWallet.save();

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      payment
    });
  } catch (err) {
    console.error('Confirm Payment Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Pay with Wallet
router.post('/pay-with-wallet', async (req, res) => {
  try {
    const { bookingId, customerId } = req.body;

    const booking = await Booking.findById(bookingId).populate('serviceId');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const amount = booking.serviceId.price;

    // Check wallet balance
    let customerWallet = await Wallet.findOne({ userId: customerId });
    if (!customerWallet || customerWallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    const platformFee = amount * 0.1;
    const providerAmount = amount - platformFee;

    // Create Payment record
    const payment = new Payment({
      bookingId,
      customerId,
      providerId: booking.providerId,
      serviceId: booking.serviceId._id,
      amount,
      paymentMethod: 'wallet',
      status: 'succeeded',
      platformFee,
      providerAmount,
      description: `Payment for ${booking.serviceId.name}`,
      completedAt: new Date()
    });
    await payment.save();

    // Deduct from customer wallet
    customerWallet.balance -= amount;
    customerWallet.totalSpent += amount;
    customerWallet.transactions.push({
      type: 'debit',
      amount,
      description: `Payment for booking`,
      relatedPaymentId: payment._id,
      balanceAfter: customerWallet.balance
    });
    await customerWallet.save();

    // Add to provider wallet
    let providerWallet = await Wallet.findOne({ userId: booking.providerId });
    if (!providerWallet) {
      providerWallet = new Wallet({ userId: booking.providerId });
    }
    providerWallet.balance += providerAmount;
    providerWallet.totalAdded += providerAmount;
    providerWallet.transactions.push({
      type: 'credit',
      amount: providerAmount,
      description: `Payment received for booking`,
      relatedPaymentId: payment._id,
      balanceAfter: providerWallet.balance
    });
    await providerWallet.save();

    // Update booking status
    await Booking.findByIdAndUpdate(bookingId, { status: 'confirmed' });

    res.json({
      success: true,
      message: 'Payment successful using wallet',
      payment
    });
  } catch (err) {
    console.error('Wallet Payment Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Payment History for User
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({
      $or: [{ customerId: userId }, { providerId: userId }]
    })
      .populate('bookingId')
      .populate('serviceId', 'name price')
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Payment by ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('bookingId')
      .populate('serviceId')
      .populate('customerId', 'name email')
      .populate('providerId', 'name email');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Refund Payment
router.post('/:id/refund', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'succeeded') {
      return res.status(400).json({ error: 'Only succeeded payments can be refunded' });
    }

    // Refund via Stripe if card payment
    if (payment.paymentMethod === 'card' && payment.stripePaymentIntentId) {
      await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId
      });
    }

    // Update payment status
    payment.status = 'refunded';
    await payment.save();

    // Refund to customer wallet
    let customerWallet = await Wallet.findOne({ userId: payment.customerId });
    if (!customerWallet) {
      customerWallet = new Wallet({ userId: payment.customerId });
    }
    customerWallet.balance += payment.amount;
    customerWallet.totalRefunded += payment.amount;
    customerWallet.transactions.push({
      type: 'refund',
      amount: payment.amount,
      description: 'Refund for cancelled booking',
      relatedPaymentId: payment._id,
      balanceAfter: customerWallet.balance
    });
    await customerWallet.save();

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      payment
    });
  } catch (err) {
    console.error('Refund Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
