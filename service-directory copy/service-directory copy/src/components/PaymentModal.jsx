import React, { useState } from 'react';
import { CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ isOpen, onClose, booking, service, onPaymentSuccess }) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [walletBalance, setWalletBalance] = useState(0);

  // Fetch wallet balance on mount
  React.useEffect(() => {
    if (paymentMethod === 'wallet' && user) {
      fetchWalletBalance();
    }
  }, [paymentMethod, user]);

  const fetchWalletBalance = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/wallets/balance/${user.id}`);
      const data = await res.json();
      setWalletBalance(data.balance || 0);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    }
  };

  const amount = service?.price || 0;
  const platformFee = (amount * 0.1).toFixed(2);
  const total = (amount + parseFloat(platformFee)).toFixed(2);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayWithCard = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create Payment Intent
      const intentRes = await fetch('http://localhost:5001/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking._id,
          amount: parseFloat(total),
          paymentMethod: 'card'
        })
      });

      const intentData = await intentRes.json();

      if (!intentRes.ok) {
        throw new Error(intentData.error || 'Failed to create payment intent');
      }

      // Step 2: In a real app, you'd use Stripe.js here to confirm payment
      // For demo purposes, we'll simulate successful payment
      alert('In production, Stripe Elements would handle secure card processing');

      // Step 3: Confirm payment
      const confirmRes = await fetch('http://localhost:5001/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: intentData.clientSecret,
          paymentId: intentData.paymentId
        })
      });

      if (!confirmRes.ok) {
        throw new Error('Payment confirmation failed');
      }

      // Success
      alert('Payment successful!');
      if (onPaymentSuccess) {
        onPaymentSuccess(intentData.paymentId);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithWallet = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (walletBalance < amount) {
      setError(`Insufficient wallet balance. You need $${amount.toFixed(2)} but have $${walletBalance.toFixed(2)}`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/payments/pay-with-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking._id,
          customerId: user.id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Wallet payment failed');
      }

      alert('Payment successful!');
      if (onPaymentSuccess) {
        onPaymentSuccess(data.payment._id);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-96 overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Price:</span>
                <span className="font-medium">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (10%):</span>
                <span className="font-medium">${platformFee}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-900 font-semibold">Total:</span>
                <span className="font-bold text-blue-600">${total}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: paymentMethod === 'card' ? '#3b82f6' : '' }}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4"
              />
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Credit/Debit Card</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: paymentMethod === 'wallet' ? '#3b82f6' : '' }}>
              <input
                type="radio"
                name="payment"
                value="wallet"
                checked={paymentMethod === 'wallet'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4"
              />
              <Wallet className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <span className="font-medium text-gray-900">Wallet </span>
                <span className="text-xs text-gray-500">(Balance: ${walletBalance.toFixed(2)})</span>
              </div>
            </label>
          </div>

          {/* Card Form */}
          {paymentMethod === 'card' && (
            <form onSubmit={handlePayWithCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="4242 4242 4242 4242"
                  value={cardDetails.cardNumber}
                  onChange={handleCardChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={handleCardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={handleCardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Processing...' : `Pay $${total}`}
              </button>
            </form>
          )}

          {/* Wallet Payment */}
          {paymentMethod === 'wallet' && (
            <button
              onClick={handlePayWithWallet}
              disabled={loading || walletBalance < amount}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Processing...' : `Pay $${total} from Wallet`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
