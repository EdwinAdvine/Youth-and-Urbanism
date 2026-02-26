import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { FileText, Download } from 'lucide-react';

interface ReceiptCardProps {
  id: string;
  title: string;
  amount: number;
  date: string;
  method: string;
}

const ReceiptCard: React.FC<ReceiptCardProps> = ({ id, title, amount, date, method }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  const handleDownload = () => {
    const receipt = `Urban Home School - Receipt\n\nReceipt #: ${id}\nItem: ${title}\nAmount: KES ${amount.toLocaleString()}\nDate: ${date}\nPayment Method: ${method}`;
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center gap-4`}>
      <div className={`w-10 h-10 bg-blue-500/20 ${borderRadius} flex items-center justify-center flex-shrink-0`}>
        <FileText className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-gray-900 dark:text-white text-sm font-medium truncate">{title}</h3>
        <p className="text-gray-400 dark:text-white/40 text-xs">{date} · {method}</p>
      </div>
      <span className="text-gray-900 dark:text-white font-bold text-sm">KES {amount.toLocaleString()}</span>
      <button onClick={handleDownload} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
        <Download className="w-4 h-4 text-gray-500 dark:text-white/60" />
      </button>
    </div>
  );
};

export default ReceiptCard;
