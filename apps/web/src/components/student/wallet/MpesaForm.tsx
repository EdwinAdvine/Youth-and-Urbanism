import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Smartphone, Shield } from 'lucide-react';

interface MpesaFormProps {
  onSubmit: (phone: string, amount: string) => void;
  isProcessing?: boolean;
}

const quickAmounts = [100, 250, 500, 1000, 2000, 5000];

const MpesaForm: React.FC<MpesaFormProps> = ({ onSubmit, isProcessing }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div className="space-y-5">
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
      </div>

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
              className={`py-2 ${borderRadius} text-sm font-medium ${
                amount === String(qa) ? 'bg-green-500 text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              KES {qa.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSubmit(phone, amount)}
        disabled={!phone || !amount || phone.length < 9 || isProcessing}
        className={`w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-bold ${borderRadius} flex items-center justify-center gap-2`}
      >
        <Smartphone className="w-5 h-5" /> {isProcessing ? 'Processing...' : 'Send STK Push'}
      </button>

      <div className={`p-3 bg-gray-50 dark:bg-white/5 ${borderRadius} flex items-center gap-2`}>
        <Shield className="w-4 h-4 text-green-400 flex-shrink-0" />
        <p className="text-gray-500 dark:text-white/50 text-xs">Secured by Safaricom Daraja API.</p>
      </div>
    </div>
  );
};

export default MpesaForm;
