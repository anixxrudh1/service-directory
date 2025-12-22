const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Service = require('../models/Service');

// 1. GET: Fetch all reviews for a specific service
router.get('/:serviceId', async (req, res) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.serviceId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Add a new review
router.post('/', async (req, res) => {
  try {
    const { serviceId, userId, userName, rating, comment } = req.body;

    // A. Save the Review
    const newReview = new Review({ serviceId, userId, userName, rating, comment });
    await newReview.save();

    // B. Recalculate Average Rating for the Service
    const reviews = await Review.find({ serviceId });
    const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);

    // C. Update the Service with new stats
    await Service.findByIdAndUpdate(serviceId, {
      rating: averageRating,
      reviewCount: reviews.length
    });

    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;