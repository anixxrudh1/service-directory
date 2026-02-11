// Mock In-Memory Database for Local Testing
class MockDB {
  constructor() {
    this.users = [];
    this.services = [];
    this.bookings = [];
    this.reviews = [];
    
    // Initialize with sample services
    this.initializeSampleData();
  }

  initializeSampleData() {
    const sampleServices = [
      {
        _id: 'service_1',
        name: 'Professional Plumbing Services',
        category: 'Plumbing',
        description: 'Expert plumbing repairs and installations for residential and commercial properties',
        location: 'New York, NY',
        price: 85,
        rating: 4.8,
        reviewCount: 45,
        availability: 'Available Today',
        providerId: 'provider_1',
        image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=60'
      },
      {
        _id: 'service_2',
        name: 'Expert Electrical Work',
        category: 'Electrical',
        description: 'Licensed electrician providing safe and efficient electrical services',
        location: 'Los Angeles, CA',
        price: 95,
        rating: 4.9,
        reviewCount: 62,
        availability: 'Available Today',
        providerId: 'provider_2',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=60'
      },
      {
        _id: 'service_3',
        name: 'Deep Cleaning Services',
        category: 'Cleaning',
        description: 'Professional deep cleaning for homes and offices with eco-friendly products',
        location: 'Chicago, IL',
        price: 65,
        rating: 4.7,
        reviewCount: 38,
        availability: 'Available Today',
        providerId: 'provider_3',
        image: 'https://clearchoiceuk.com/wp-content/uploads/2018/08/qualities-and-skills-of-a-commercial-cleaner.jpg'
      },
      {
        _id: 'service_4',
        name: 'Custom Carpentry Work',
        category: 'Carpentry',
        description: 'Fine woodworking and custom carpentry for all your home renovation needs',
        location: 'Houston, TX',
        price: 120,
        rating: 4.9,
        reviewCount: 51,
        availability: 'Available Today',
        providerId: 'provider_4',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=60'
      },
      {
        _id: 'service_5',
        name: 'Interior & Exterior Painting',
        category: 'Painting',
        description: 'High-quality painting services with premium paints and professional finish',
        location: 'Phoenix, AZ',
        price: 75,
        rating: 4.6,
        reviewCount: 29,
        availability: 'Available Today',
        providerId: 'provider_5',
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop&q=60'
      },
      {
        _id: 'service_6',
        name: 'Landscape Design & Maintenance',
        category: 'Landscaping',
        description: 'Beautiful landscape design and ongoing maintenance for your outdoor space',
        location: 'Miami, FL',
        price: 110,
        rating: 4.8,
        reviewCount: 35,
        availability: 'Available Today',
        providerId: 'provider_6',
        image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&auto=format&fit=crop&q=60'
      }
    ];
    
    this.services = sampleServices;
  }

  // User methods
  async findUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  async createUser(userData) {
    const user = {
      _id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async getUserById(id) {
    return this.users.find(u => u._id === id);
  }

  // Service methods
  async createService(serviceData) {
    const service = {
      _id: `service_${Date.now()}`,
      ...serviceData,
      createdAt: new Date()
    };
    this.services.push(service);
    return service;
  }

  async getAllServices() {
    return this.services;
  }

  async getServiceById(id) {
    return this.services.find(s => s._id === id);
  }

  // Booking methods
  async createBooking(bookingData) {
    const booking = {
      _id: `booking_${Date.now()}`,
      ...bookingData,
      createdAt: new Date()
    };
    this.bookings.push(booking);
    return booking;
  }

  async getBookingsByUser(userId) {
    return this.bookings.filter(b => b.userId === userId);
  }

  // Review methods
  async createReview(reviewData) {
    const review = {
      _id: `review_${Date.now()}`,
      ...reviewData,
      createdAt: new Date()
    };
    this.reviews.push(review);
    return review;
  }

  async getReviewsByService(serviceId) {
    return this.reviews.filter(r => r.serviceId === serviceId);
  }

  // Clear all data (useful for testing)
  clearAll() {
    this.users = [];
    this.services = [];
    this.bookings = [];
    this.reviews = [];
  }
}

module.exports = new MockDB();
