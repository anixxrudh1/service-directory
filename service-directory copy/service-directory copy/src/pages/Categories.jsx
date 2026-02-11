import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { 
  Wrench, Zap, Home, Hammer, PaintBucket, Flower2, ArrowRight,
  Droplet, Wind, Scissors, Dog, BookOpen, Camera, Truck,
  Sofa, Lightbulb, ShoppingBag, Settings
} from 'lucide-react';
import { API_URL } from '../config';

// Category metadata (icon, color, description)
const categoryMetadata = {
  'Plumbing': { icon: Wrench, color: 'bg-blue-100 text-blue-600', desc: 'Pipe repairs, installation, and maintenance.' },
  'Electrical': { icon: Zap, color: 'bg-yellow-100 text-yellow-600', desc: 'Wiring, lighting, and electrical repairs.' },
  'Cleaning': { icon: Home, color: 'bg-green-100 text-green-600', desc: 'Home and office cleaning services.' },
  'Carpentry': { icon: Hammer, color: 'bg-orange-100 text-orange-600', desc: 'Furniture repair, custom woodwork, and more.' },
  'Painting': { icon: PaintBucket, color: 'bg-purple-100 text-purple-600', desc: 'Interior and exterior painting services.' },
  'Landscaping': { icon: Flower2, color: 'bg-emerald-100 text-emerald-600', desc: 'Lawn care, gardening, and outdoor design.' },
  'HVAC': { icon: Wind, color: 'bg-cyan-100 text-cyan-600', desc: 'Heating, cooling, and ventilation services.' },
  'Water Damage': { icon: Droplet, color: 'bg-indigo-100 text-indigo-600', desc: 'Emergency repair and restoration services.' },
  'Hair & Beauty': { icon: Scissors, color: 'bg-pink-100 text-pink-600', desc: 'Hair cutting, styling, and beauty treatments.' },
  'Pet Services': { icon: Dog, color: 'bg-amber-100 text-amber-600', desc: 'Pet grooming, training, and boarding.' },
  'Education': { icon: BookOpen, color: 'bg-teal-100 text-teal-600', desc: 'Tutoring, coaching, and educational services.' },
  'Photography': { icon: Camera, color: 'bg-rose-100 text-rose-600', desc: 'Professional photography for events and portraits.' },
  'Moving & Hauling': { icon: Truck, color: 'bg-slate-100 text-slate-600', desc: 'Moving, storage, and item hauling services.' },
  'Furniture & Decor': { icon: Sofa, color: 'bg-lime-100 text-lime-600', desc: 'Interior design and furniture installation.' },
  'General Handyman': { icon: Settings, color: 'bg-gray-100 text-gray-600', desc: 'General repairs and maintenance services.' },
  'Locksmith': { icon: Lightbulb, color: 'bg-violet-100 text-violet-600', desc: 'Lock installation, repair, and emergency services.' },
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/services/categories/all`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        
        // Map fetched categories with metadata
        const categoriesWithMetadata = data.map(categoryName => ({
          id: categoryName.toLowerCase().replace(/\s+/g, '-'),
          name: categoryName,
          ...(categoryMetadata[categoryName] || {
            icon: Settings,
            color: 'bg-gray-100 text-gray-600',
            desc: 'Professional services in this category.'
          })
        }));
        
        setCategories(categoriesWithMetadata);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Could not load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Categories</h1>
          <p className="text-xl text-gray-600">Find the right professional for your specific needs</p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        )}

        {error && (
          <div className="text-center py-10 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={cat.id} 
                  to={`/?category=${cat.name}`} 
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all group border border-gray-100 hover:border-blue-100"
                >
                  <div className={`w-14 h-14 ${cat.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{cat.name}</h3>
                  <p className="text-gray-500 mb-6">{cat.desc}</p>
                  <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                    Browse Services <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && categories.length === 0 && !error && (
          <div className="text-center py-10 text-gray-500">
            <p>No categories available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;