import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  CreditCard,
  Smartphone,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
  Shield,
  Clock,
  TrendingUp,
  Wallet,
  Calendar,
  ArrowRight,
  Info,
  Lock,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import {
  initiateMpesaPayment,
  initiatePayPalPayment,
  initiateStripePayment,
  formatMpesaPhoneNumber,
} from '../services/paymentService';

// Payment gateway types
type PaymentGateway = 'mpesa' | 'paypal' | 'stripe';

interface PaymentFormData {
  gateway: PaymentGateway;
  amount: string;
  phoneNumber: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
  purpose: string;
}

interface Transaction {
  id: string;
  amount: number;
  gateway: PaymentGateway;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  reference: string;
  purpose: string;
}

interface ValidationErrors {
  amount?: string;
  phoneNumber?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVC?: string;
  purpose?: string;
}

const PaymentPage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState<PaymentFormData>({
    gateway: 'mpesa',
    amount: '',
    phoneNumber: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    purpose: 'tuition',
  });

  // Load recent transactions on mount
  useEffect(() => {
    loadRecentTransactions();
  }, []);

  const loadRecentTransactions = async () => {
    try {
      // Mock data for demonstration - replace with actual API call
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          amount: 5000,
          gateway: 'mpesa',
          status: 'completed',
          date: new Date(Date.now() - 86400000).toISOString(),
          reference: 'MPE12345678',
          purpose: 'Tuition Fee - Term 1',
        },
        {
          id: '2',
          amount: 2500,
          gateway: 'mpesa',
          status: 'completed',
          date: new Date(Date.now() - 172800000).toISOString(),
          reference: 'MPE87654321',
          purpose: 'Course Materials',
        },
        {
          id: '3',
          amount: 1500,
          gateway: 'paypal',
          status: 'completed',
          date: new Date(Date.now() - 259200000).toISOString(),
          reference: 'PP-ABC123',
          purpose: 'Extra Lessons',
        },
        {
          id: '4',
          amount: 3000,
          gateway: 'stripe',
          status: 'pending',
          date: new Date(Date.now() - 345600000).toISOString(),
          reference: 'ST-XYZ789',
          purpose: 'Exam Fee',
        },
        {
          id: '5',
          amount: 4000,
          gateway: 'mpesa',
          status: 'failed',
          date: new Date(Date.now() - 432000000).toISOString(),
          reference: 'MPE99999999',
          purpose: 'Activity Fee',
        },
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (amount < 10) {
      newErrors.amount = 'Minimum amount is KES 10';
    } else if (amount > 150000) {
      newErrors.amount = 'Maximum amount is KES 150,000';
    }

    // Validate based on selected gateway
    if (selectedGateway === 'mpesa') {
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!/^\+254[17]\d{8}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Invalid Kenya phone number (e.g., +254712345678)';
      }
    }

    if (selectedGateway === 'stripe') {
      // Card number validation
      const cardNumber = formData.cardNumber.replace(/\s/g, '');
      if (!formData.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(cardNumber)) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }

      // Expiry validation
      if (!formData.cardExpiry) {
        newErrors.cardExpiry = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        newErrors.cardExpiry = 'Format: MM/YY';
      } else {
        const [month, year] = formData.cardExpiry.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        if (expiry < new Date()) {
          newErrors.cardExpiry = 'Card has expired';
        }
      }

      // CVC validation
      if (!formData.cardCVC) {
        newErrors.cardCVC = 'CVC is required';
      } else if (!/^\d{3,4}$/.test(formData.cardCVC)) {
        newErrors.cardCVC = 'CVC must be 3 or 4 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatPhoneNumber = (value: string) => {
    // Auto-format Kenya phone numbers
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    }
    return value;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsProcessing(true);

    try {
      const amount = parseFloat(formData.amount);
      let result;

      if (selectedGateway === 'mpesa') {
        result = await initiateMpesaPayment(
          formatMpesaPhoneNumber(formData.phoneNumber),
          amount,
          'TUHS',
          formData.purpose
        );
      } else if (selectedGateway === 'paypal') {
        result = await initiatePayPalPayment(amount, 'USD', formData.purpose);
        if (result.checkoutUrl) {
          window.open(result.checkoutUrl, '_blank');
        }
      } else {
        result = await initiateStripePayment(amount, undefined, 'USD', formData.purpose);
      }

      // Show success
      setShowSuccess(true);
      toast.success('Payment initiated successfully!');

      // Add to transactions
      const newTransaction: Transaction = {
        id: result?.transactionRef || Date.now().toString(),
        amount,
        gateway: selectedGateway,
        status: 'pending',
        date: new Date().toISOString(),
        reference: result?.transactionRef || `${selectedGateway.toUpperCase()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        purpose: formData.purpose,
      };
      setTransactions([newTransaction, ...transactions.slice(0, 4)]);

      // Reset form after delay
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          gateway: selectedGateway,
          amount: '',
          phoneNumber: '',
          cardNumber: '',
          cardExpiry: '',
          cardCVC: '',
          purpose: 'tuition',
        });
      }, 3000);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getGatewayIcon = (gateway: PaymentGateway) => {
    switch (gateway) {
      case 'mpesa':
        return <Smartphone className="w-5 h-5" />;
      case 'paypal':
        return <Wallet className="w-5 h-5" />;
      case 'stripe':
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <X className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#181C1F] text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Make a Payment</h1>
            <p className="text-gray-400">
              Secure payment processing for tuition, courses, and other services
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gateway Selection */}
              <div className="bg-[#1a1f26] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-copilot-blue" />
                  Select Payment Method
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* M-Pesa Option */}
                  <button
                    onClick={() => {
                      setSelectedGateway('mpesa');
                      setFormData((prev) => ({ ...prev, gateway: 'mpesa' }));
                    }}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      selectedGateway === 'mpesa'
                        ? 'border-copilot-blue bg-copilot-blue/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {selectedGateway === 'mpesa' && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-copilot-blue" />
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">M-Pesa</div>
                        <div className="text-xs text-gray-400 mt-1">Mobile Money</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        Recommended
                      </span>
                    </div>
                  </button>

                  {/* PayPal Option */}
                  <button
                    onClick={() => {
                      setSelectedGateway('paypal');
                      setFormData((prev) => ({ ...prev, gateway: 'paypal' }));
                    }}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      selectedGateway === 'paypal'
                        ? 'border-copilot-blue bg-copilot-blue/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {selectedGateway === 'paypal' && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-copilot-blue" />
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">PayPal</div>
                        <div className="text-xs text-gray-400 mt-1">Digital Wallet</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-center">
                      <span className="text-gray-500">International</span>
                    </div>
                  </button>

                  {/* Stripe Option */}
                  <button
                    onClick={() => {
                      setSelectedGateway('stripe');
                      setFormData((prev) => ({ ...prev, gateway: 'stripe' }));
                    }}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      selectedGateway === 'stripe'
                        ? 'border-copilot-blue bg-copilot-blue/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {selectedGateway === 'stripe' && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-copilot-blue" />
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-purple-500" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Card</div>
                        <div className="text-xs text-gray-400 mt-1">Debit/Credit</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-center">
                      <span className="text-gray-500">Visa, Mastercard</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Form */}
              <div className="bg-[#1a1f26] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  {getGatewayIcon(selectedGateway)}
                  Payment Details
                </h2>

                <div className="space-y-4">
                  {/* Payment Purpose */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Payment Purpose
                    </label>
                    <select
                      value={formData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      className="w-full px-4 py-3 bg-[#181C1F] border border-gray-700 rounded-lg focus:outline-none focus:border-copilot-blue transition-colors"
                    >
                      <option value="tuition">Tuition Fee</option>
                      <option value="course">Course Purchase</option>
                      <option value="materials">Learning Materials</option>
                      <option value="exam">Exam Fee</option>
                      <option value="activity">Activity Fee</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Amount (KES)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        placeholder="Enter amount"
                        className={`w-full pl-10 pr-4 py-3 bg-[#181C1F] border ${
                          errors.amount ? 'border-red-500' : 'border-gray-700'
                        } rounded-lg focus:outline-none focus:border-copilot-blue transition-colors`}
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.amount}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      Min: KES 10 | Max: KES 150,000
                    </p>
                  </div>

                  {/* M-Pesa Form */}
                  {selectedGateway === 'mpesa' && (
                    <div className="space-y-4 pt-4 border-t border-gray-700">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          M-Pesa Phone Number
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                              handleInputChange(
                                'phoneNumber',
                                formatPhoneNumber(e.target.value)
                              )
                            }
                            placeholder="+254712345678"
                            className={`w-full pl-10 pr-4 py-3 bg-[#181C1F] border ${
                              errors.phoneNumber ? 'border-red-500' : 'border-gray-700'
                            } rounded-lg focus:outline-none focus:border-copilot-blue transition-colors`}
                          />
                        </div>
                        {errors.phoneNumber && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-300">
                            <p className="font-medium mb-1">STK Push Instructions:</p>
                            <ol className="list-decimal list-inside space-y-1 text-blue-200">
                              <li>Click "Pay with M-Pesa" button below</li>
                              <li>Enter your M-Pesa PIN on your phone</li>
                              <li>Confirm the payment</li>
                              <li>You'll receive a confirmation SMS</li>
                            </ol>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-5 h-5" />
                            Pay with M-Pesa
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* PayPal Form */}
                  {selectedGateway === 'paypal' && (
                    <div className="space-y-4 pt-4 border-t border-gray-700">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-300">
                            <p className="font-medium mb-1">PayPal Secure Payment</p>
                            <p className="text-blue-200">
                              You'll be redirected to PayPal to complete your payment
                              securely. Your financial information is never shared with us.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <Lock className="w-4 h-4" />
                        <span>256-bit SSL Encryption</span>
                      </div>

                      <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-[#0070ba] hover:bg-[#005ea6] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Redirecting...
                          </>
                        ) : (
                          <>
                            <Wallet className="w-5 h-5" />
                            Pay with PayPal
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Stripe Form */}
                  {selectedGateway === 'stripe' && (
                    <div className="space-y-4 pt-4 border-t border-gray-700">
                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Card Number
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => {
                              const formatted = formatCardNumber(
                                e.target.value.replace(/\s/g, '')
                              );
                              handleInputChange('cardNumber', formatted);
                            }}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className={`w-full pl-10 pr-4 py-3 bg-[#181C1F] border ${
                              errors.cardNumber ? 'border-red-500' : 'border-gray-700'
                            } rounded-lg focus:outline-none focus:border-copilot-blue transition-colors`}
                          />
                        </div>
                        {errors.cardNumber && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.cardNumber}
                          </p>
                        )}
                      </div>

                      {/* Expiry and CVC */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Expiry Date
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={formData.cardExpiry}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length >= 2) {
                                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                }
                                handleInputChange('cardExpiry', value);
                              }}
                              placeholder="MM/YY"
                              maxLength={5}
                              className={`w-full pl-10 pr-4 py-3 bg-[#181C1F] border ${
                                errors.cardExpiry ? 'border-red-500' : 'border-gray-700'
                              } rounded-lg focus:outline-none focus:border-copilot-blue transition-colors`}
                            />
                          </div>
                          {errors.cardExpiry && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.cardExpiry}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">CVC</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={formData.cardCVC}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                handleInputChange('cardCVC', value);
                              }}
                              placeholder="123"
                              maxLength={4}
                              className={`w-full pl-10 pr-4 py-3 bg-[#181C1F] border ${
                                errors.cardCVC ? 'border-red-500' : 'border-gray-700'
                              } rounded-lg focus:outline-none focus:border-copilot-blue transition-colors`}
                            />
                          </div>
                          {errors.cardCVC && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.cardCVC}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Supported Cards */}
                      <div className="flex items-center gap-3 text-xs text-gray-400 pt-2">
                        <span>Accepted cards:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                            VISA
                          </div>
                          <div className="w-8 h-6 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">
                            MC
                          </div>
                          <div className="w-8 h-6 bg-blue-400 rounded flex items-center justify-center text-white font-bold text-xs">
                            AE
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            Pay with Card
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Success Message */}
              {showSuccess && (
                <div className="bg-green-500/10 border-2 border-green-500 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-green-400 mb-2">
                        Payment Initiated Successfully!
                      </h3>
                      <p className="text-green-300 mb-4">
                        {selectedGateway === 'mpesa' &&
                          'Please check your phone and enter your M-Pesa PIN to complete the payment.'}
                        {selectedGateway === 'paypal' &&
                          'You will be redirected to PayPal to complete your payment.'}
                        {selectedGateway === 'stripe' &&
                          'Your payment is being processed. You will receive a confirmation shortly.'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-green-200">
                        <Clock className="w-4 h-4" />
                        <span>
                          Transaction will be updated in your history once confirmed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-[#1a1f26] rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-copilot-blue" />
                  Payment Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Purpose</span>
                    <span className="font-medium capitalize">
                      {formData.purpose.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Amount</span>
                    <span className="font-medium">
                      {formData.amount ? `KES ${parseFloat(formData.amount).toLocaleString()}` : 'KES 0'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Processing Fee</span>
                    <span className="font-medium text-green-400">Free</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-copilot-blue">
                      {formData.amount ? `KES ${parseFloat(formData.amount).toLocaleString()}` : 'KES 0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-[#1a1f26] rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-copilot-blue" />
                  Recent Transactions
                </h3>

                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No transactions yet</p>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-3 bg-[#181C1F] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                              {getGatewayIcon(transaction.gateway)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                KES {transaction.amount.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-400">
                                {transaction.purpose}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`flex items-center gap-1 text-xs ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {getStatusIcon(transaction.status)}
                            <span className="capitalize">{transaction.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{transaction.reference}</span>
                          <span>
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {transactions.length > 0 && (
                  <button className="w-full mt-4 text-sm text-copilot-blue hover:text-copilot-cyan transition-colors flex items-center justify-center gap-1">
                    View All Transactions
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-[#1a1f26] rounded-xl p-6 border border-gray-800">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2 text-green-400">
                      Secure Payment
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      All transactions are encrypted and processed through secure
                      payment gateways. We never store your payment information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentPage;
