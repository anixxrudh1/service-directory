const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Models
const User = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Contact = require('./models/Contact');
const LoginHistory = require('./models/LoginHistory');
const Payment = require('./models/Payment');
const Wallet = require('./models/Wallet');
const Invoice = require('./models/Invoice');

// Import Routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const contactRoutes = require('./routes/contacts');
const paymentRoutes = require('./routes/payments');
const walletRoutes = require('./routes/wallets');
const invoiceRoutes = require('./routes/invoices');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/serviceDirDB';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    seedDatabase(); // Seed database with sample data on startup
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    // Continue running with empty database
  });

// Function to seed the database with sample services
async function seedDatabase() {
  try {
    // Always reseed to get latest categories
    console.log('🌱 Clearing and reseeding database with sample services...');
    await Service.deleteMany({});
    await User.deleteMany({});

    // Create sample provider user
    const provider = new User({
      name: 'Service Provider',
      email: 'provider@example.com',
      password: 'hashed_password_here',
      role: 'business',
      businessName: 'Expert Services Co.',
      businessCategory: 'Multi-Service'
    });
    await provider.save();

    // Sample services
    const sampleServices = [
      {
        name: 'Professional Plumbing Services',
        category: 'Plumbing',
        description: 'Expert plumbing repairs and installations for residential and commercial properties',
        location: 'New York, NY',
        price: 85,
        phone: '555-0101',
        rating: 4.8,
        reviewCount: 45,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'Expert Electrical Work',
        category: 'Electrical',
        description: 'Licensed electrician providing safe and efficient electrical services',
        location: 'Los Angeles, CA',
        price: 95,
        phone: '555-0102',
        rating: 4.9,
        reviewCount: 62,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'Deep Cleaning Services',
        category: 'Cleaning',
        description: 'Professional deep cleaning for homes and offices with eco-friendly products',
        location: 'Chicago, IL',
        price: 65,
        phone: '555-0103',
        rating: 4.7,
        reviewCount: 38,
        providerId: provider._id,
        image: 'https://clearchoiceuk.com/wp-content/uploads/2018/08/qualities-and-skills-of-a-commercial-cleaner.jpg'
      },
      {
        name: 'Custom Carpentry Work',
        category: 'Carpentry',
        description: 'Fine woodworking and custom carpentry for all your home renovation needs',
        location: 'Houston, TX',
        price: 120,
        phone: '555-0104',
        rating: 4.9,
        reviewCount: 51,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'Interior & Exterior Painting',
        category: 'Painting',
        description: 'High-quality painting services with premium paints and professional finish',
        location: 'Phoenix, AZ',
        price: 75,
        phone: '555-0105',
        rating: 4.6,
        reviewCount: 29,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'Landscape Design & Maintenance',
        category: 'Landscaping',
        description: 'Beautiful landscape design and ongoing maintenance for your outdoor space',
        location: 'Miami, FL',
        price: 110,
        phone: '555-0106',
        rating: 4.8,
        reviewCount: 35,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'HVAC Installation & Repair',
        category: 'HVAC',
        description: 'Professional heating, cooling, and ventilation system services',
        location: 'Denver, CO',
        price: 150,
        phone: '555-0107',
        rating: 4.9,
        reviewCount: 41,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'Water Damage Restoration',
        category: 'Water Damage',
        description: 'Emergency water damage repair and complete restoration services',
        location: 'Seattle, WA',
        price: 200,
        phone: '555-0108',
        rating: 4.7,
        reviewCount: 28,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'Premium Hair & Beauty Salon',
        category: 'Hair & Beauty',
        description: 'Professional hair styling, cutting, coloring, and beauty treatments',
        location: 'Boston, MA',
        price: 65,
        phone: '555-0109',
        rating: 4.8,
        reviewCount: 92,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1487412720507-e21cc028cb29?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'Professional Pet Grooming',
        category: 'Pet Services',
        description: 'Expert pet grooming, training, and boarding services for all breeds',
        location: 'Austin, TX',
        price: 55,
        phone: '555-0110',
        rating: 4.9,
        reviewCount: 67,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'Expert Tutoring Services',
        category: 'Education',
        description: 'Professional tutoring for all subjects and test preparation',
        location: 'San Francisco, CA',
        price: 60,
        phone: '555-0111',
        rating: 4.8,
        reviewCount: 54,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'Professional Photography Services',
        category: 'Photography',
        description: 'Event, portrait, and product photography with professional editing',
        location: 'Portland, OR',
        price: 250,
        phone: '555-0112',
        rating: 4.9,
        reviewCount: 78,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1547658528-d9f12bfbb57d?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'Moving & Hauling Solutions',
        category: 'Moving & Hauling',
        description: 'Professional moving, packing, and item hauling services',
        location: 'Atlanta, GA',
        price: 120,
        phone: '555-0113',
        rating: 4.6,
        reviewCount: 35,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1534949520255-2c51fb47dd9f?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'Interior Design & Furniture Installation',
        category: 'Furniture & Decor',
        description: 'Professional interior design and furniture installation services',
        location: 'Miami, FL',
        price: 95,
        phone: '555-0114',
        rating: 4.7,
        reviewCount: 42,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'General Handyman Solutions',
        category: 'General Handyman',
        description: 'All-purpose handyman services for repairs and home maintenance',
        location: 'Nashville, TN',
        price: 70,
        phone: '555-0115',
        rating: 4.7,
        reviewCount: 61,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=60'
      },
      {
        name: 'Professional Locksmith Services',
        category: 'Locksmith',
        description: '24/7 locksmith services for emergency lock repair and installation',
        location: 'Philadelphia, PA',
        price: 85,
        phone: '555-0116',
        rating: 4.8,
        reviewCount: 73,
        providerId: provider._id,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=60'
      }
    ];

    await Service.insertMany(sampleServices);
    console.log('✅ Database seeded with 6 sample services');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/invoices', invoiceRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('ServiceDir Backend is Running!');
});

// Test auth route
app.post('/api/auth/test', (req, res) => {
  console.log("✅ Test route received:", req.body);
  res.json({ message: 'API is working', receivedData: req.body });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});