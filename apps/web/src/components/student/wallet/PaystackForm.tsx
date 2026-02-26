import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Lock, Shield } from 'lucide-react';

interface PaystackFormProps {
  onSubmit: (data: { amount: string; cardNumber: string; expiry: string; cvv: string; name: string }) => void;
  isProcessing?: boolean;
}

const quickAmounts = [500, 1000, 2000, 5000];

const PaystackForm: React.FC<PaystackFormProps> = ({ onSubmit, isProcessing }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const formatCardNumber = (val: string) => {
    const nums = val.replace(/\D/g, '').slice(0, 16);
    return nums.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const nums = val.replace(/\D/g, '').slice(0, 4);
    if (nums.length > 2) return nums.slice(0, 2) + '/' + nums.slice(2);
    return nums;
  };

  return (
    <div className="space-y-5">
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

      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] space-y-3`}>
        <h3 className="text-gray-900 dark:text-white font-medium">Card Details</h3>
        <input type="text" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500`} />
        <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Cardholder Name" className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500`} />
        <div className="grid grid-cols-2 gap-3">
          <input type="text" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" className={`px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500`} />
          <input type="password" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="CVV" className={`px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500`} />
        </div>
      </div>

      <button
        onClick={() => onSubmit({ amount, cardNumber, expiry, cvv, name: cardName })}
        disabled={!amount || isProcessing}
        className={`w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-bold ${borderRadius} flex items-center justify-center gap-2`}
      >
        <Lock className="w-4 h-4" /> {isProcessing ? 'Processing...' : `Pay KES ${amount ? Number(amount).toLocaleString() : '0'}`}
      </button>

      <div className={`p-3 bg-gray-50 dark:bg-white/5 ${borderRadius} flex items-center gap-2`}>
        <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <p className="text-gray-500 dark:text-white/50 text-xs">Secured by Paystack. Your card details are encrypted.</p>
      </div>
    </div>
  );
};

export default PaystackForm;
