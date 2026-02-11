const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// 1. POST: Create a new Service
router.post('/', async (req, res) => {
  console.log("📝 Creating new service:", req.body.name);
  try {
    const service = new Service(req.body);
    const savedService = await service.save();
    console.log("✅ Service created successfully");
    res.status(201).json(savedService);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET: Fetch unique categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Service.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET: Fetch Services (supports filtering by providerId)
router.get('/', async (req, res) => {
  const { providerId } = req.query;

  try {
    const query = providerId ? { providerId } : {};
    const services = await Service.find(query)
      .populate('providerId', 'name businessName email phone');
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET Single Service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('providerId', 'name businessName email phone');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. PUT: Update a Service
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. DELETE: Remove a Service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;