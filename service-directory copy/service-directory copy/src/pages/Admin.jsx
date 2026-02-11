import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Search, Filter, BarChart3, Users, Zap, ChevronLeft, FolderOpen } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0 });
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'category-detail'
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);
  const [categoryStats, setCategoryStats] = useState({});

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch all services
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, categoriesRes] = await Promise.all([
          fetch('http://localhost:5001/api/services'),
          fetch('http://localhost:5001/api/services/categories/all')
        ]);

        const servicesData = await servicesRes.json();
        const categoriesData = await categoriesRes.json();

        setServices(servicesData);
        setFilteredServices(servicesData);
        setCategories(categoriesData);

        // Calculate stats
        setStats({
          total: servicesData.length,
          pending: servicesData.filter(s => !s.approved).length,
          active: servicesData.filter(s => s.approved).length
        });

        // Calculate category stats
        const catStats = {};
        categoriesData.forEach(cat => {
          const count = servicesData.filter(s => s.category === cat).length;
          catStats[cat] = count;
        });
        setCategoryStats(catStats);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter services based on search and category
  useEffect(() => {
    let filtered = services;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [searchTerm, selectedCategory, services]);

  // Delete service
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const res = await fetch(`http://localhost:5001/api/services/${serviceId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setServices(services.filter(s => s._id !== serviceId));
        alert('Service deleted successfully');
      } else {
        alert('Failed to delete service');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting service');
    }
  };

  // Handle category click
  const handleCategoryClick = (categoryName) => {
    setSelectedCategoryName(categoryName);
    setSelectedCategory(categoryName);
    setViewMode('category-detail');
  };

  // Handle back to overview
  const handleBackToOverview = () => {
    setViewMode('overview');
    setSelectedCategory('all');
    setSelectedCategoryName(null);
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  // OVERVIEW VIEW
  if (viewMode === 'overview') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-2xl">
                  🔐
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600">Manage all services and categories</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/users')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-md"
              >
                <Users className="w-5 h-5" />
                Manage Users
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Services</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Services</p>
                  <h3 className="text-3xl font-bold text-green-600 mt-2">{stats.active}</h3>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Categories</p>
                  <h3 className="text-3xl font-bold text-yellow-600 mt-2">{categories.length}</h3>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                  <FolderOpen className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Categories</h2>
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading categories...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Services</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Active Services</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categories.map((category) => {
                      const active = services.filter(s => s.category === category && s.approved).length;
                      return (
                        <tr key={category} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-lg">
                                📁
                              </div>
                              <p className="font-medium text-gray-900">{category}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-bold text-blue-600">{categoryStats[category] || 0}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-bold text-green-600">{active}</span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleCategoryClick(category)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <ChevronLeft className="w-4 h-4 rotate-180" />
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // CATEGORY DETAIL VIEW
  const categoryServices = services.filter(s => s.category === selectedCategoryName);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={handleBackToOverview}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Categories
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl">
              📁
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{selectedCategoryName}</h1>
              <p className="text-gray-600">Manage all services in this category</p>
            </div>
          </div>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Services</p>
            <h3 className="text-3xl font-bold text-blue-600 mt-2">{categoryServices.length}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Active Services</p>
            <h3 className="text-3xl font-bold text-green-600 mt-2">
              {categoryServices.filter(s => s.approved).length}
            </h3>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Pending Review</p>
            <h3 className="text-3xl font-bold text-yellow-600 mt-2">
              {categoryServices.filter(s => !s.approved).length}
            </h3>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Services</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No services found in this category</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={service.image} alt={service.name} className="w-10 h-10 rounded object-cover" />
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-500">{service._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{service.providerId?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{service.providerId?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">${service.price}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{service.location}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-yellow-600">
                          {service.rating ? `${service.rating}/5` : 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          service.approved 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {service.approved ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredServices.length}</span> of <span className="font-semibold">{categoryServices.length}</span> services in this category
        </div>
      </div>
    </div>
  );
};

export default Admin;
