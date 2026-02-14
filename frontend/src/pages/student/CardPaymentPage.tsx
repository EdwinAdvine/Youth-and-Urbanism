import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { CreditCard, ArrowLeft, CheckCircle, Shield, Lock } from 'lucide-react';

const CardPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const savedCards = [
    { id: '1', last4: '4532', brand: 'Visa', expiry: '12/27' },
    { id: '2', last4: '8901', brand: 'Mastercard', expiry: '03/26' },
  ];

  const quickAmounts = [500, 1000, 2000, 5000];

  const formatCardNumber = (val: string) => {
    const nums = val.replace(/\D/g, '').slice(0, 16);
    return nums.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const nums = val.replace(/\D/g, '').slice(0, 4);
    if (nums.length > 2) return nums.slice(0, 2) + '/' + nums.slice(2);
    return nums;
  };

  const handleSubmit = () => {
    if (amount) {
      setStep('processing');
      setTimeout(() => setStep('success'), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-400" /> Card Payment
          </h1>
          <p className="text-gray-600 dark:text-white/70">Add funds via Visa or Mastercard</p>
        </div>
      </div>

      {step === 'form' && (
        <>
          {/* Saved Cards */}
          {savedCards.length > 0 && (
            <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
              <h3 className="text-gray-900 dark:text-white font-medium mb-3">Saved Cards</h3>
              <div className="space-y-2">
                {savedCards.map((card) => (
                  <button
                    key={card.id}
                    className={`w-full p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius} flex items-center gap-3 text-left`}
                  >
                    <div className={`w-10 h-7 ${borderRadius} bg-gradient-to-r ${card.brand === 'Visa' ? 'from-blue-600 to-blue-400' : 'from-orange-600 to-yellow-400'} flex items-center justify-center`}>
                      <span className="text-gray-900 dark:text-white text-[8px] font-bold">{card.brand === 'Visa' ? 'VISA' : 'MC'}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-900 dark:text-white text-sm">•••• •••• •••• {card.last4}</span>
                      <span className="text-gray-400 dark:text-white/40 text-xs ml-2">Exp {card.expiry}</span>
                    </div>
                    <CreditCard className="w-4 h-4 text-gray-400 dark:text-white/30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount */}
          <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <label className="block text-gray-900 dark:text-white font-medium mb-2">Amount (KES)</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter amount"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white text-xl placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500`}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  onClick={() => setAmount(String(qa))}
                  className={`py-2 ${borderRadius} text-sm font-medium ${
                    amount === String(qa) ? 'bg-blue-500 text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  {qa.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* New Card Details */}
          <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <h3 className="text-gray-900 dark:text-white font-medium mb-3">Or use a new card</h3>
            <div className="space-y-3">
              <div>
                <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500`}
                />
              </div>
              <div>
                <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Expiry</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500`}
                  />
                </div>
                <div>
                  <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">CVV</label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500`}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!amount}
            className={`w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-bold ${borderRadius} flex items-center justify-center gap-2`}
          >
            <Lock className="w-4 h-4" /> Pay KES {amount ? Number(amount).toLocaleString() : '0'}
          </button>

          <div className={`p-3 bg-gray-50 dark:bg-white/5 ${borderRadius} flex items-center gap-2`}>
            <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <p className="text-gray-500 dark:text-white/50 text-xs">Secured by Paystack. Your card details are encrypted and never stored on our servers.</p>
          </div>
        </>
      )}

      {step === 'processing' && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center animate-spin">
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment...</h2>
          <p className="text-gray-500 dark:text-white/60">Please wait while we process your card payment</p>
        </div>
      )}

      {step === 'success' && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-500 dark:text-white/60 mb-1">KES {Number(amount).toLocaleString()} has been added to your wallet</p>
          <p className="text-gray-400 dark:text-white/40 text-sm mb-6">Reference: PSK{Date.now().toString().slice(-8)}</p>
          <button
            onClick={() => navigate('/dashboard/student/wallet')}
            className={`px-6 py-2 bg-blue-500 hover:bg-blue-600 text-gray-900 dark:text-white ${borderRadius}`}
          >
            Back to Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default CardPaymentPage;
