const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// 1. POST: Create a new Service
router.post('/', async (req, res) => {
  // ... (Keep your existing POST logic exactly as is)
  console.log("📝 Creating new service:", req.body.name);
  try {
    const newService = new Service(req.body);
    const savedService = await newService.save();
    console.log("✅ Service created successfully");
    res.status(201).json(savedService);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET: Fetch Services (UPDATED to support filtering)
router.get('/', async (req, res) => {
  const { providerId } = req.query; // Check for ?providerId=... in URL
  const filter = providerId ? { providerId } : {}; // If exists, filter by it

  try {
    const services = await Service.find(filter).sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET Single Service
router.get('/:id', async (req, res) => {
  // ... (Keep existing GET /:id logic)
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE: Remove a Service (NEW ROUTE)
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