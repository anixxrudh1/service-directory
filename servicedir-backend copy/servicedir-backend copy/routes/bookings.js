const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// 1. POST: Create a new Booking
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating booking with data:', req.body);
    
    // Validate required fields
    const { customerId, providerId, serviceId, date } = req.body;
    if (!customerId || !providerId || !serviceId || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields: customerId, providerId, serviceId, date' 
      });
    }

    const booking = new Booking(req.body);
    const savedBooking = await booking.save();
    console.log('✅ Booking created successfully:', savedBooking._id);
    res.status(201).json(savedBooking);
  } catch (err) {
    console.error('❌ Booking Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. GET: Fetch bookings for a specific user
router.get('/:userId', async (req, res) => {
  const { role } = req.query;
  
  try {
    console.log(`📖 Fetching ${role} bookings for user:`, req.params.userId);
    
    let bookings = [];
    if (role === 'customer') {
      bookings = await Booking.find({ customerId: req.params.userId })
        .populate('serviceId')
        .populate('providerId', 'name email');
    } else if (role === 'business') {
      bookings = await Booking.find({ providerId: req.params.userId })
        .populate('serviceId')
        .populate('customerId', 'name email');
    }

    console.log(`✅ Found ${bookings.length} bookings`);
    res.json(bookings);
  } catch (err) {
    console.error('❌ Error fetching bookings:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. PATCH: Update Booking Status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;