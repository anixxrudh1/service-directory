import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, MapPin, Calendar, Check, X, Briefcase, ChevronLeft, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AddServiceModal from '../components/AddServiceModal';

const Profile = () => {
  const { user } = useAuth();
  const [myServices, setMyServices] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [servicesByCategory, setServicesByCategory] = useState({});
  const [viewMode, setViewMode] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        if (user.role === 'business') {
          const servicesRes = await fetch(`http://localhost:5001/api/services?providerId=${user.id}`);
          const servicesData = await servicesRes.json();
          setMyServices(servicesData);
          setActiveTab('services');

          const grouped = {};
          const uniqueCategories = [];
          servicesData.forEach(service => {
            if (!grouped[service.category]) {
              grouped[service.category] = [];
              uniqueCategories.push(service.category);
            }
            grouped[service.category].push(service);
          });
          setServicesByCategory(grouped);
          setCategories(uniqueCategories);
        }

        const bookingsRes = await fetch(`http://localhost:5001/api/bookings/${user.id}?role=${user.role}`);
        const bookingsData = await bookingsRes.json();
        setMyBookings(bookingsData);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`http://localhost:5001/api/services/${serviceId}`, { method: 'DELETE' });
      if (res.ok) {
        setMyServices(myServices.filter(s => s._id !== serviceId));
        const updated = { ...servicesByCategory };
        Object.keys(updated).forEach(cat => {
          updated[cat] = updated[cat].filter(s => s._id !== serviceId);
        });
        setServicesByCategory(updated);
      }
    } catch (err) {
      alert("Failed to delete service.");
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updatedBooking = await res.json();
        setMyBookings(myBookings.map(b => b._id === bookingId ? updatedBooking : b));
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const refreshBookings = async () => {
    try {
      const bookingsRes = await fetch(`http://localhost:5001/api/bookings/${user.id}?role=${user.role}`);
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setMyBookings(bookingsData);
      }
    } catch (err) {
      console.error("Error refreshing bookings:", err);
    }
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setViewMode('category-detail');
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    setSelectedCategory(null);
  };

  if (!user) return null;

  // BUSINESS OWNER PORTAL - OVERVIEW VIEW
  if (user.role === 'business' && viewMode === 'overview') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {user.email}
                </p>
                <div className="mt-4">
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide border border-blue-100">
                    Business Owner Portal
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'services' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              My Services
            </button>
            <button
              onClick={() => {
                setActiveTab('bookings');
                refreshBookings();
              }}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'bookings' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Incoming Bookings
            </button>
          </div>

          {/* LOADING STATE */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your dashboard...</p>
            </div>
          ) : (
            <>
              {/* SERVICES VIEW */}
              {activeTab === 'services' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Manage Your Services by Category</h2>
                    <button
                      onClick={() => setIsAddServiceOpen(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Service
                    </button>
                  </div>

                  {myServices.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                      <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">You haven't listed any services yet.</p>
                      <button
                        onClick={() => setIsAddServiceOpen(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Your First Service
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Services</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Active</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {categories.map((category) => {
                            const catServices = servicesByCategory[category] || [];
                            const active = catServices.filter(s => s.approved).length;
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
                                  <span className="text-lg font-bold text-blue-600">{catServices.length}</span>
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
              )}

              {/* BOOKINGS VIEW */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-800">Incoming Bookings</h2>
                  
                  {myBookings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No bookings yet.</p>
                    </div>
                  ) : (
                    myBookings.map((booking) => (
                      <div key={booking._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-blue-100 transition-colors">
                        
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{booking.serviceId?.name || "Service Unavailable"}</h3>
                            <div className="text-sm text-gray-500 space-y-1">
                              <p>Customer: <span className="font-medium text-gray-700">{booking.customerId?.name}</span> ({booking.customerId?.email})</p>
                              <p>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-gray-50 pt-4 lg:pt-0">
                          
                          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg text-gray-700">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">
                              {new Date(booking.date).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </div>

                          {booking.status === 'pending' && (
                            <div className="flex gap-2 pl-2 border-l border-gray-100">
                              <button 
                                onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200 transition-colors" 
                                title="Confirm Booking"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors" 
                                title="Decline Booking"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          <AddServiceModal isOpen={isAddServiceOpen} onClose={() => setIsAddServiceOpen(false)} />
        </div>
      </div>
    );
  }

  // BUSINESS OWNER PORTAL - CATEGORY DETAIL VIEW
  if (user.role === 'business' && viewMode === 'category-detail') {
    const categoryServices = servicesByCategory[selectedCategory] || [];

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
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
                <h1 className="text-4xl font-bold text-gray-900">{selectedCategory}</h1>
                <p className="text-gray-600">Manage your services in this category</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Services</h2>
              <button
                onClick={() => setIsAddServiceOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Service
              </button>
            </div>

            {categoryServices.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No services in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryServices.map((service) => (
                  <div key={service._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group hover:shadow-md transition-shadow">
                    <div className="relative h-48">
                      <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                        service.approved 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {service.approved ? 'Active' : 'Pending'}
                      </div>
                      <button 
                        onClick={() => handleDeleteService(service._id)}
                        className="absolute top-2 left-2 p-2 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2 truncate">{service.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <MapPin className="w-4 h-4 mr-1" /> {service.location}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                        <span className="font-bold text-blue-600">${service.price}</span>
                        <Link to={`/service/${service._id}`} className="text-sm text-blue-600 hover:underline">View</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <AddServiceModal isOpen={isAddServiceOpen} onClose={() => setIsAddServiceOpen(false)} />
        </div>
      </div>
    );
  }

  // CUSTOMER PROFILE VIEW
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {user.email}
              </p>
              <div className="mt-4">
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide border border-blue-100">
                  Customer Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your bookings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">My Bookings History</h2>
            
            {myBookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No bookings yet.</p>
              </div>
            ) : (
              myBookings.map((booking) => (
                <div key={booking._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-blue-100 transition-colors">
                  
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{booking.serviceId?.name || "Service Unavailable"}</h3>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Provider: <span className="font-medium text-gray-700">{booking.providerId?.name}</span></p>
                        <p>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-gray-50 pt-4 lg:pt-0">
                    
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg text-gray-700">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">
                        {new Date(booking.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </div>

                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this booking?')) {
                            handleStatusUpdate(booking._id, 'cancelled');
                          }
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors text-sm font-medium flex items-center gap-2" 
                        title="Cancel Booking"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
