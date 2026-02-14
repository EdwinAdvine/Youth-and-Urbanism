import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Smartphone, ArrowLeft, CheckCircle, Shield, Clock, AlertCircle } from 'lucide-react';

const MpesaTopupPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'pending' | 'success'>('form');

  const quickAmounts = [100, 250, 500, 1000, 2000, 5000];

  const handleSubmit = () => {
    if (phone && amount) {
      setStep('pending');
      setTimeout(() => setStep('success'), 3000);
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
            <Smartphone className="w-8 h-8 text-green-400" /> M-Pesa Top-up
          </h1>
          <p className="text-gray-600 dark:text-white/70">Add funds via Safaricom M-Pesa</p>
        </div>
      </div>

      {step === 'form' && (
        <>
          {/* Phone Number */}
          <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <label className="block text-gray-900 dark:text-white font-medium mb-2">M-Pesa Phone Number</label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/60 rounded-lg">+254</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="712345678"
                className={`flex-1 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-green-500`}
              />
            </div>
            <p className="text-gray-400 dark:text-white/40 text-xs mt-2">Enter the M-Pesa registered phone number</p>
          </div>

          {/* Amount */}
          <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <label className="block text-gray-900 dark:text-white font-medium mb-2">Amount (KES)</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter amount"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white text-xl placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-green-500`}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  onClick={() => setAmount(String(qa))}
                  className={`py-2 ${borderRadius} text-sm font-medium transition-colors ${
                    amount === String(qa)
                      ? 'bg-green-500 text-gray-900 dark:text-white'
                      : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  KES {qa.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {phone && amount && (
            <div className={`p-4 bg-green-500/10 ${borderRadius} border border-green-500/20`}>
              <h3 className="text-gray-900 dark:text-white font-medium mb-2">Transaction Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white/60">Phone</span>
                  <span className="text-gray-900 dark:text-white">+254{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white/60">Amount</span>
                  <span className="text-gray-900 dark:text-white font-bold">KES {Number(amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!phone || !amount || phone.length < 9}
            className={`w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-bold ${borderRadius} flex items-center justify-center gap-2`}
          >
            <Smartphone className="w-5 h-5" /> Send STK Push
          </button>

          <div className={`p-3 bg-gray-50 dark:bg-white/5 ${borderRadius} flex items-center gap-2`}>
            <Shield className="w-4 h-4 text-green-400 flex-shrink-0" />
            <p className="text-gray-500 dark:text-white/50 text-xs">Secured by Safaricom Daraja API. You will receive an M-Pesa prompt on your phone.</p>
          </div>
        </>
      )}

      {step === 'pending' && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center animate-pulse">
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Waiting for M-Pesa Confirmation</h2>
          <p className="text-gray-500 dark:text-white/60 mb-4">Please check your phone and enter your M-Pesa PIN</p>
          <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Do not close this page</span>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Top-up Successful!</h2>
          <p className="text-gray-500 dark:text-white/60 mb-1">KES {Number(amount).toLocaleString()} has been added to your wallet</p>
          <p className="text-gray-400 dark:text-white/40 text-sm mb-6">Transaction ID: MPX{Date.now().toString().slice(-8)}</p>
          <button
            onClick={() => navigate('/dashboard/student/wallet')}
            className={`px-6 py-2 bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white ${borderRadius}`}
          >
            Back to Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default MpesaTopupPage;
