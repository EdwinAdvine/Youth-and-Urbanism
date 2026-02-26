import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, CreditCard, Smartphone, Plus, Trash2 } from 'lucide-react';

const savedMethods = [
  { id: '1', type: 'mpesa', label: 'M-Pesa', detail: '+254 712****78', isDefault: true },
  { id: '2', type: 'visa', label: 'Visa', detail: '•••• 4532', isDefault: false },
  { id: '3', type: 'mastercard', label: 'Mastercard', detail: '•••• 8901', isDefault: false },
];

const PaymentMethodsPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Payment Methods</h1>
          <p className="text-gray-600 dark:text-white/70">Manage your saved payment methods</p>
        </div>
      </div>

      <div className="space-y-3">
        {savedMethods.map((method) => (
          <div key={method.id} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border ${method.isDefault ? 'border-green-500/30' : 'border-gray-200 dark:border-[#22272B]'} flex items-center gap-4`}>
            <div className={`w-12 h-8 ${borderRadius} flex items-center justify-center ${method.type === 'mpesa' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
              {method.type === 'mpesa' ? <Smartphone className="w-5 h-5 text-green-400" /> : <CreditCard className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 dark:text-white font-medium text-sm">{method.label}</h3>
              <p className="text-gray-400 dark:text-white/40 text-xs">{method.detail}</p>
            </div>
            {method.isDefault && (
              <span className={`px-2 py-0.5 bg-green-500/20 text-green-400 text-xs ${borderRadius}`}>Default</span>
            )}
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
              <Trash2 className="w-4 h-4 text-gray-400 dark:text-white/30" />
            </button>
          </div>
        ))}
      </div>

      <button className={`w-full p-4 border-2 border-dashed border-gray-300 dark:border-white/20 ${borderRadius} text-gray-500 dark:text-white/60 hover:border-white/30 hover:text-gray-700 dark:hover:text-white/80 flex items-center justify-center gap-2`}>
        <Plus className="w-4 h-4" /> Add Payment Method
      </button>
    </div>
  );
};

export default PaymentMethodsPage;
