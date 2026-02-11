const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  serviceDetails: {
    name: String,
    description: String,
    price: Number,
    date: Date,
    location: String
  },
  customerDetails: {
    name: String,
    email: String,
    phone: String
  },
  providerDetails: {
    name: String,
    email: String,
    phone: String,
    businessName: String
  },
  subtotal: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'cancelled'],
    default: 'draft'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'refunded'],
    default: 'pending'
  },
  pdfUrl: String,
  notes: String,
  dueDate: Date,
  issuedDate: {
    type: Date,
    default: Date.now
  },
  paidDate: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
