import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const role = user?.role === 'business' ? 'provider' : 'customer';
      const res = await fetch(`http://localhost:5001/api/invoices/user/${user.id}?role=${role}&limit=50`);
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (invoiceNumber) => {
    window.location.href = `http://localhost:5001/api/invoices/${invoiceNumber}/download`;
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please sign in to view invoices.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-2">View and download your invoices</p>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {invoices.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No invoices yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{invoice.serviceDetails?.name || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">${invoice.totalAmount?.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          invoice.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : invoice.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{new Date(invoice.issuedDate).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(invoice)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(invoice._id)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {isModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Invoice Header */}
              <div className="border-b border-gray-200 pb-6">
                <p className="text-sm font-semibold text-gray-500 mb-2">INVOICE NUMBER</p>
                <p className="text-3xl font-bold text-gray-900">{selectedInvoice.invoiceNumber}</p>
              </div>

              {/* Bill To / Service Provider */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Bill To</p>
                  <p className="font-semibold text-gray-900">{selectedInvoice.customerDetails?.name}</p>
                  <p className="text-sm text-gray-600">{selectedInvoice.customerDetails?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Service Provider</p>
                  <p className="font-semibold text-gray-900">{selectedInvoice.providerDetails?.businessName}</p>
                  <p className="text-sm text-gray-600">{selectedInvoice.providerDetails?.email}</p>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Service Details</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Service: </span>
                    <span className="font-medium text-gray-900">{selectedInvoice.serviceDetails?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date: </span>
                    <span className="font-medium text-gray-900">{new Date(selectedInvoice.serviceDetails?.date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location: </span>
                    <span className="font-medium text-gray-900">{selectedInvoice.serviceDetails?.location}</span>
                  </div>
                </div>
              </div>

              {/* Amount Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Amount Details</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${selectedInvoice.subtotal?.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">${selectedInvoice.tax?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee:</span>
                    <span className="font-medium">${selectedInvoice.platformFee?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-blue-600">${selectedInvoice.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment Status</p>
                <p className={`text-sm font-bold uppercase ${selectedInvoice.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {selectedInvoice.paymentStatus}
                </p>
                {selectedInvoice.paidDate && (
                  <p className="text-sm text-gray-600 mt-2">Paid on {new Date(selectedInvoice.paidDate).toLocaleDateString()}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleDownload(selectedInvoice._id)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
