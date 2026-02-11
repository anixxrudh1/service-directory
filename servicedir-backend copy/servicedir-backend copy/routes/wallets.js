const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Payment = require('../models/Payment');

// 1. Get Wallet Balance
router.get('/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    res.json({
      balance: wallet.balance,
      totalAdded: wallet.totalAdded,
      totalSpent: wallet.totalSpent,
      totalRefunded: wallet.totalRefunded,
      userId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Full Wallet Details with Transactions
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    // Get transaction details with populated payment info
    const transactions = wallet.transactions
      .reverse()
      .slice(skip, skip + parseInt(limit));

    res.json({
      userId,
      balance: wallet.balance,
      totalAdded: wallet.totalAdded,
      totalSpent: wallet.totalSpent,
      totalRefunded: wallet.totalRefunded,
      transactionCount: wallet.transactions.length,
      transactions,
      createdAt: wallet.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Add Money to Wallet (Stripe Integration)
router.post('/add-money', async (req, res) => {
  try {
    const { userId, amount, paymentIntentId } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount or userId' });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // Update wallet
    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({ userId });
    }

    wallet.balance += amount;
    wallet.totalAdded += amount;
    wallet.transactions.push({
      type: 'credit',
      amount,
      description: 'Added money to wallet',
      balanceAfter: wallet.balance
    });

    await wallet.save();

    res.json({
      success: true,
      message: 'Money added to wallet successfully',
      newBalance: wallet.balance,
      wallet
    });
  } catch (err) {
    console.error('Add Money Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Create Wallet Top-up Payment Intent
router.post('/topup-intent', async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount or userId' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        userId,
        type: 'wallet_topup'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: 'usd'
    });
  } catch (err) {
    console.error('Topup Intent Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Wallet Transaction History
router.get('/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit = 50 } = req.query;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    let transactions = wallet.transactions.reverse();

    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    transactions = transactions.slice(0, parseInt(limit));

    res.json({
      userId,
      transactions,
      totalTransactions: wallet.transactions.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Withdraw from Wallet (for business owners/providers)
router.post('/withdraw', async (req, res) => {
  try {
    const { userId, amount, bankAccountToken } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount or userId' });
    }

    let wallet = await Wallet.findOne({ userId });

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    // Create payout via Stripe
    const user = await User.findById(userId);
    
    try {
      const payout = await stripe.payouts.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        destination: bankAccountToken
      });

      // Deduct from wallet
      wallet.balance -= amount;
      wallet.totalSpent += amount;
      wallet.transactions.push({
        type: 'debit',
        amount,
        description: `Withdrawal to bank account (ID: ${payout.id})`,
        balanceAfter: wallet.balance
      });

      await wallet.save();

      res.json({
        success: true,
        message: 'Withdrawal initiated successfully',
        payoutId: payout.id,
        newBalance: wallet.balance
      });
    } catch (stripeErr) {
      return res.status(400).json({ error: 'Bank transfer failed: ' + stripeErr.message });
    }
  } catch (err) {
    console.error('Withdrawal Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
