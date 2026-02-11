import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, TrendingDown, Plus, Landmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5001/api/wallets/${user.id}`);
      const data = await res.json();
      setWallet(data);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    setTopupLoading(true);

    try {
      const amount = parseFloat(topupAmount);

      if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      // Create Payment Intent for wallet top-up
      const intentRes = await fetch('http://localhost:5001/api/wallets/topup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount
        })
      });

      const intentData = await intentRes.json();

      if (!intentRes.ok) {
        throw new Error(intentData.error);
      }

      // In production, you'd use Stripe.js here
      alert('In production, Stripe Elements would process the payment');

      // Simulate successful payment
      const addRes = await fetch('http://localhost:5001/api/wallets/add-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          paymentIntentId: intentData.paymentIntentId
        })
      });

      if (addRes.ok) {
        alert('Money added to wallet successfully!');
        fetchWalletData();
        setTopupAmount('');
        setIsAddMoneyOpen(false);
      }
    } catch (err) {
      alert('Error adding money: ' + err.message);
    } finally {
      setTopupLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please sign in to view your wallet.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-2">Manage your account balance and transactions</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-6 h-6" />
            <span className="text-blue-100">Available Balance</span>
          </div>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-5xl font-bold">${wallet?.balance?.toFixed(2)}</span>
            <span className="text-blue-100">USD</span>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-blue-400 pt-6">
            <div>
              <p className="text-blue-100 text-sm">Total Added</p>
              <p className="text-xl font-bold">${wallet?.totalAdded?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Total Spent</p>
              <p className="text-xl font-bold">${wallet?.totalSpent?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Total Refunded</p>
              <p className="text-xl font-bold">${wallet?.totalRefunded?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setIsAddMoneyOpen(true)}
            className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Money
          </button>

          <button className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2 transition-colors">
            <TrendingUp className="w-5 h-5" />
            Withdraw
          </button>

          <button className="bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors">
            <Landmark className="w-5 h-5" />
            Bank Account
          </button>
        </div>

        {/* Add Money Modal */}
        {isAddMoneyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Money to Wallet</h2>

              <form onSubmit={handleAddMoney} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                {topupAmount && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">${topupAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                      <span className="text-gray-900 font-semibold">Total:</span>
                      <span className="font-bold text-blue-600">${topupAmount}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddMoneyOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={topupLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {topupLoading ? 'Processing...' : 'Add Money'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction, index) => (
                <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    {transaction.type === 'credit' ? (
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-lg font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Balance: ${transaction.balanceAfter.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
