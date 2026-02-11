const express = require('express');
const Contact = require('../models/Contact');

const router = express.Router();

// POST - Save a new contact message
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields: firstName, lastName, email, message' });
    }

    console.log('📝 Saving contact message from:', email);

    const newContact = new Contact({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    });

    const savedContact = await newContact.save();

    console.log('✅ Contact message saved:', savedContact._id);

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully!',
      contact: savedContact
    });

  } catch (err) {
    console.error('❌ Error saving contact message:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0] });
    }

    res.status(500).json({ error: 'Failed to save message. Please try again later.' });
  }
});

// GET - Retrieve all contact messages (for admin dashboard)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // Filter by status: 'new', 'read', 'replied'

    let query = {};
    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('❌ Error fetching contact messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET - Get a specific contact message
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Mark as read
    if (!contact.isRead) {
      contact.isRead = true;
      contact.readAt = new Date();
      contact.status = 'read';
      await contact.save();
    }

    res.json(contact);

  } catch (err) {
    console.error('❌ Error fetching contact message:', err);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

// PATCH - Update contact message status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'replied' && { repliedAt: new Date() })
      },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }

    console.log('✅ Contact message status updated:', contact._id);

    res.json({
      success: true,
      message: 'Status updated successfully',
      contact
    });

  } catch (err) {
    console.error('❌ Error updating contact message:', err);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// DELETE - Delete a contact message
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }

    console.log('✅ Contact message deleted:', contact._id);

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });

  } catch (err) {
    console.error('❌ Error deleting contact message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
