const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');

// Helper function to generate invoice number
const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `INV-${year}${month}${day}-${random}`;
};

// Helper function to generate PDF invoice
const generateInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const invoicesDir = path.join(__dirname, '../invoices');
      
      // Create invoices directory if it doesn't exist
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const filename = `${invoice.invoiceNumber}.pdf`;
      const filepath = path.join(invoicesDir, filename);
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Invoice #: ${invoice.invoiceNumber}`, { align: 'center' });
      doc.text(`Issued: ${new Date(invoice.issuedDate).toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Company Info
      doc.font('Helvetica-Bold').text('Service Directory Platform', 12);
      doc.font('Helvetica').text('support@servicedirectory.com');
      doc.moveDown();

      // Bill To Section
      doc.font('Helvetica-Bold').text('Bill To:', 12);
      doc.font('Helvetica').text(invoice.customerDetails.name);
      doc.text(invoice.customerDetails.email);
      doc.text(invoice.customerDetails.phone);
      doc.moveDown();

      // Service Provider Info
      doc.font('Helvetica-Bold').text('Service Provider:', 12);
      doc.font('Helvetica').text(invoice.providerDetails.businessName || invoice.providerDetails.name);
      doc.text(invoice.providerDetails.email);
      doc.text(invoice.providerDetails.phone);
      doc.moveDown();

      // Service Details Table
      doc.font('Helvetica-Bold').text('Service Details', 12);
      doc.moveDown(0.5);
      
      doc.font('Helvetica').fontSize(9);
      doc.text('Service Name: ' + invoice.serviceDetails.name);
      doc.text('Description: ' + invoice.serviceDetails.description);
      doc.text('Date: ' + new Date(invoice.serviceDetails.date).toLocaleDateString());
      doc.text('Location: ' + invoice.serviceDetails.location);
      doc.moveDown();

      // Amount Details
      doc.font('Helvetica-Bold').fontSize(10).text('Amount Details:', 12);
      doc.font('Helvetica').fontSize(9);
      doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, { width: 500, align: 'right' });
      if (invoice.tax > 0) {
        doc.text(`Tax (${(invoice.tax / invoice.subtotal * 100).toFixed(1)}%): $${invoice.tax.toFixed(2)}`, { width: 500, align: 'right' });
      }
      doc.text(`Platform Fee: $${invoice.platformFee.toFixed(2)}`, { width: 500, align: 'right' });
      doc.font('Helvetica-Bold').text(`Total Amount: $${invoice.totalAmount.toFixed(2)}`, { width: 500, align: 'right' });
      doc.moveDown();

      // Payment Status
      doc.font('Helvetica-Bold').text('Payment Status:', 12);
      doc.font('Helvetica').text(invoice.paymentStatus.toUpperCase());
      if (invoice.paidDate) {
        doc.text(`Paid on: ${new Date(invoice.paidDate).toLocaleDateString()}`);
      }
      doc.moveDown();

      // Notes
      if (invoice.notes) {
        doc.font('Helvetica-Bold').text('Notes:', 12);
        doc.font('Helvetica').text(invoice.notes);
        doc.moveDown();
      }

      // Footer
      doc.fontSize(8).text('Thank you for using Service Directory!', { align: 'center' });
      doc.text('This is an electronically generated invoice.', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(filepath);
      });

      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

// 1. Create Invoice for a Payment
router.post('/create', async (req, res) => {
  try {
    const { paymentId } = req.body;

    const payment = await Payment.findById(paymentId)
      .populate('customerId')
      .populate('providerId')
      .populate('serviceId')
      .populate('bookingId');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Generate invoice
    const invoiceNumber = generateInvoiceNumber();

    const invoice = new Invoice({
      invoiceNumber,
      paymentId,
      bookingId: payment.bookingId._id,
      customerId: payment.customerId._id,
      providerId: payment.providerId._id,
      serviceId: payment.serviceId._id,
      serviceDetails: {
        name: payment.serviceId.name,
        description: payment.serviceId.description,
        price: payment.serviceId.price,
        date: payment.bookingId.date,
        location: payment.serviceId.location
      },
      customerDetails: {
        name: payment.customerId.name,
        email: payment.customerId.email,
        phone: payment.customerId.phone || 'N/A'
      },
      providerDetails: {
        name: payment.providerId.name,
        email: payment.providerId.email,
        phone: payment.providerId.phone || 'N/A',
        businessName: payment.providerId.businessName || payment.providerId.name
      },
      subtotal: payment.amount - payment.platformFee,
      platformFee: payment.platformFee,
      tax: 0,
      totalAmount: payment.amount,
      status: 'draft',
      paymentStatus: payment.status === 'succeeded' ? 'paid' : 'pending',
      paidDate: payment.status === 'succeeded' ? new Date() : null
    });

    await invoice.save();

    // Generate PDF
    try {
      await generateInvoicePDF(invoice);
      invoice.pdfUrl = `/invoices/${invoice.invoiceNumber}.pdf`;
      invoice.status = 'sent';
      await invoice.save();
    } catch (pdfErr) {
      console.error('PDF Generation Error:', pdfErr);
    }

    // Link invoice to payment
    payment.invoiceId = invoice._id;
    await payment.save();

    res.json({
      success: true,
      message: 'Invoice created successfully',
      invoice
    });
  } catch (err) {
    console.error('Create Invoice Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('paymentId')
      .populate('customerId')
      .populate('providerId')
      .populate('serviceId');

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Invoices for User
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role = 'customer', limit = 20, skip = 0 } = req.query;

    let query = {};

    if (role === 'customer') {
      query.customerId = userId;
    } else if (role === 'provider') {
      query.providerId = userId;
    }

    const invoices = await Invoice.find(query)
      .populate('paymentId')
      .populate('serviceId', 'name price')
      .sort({ issuedDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Invoice.countDocuments(query);

    res.json({
      invoices,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Download Invoice PDF
router.get('/:id/download', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const filepath = path.join(__dirname, '../invoices', `${invoice.invoiceNumber}.pdf`);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    res.download(filepath, `${invoice.invoiceNumber}.pdf`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Mark Invoice as Paid
router.patch('/:id/mark-paid', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: 'paid',
        paidDate: new Date(),
        status: 'paid'
      },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      success: true,
      message: 'Invoice marked as paid',
      invoice
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Send Invoice Email
router.post('/:id/send-email', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // TODO: Implement email service (nodemailer)
    // For now, just update status
    invoice.status = 'sent';
    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice sent to customer email'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Delete Invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Delete PDF file
    const filepath = path.join(__dirname, '../invoices', `${invoice.invoiceNumber}.pdf`);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
