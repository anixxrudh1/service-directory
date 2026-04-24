import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWallet();
      fetchTransactions();
    }
  }, [user]);

  const fetchWallet = async () => {
    try {
      const response = await fetch(`/api/wallets/${user?._id}`);
      if (response.ok) {
        const data = await response.json();
        setWallet(data);
      }
    } catch (err) {
      console.error('Error fetching wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/wallets/${user?._id}/transactions`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handleAddFunds = async () => {
    if (!amount || amount <= 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/wallets/${user?._id}/add-funds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod
        })
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        setAmount('');
        setShowAddFunds(false);
        fetchTransactions();
      }
    } catch (err) {
      console.error('Error adding funds:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-2">Manage your wallet balance and view transactions</p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold opacity-90">Available Balance</h2>
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-5xl font-bold mb-2">${wallet?.balance?.toFixed(2) || '0.00'}</p>
          <p className="opacity-75">Total Added: ${wallet?.totalAdded?.toFixed(2) || '0.00'}</p>
          <p className="opacity-75">Total Spent: ${wallet?.totalSpent?.toFixed(2) || '0.00'}</p>

          <button
            onClick={() => setShowAddFunds(!showAddFunds)}
            className="mt-6 flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Plus className="w-5 h-5" />
            Add Funds
          </button>
        </div>

        {/* Add Funds Form */}
        {showAddFunds && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Funds to Wallet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFunds}
                  disabled={isProcessing || !amount}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 transition"
                >
                  {isProcessing ? 'Processing...' : 'Add Funds'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Added</p>
                <p className="text-3xl font-bold text-green-600">${wallet?.totalAdded?.toFixed(2) || '0.00'}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-100" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-red-600">${wallet?.totalSpent?.toFixed(2) || '0.00'}</p>
              </div>
              <TrendingDown className="w-12 h-12 text-red-100" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-blue-600">${wallet?.balance?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-100" />
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800">Transaction History</h3>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{transaction.description}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1 font-medium ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No transactions yet. Add funds to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
