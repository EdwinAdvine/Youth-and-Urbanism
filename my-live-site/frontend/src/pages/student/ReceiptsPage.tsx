import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft } from 'lucide-react';
import ReceiptCard from '../../components/student/wallet/ReceiptCard';

const receipts = [
  { id: 'RCP-001', title: 'Standard Plan - February', amount: 299, date: 'Feb 1, 2026', method: 'M-Pesa' },
  { id: 'RCP-002', title: 'Course: Advanced Fractions', amount: 500, date: 'Jan 28, 2026', method: 'Wallet' },
  { id: 'RCP-003', title: 'Standard Plan - January', amount: 299, date: 'Jan 1, 2026', method: 'M-Pesa' },
  { id: 'RCP-004', title: 'Course: Coding for Kids', amount: 750, date: 'Dec 15, 2025', method: 'Visa' },
];

const ReceiptsPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Receipts</h1>
          <p className="text-gray-600 dark:text-white/70">Download receipts for your payments</p>
        </div>
      </div>

      <div className="space-y-3">
        {receipts.map((r) => (
          <ReceiptCard key={r.id} {...r} />
        ))}
      </div>
    </div>
  );
};

export default ReceiptsPage;
