import React, { useState } from 'react';
import { X, CreditCard, DollarSign, CheckCircle, Smartphone } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, bookingDetails, onPaymentSuccess }) => {
  const [paymentStep, setPaymentStep] = useState('method'); // method, processing, success
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Call backend to create payment intent
      const response = await fetch('http://localhost:5001/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingDetails?.id,
          amount: bookingDetails?.totalPrice,
          paymentMethod: selectedMethod
        })
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const data = await response.json();

      // Simulate payment processing
      setTimeout(() => {
        setPaymentStep('success');
        setIsProcessing(false);
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Payment</h2>
          <button
            onClick={() => {
              onClose();
              setPaymentStep('method');
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {paymentStep === 'method' && (
            <div className="space-y-4">
              {/* Amount */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-gray-600 text-sm mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${bookingDetails?.totalPrice?.toFixed(2)}
                </p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-blue-600 rounded-lg cursor-pointer bg-blue-50">
                  <input
                    type="radio"
                    name="method"
                    value="card"
                    checked={selectedMethod === 'card'}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="mr-3"
                  />
                  <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="flex-1">
                    <p className="font-medium text-gray-800">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                  </span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-200">
                  <input
                    type="radio"
                    name="method"
                    value="wallet"
                    checked={selectedMethod === 'wallet'}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="mr-3"
                  />
                  <DollarSign className="w-5 h-5 mr-3 text-purple-600" />
                  <span className="flex-1">
                    <p className="font-medium text-gray-800">Wallet</p>
                    <p className="text-sm text-gray-600">Use wallet balance</p>
                  </span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-200">
                  <input
                    type="radio"
                    name="method"
                    value="upi"
                    checked={selectedMethod === 'upi'}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="mr-3"
                  />
                  <Smartphone className="w-5 h-5 mr-3 text-green-600" />
                  <span className="flex-1">
                    <p className="font-medium text-gray-800">UPI</p>
                    <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
                  </span>
                </label>
              </div>

              {/* Payment Details */}
              {selectedMethod === 'card' && (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3 animate-fadeIn">
                  <input type="text" placeholder="Card Number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                  <div className="flex gap-3">
                    <input type="text" placeholder="MM/YY" className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                    <input type="text" placeholder="CVV" className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <input type="text" placeholder="Cardholder Name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              )}

              {selectedMethod === 'upi' && (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center animate-fadeIn">
                  <p className="text-sm font-medium text-gray-800 mb-1">Scan QR Code to Pay</p>
                  <p className="text-xs text-gray-500 mb-3">Use any UPI app (GPay, PhonePe, Paytm)</p>
                  <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=test@upi&pn=ServiceDirectory&am=${bookingDetails?.totalPrice}`} 
                      alt="UPI QR Code" 
                      className="w-32 h-32" 
                    />
                  </div>
                </div>
              )}

              {/* Terms */}
              <label className="flex items-start space-x-2 text-sm text-gray-600">
                <input type="checkbox" className="mt-1" defaultChecked />
                <span>
                  I agree to the <a href="#" className="text-blue-600 hover:underline">terms and conditions</a>
                </span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    onClose();
                    setPaymentStep('method');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 transition"
                >
                  {isProcessing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Payment Successful!</h3>
              <p className="text-gray-600">
                Your booking has been confirmed. Check your email for details.
              </p>
              <button
                onClick={() => {
                  onClose();
                  setPaymentStep('method');
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
