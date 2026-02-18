import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TransactionRowProps {
  title: string;
  type: 'credit' | 'debit';
  amount: number;
  date: string;
  method: string;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ title, type, amount, date, method }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="p-4 flex items-center gap-4">
      <div className={`w-10 h-10 ${borderRadius} flex items-center justify-center ${type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
        {type === 'credit' ? <ArrowDownLeft className="w-5 h-5 text-green-400" /> : <ArrowUpRight className="w-5 h-5 text-red-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-gray-900 dark:text-white text-sm font-medium truncate">{title}</h3>
        <p className="text-gray-400 dark:text-white/40 text-xs">{date} · {method}</p>
      </div>
      <span className={`font-bold text-sm ${type === 'credit' ? 'text-green-400' : 'text-gray-900 dark:text-white'}`}>
        {type === 'credit' ? '+' : ''}{amount.toLocaleString()} KES
      </span>
    </div>
  );
};

export default TransactionRow;
