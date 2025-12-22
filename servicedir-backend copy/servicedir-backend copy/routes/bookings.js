const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// 1. POST: Create a new Booking
router.post('/', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET: Fetch bookings for a specific user
router.get('/:userId', async (req, res) => {
  const { role } = req.query;
  
  try {
    let filter = {};
    if (role === 'customer') {
      filter = { customerId: req.params.userId };
    } else if (role === 'business') {
      filter = { providerId: req.params.userId };
    }

    const bookings = await Booking.find(filter)
      .populate('serviceId')
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .sort({ date: 1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. PATCH: Update Booking Status (NEW ROUTE) <--- ADD THIS
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body; // e.g. 'confirmed', 'cancelled'
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // Return the updated version
    )
    .populate('serviceId')
    .populate('customerId', 'name email')
    .populate('providerId', 'name email');

    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;