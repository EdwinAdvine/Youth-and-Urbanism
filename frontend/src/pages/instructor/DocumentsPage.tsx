import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Download, Eye, Calendar, Filter } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Document {
  id: string;
  document_type: 'invoice' | 'tax_certificate' | 'earnings_report' | 'payout_receipt';
  title: string;
  period_start: string;
  period_end: string;
  amount?: number;
  currency?: string;
  file_url: string;
  generated_at: string;
  metadata?: Record<string, any>;
}

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [generatingReport, setGeneratingReport] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, [typeFilter, yearFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (yearFilter !== 'all') params.year = yearFilter;

      const response = await axios.get(`${API_URL}/api/v1/instructor/payouts/documents`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setDocuments([
          {
            id: '1',
            document_type: 'earnings_report',
            title: 'Earnings Report - January 2026',
            period_start: new Date(2026, 0, 1).toISOString(),
            period_end: new Date(2026, 0, 31).toISOString(),
            amount: 125000,
            currency: 'KES',
            file_url: '#',
            generated_at: new Date(2026, 1, 1).toISOString(),
          },
          {
            id: '2',
            document_type: 'payout_receipt',
            title: 'Payout Receipt - Transaction #MP-2026-001234',
            period_start: new Date(2026, 0, 28).toISOString(),
            period_end: new Date(2026, 0, 28).toISOString(),
            amount: 50000,
            currency: 'KES',
            file_url: '#',
            generated_at: new Date(2026, 0, 28).toISOString(),
            metadata: {
              payout_method: 'mpesa_b2c',
              transaction_reference: 'MP-2026-001234',
            },
          },
          {
            id: '3',
            document_type: 'tax_certificate',
            title: 'Tax Certificate - 2025',
            period_start: new Date(2025, 0, 1).toISOString(),
            period_end: new Date(2025, 11, 31).toISOString(),
            amount: 850000,
            currency: 'KES',
            file_url: '#',
            generated_at: new Date(2026, 0, 15).toISOString(),
          },
          {
            id: '4',
            document_type: 'invoice',
            title: 'Invoice - December 2025',
            period_start: new Date(2025, 11, 1).toISOString(),
            period_end: new Date(2025, 11, 31).toISOString(),
            amount: 95000,
            currency: 'KES',
            file_url: '#',
            generated_at: new Date(2026, 0, 1).toISOString(),
          },
          {
            id: '5',
            document_type: 'earnings_report',
            title: 'Earnings Report - Q4 2025',
            period_start: new Date(2025, 9, 1).toISOString(),
            period_end: new Date(2025, 11, 31).toISOString(),
            amount: 275000,
            currency: 'KES',
            file_url: '#',
            generated_at: new Date(2026, 0, 5).toISOString(),
          },
        ]);
      } else {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportType: string, period: string) => {
    try {
      setGeneratingReport(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/api/v1/instructor/payouts/documents/generate`,
        { report_type: reportType, period },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-${period}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const typeLabels = {
    invoice: 'Invoice',
    tax_certificate: 'Tax Certificate',
    earnings_report: 'Earnings Report',
    payout_receipt: 'Payout Receipt',
  };

  const typeColors = {
    invoice: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    tax_certificate: 'bg-green-500/10 text-green-400 border-green-500/30',
    earnings_report: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    payout_receipt: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Tax & Financial Documents"
        description="Download invoices, tax certificates, and earnings reports"
        icon={
          <button
            onClick={() => navigate('/dashboard/instructor/earnings')}
            className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" />
          </button>
        }
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleGenerateReport('earnings_report', 'current_month')}
          disabled={generatingReport}
          className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Generate Current Month Report</p>
            <p className="text-xs text-gray-500 dark:text-white/60">PDF earnings summary</p>
          </div>
        </button>

        <button
          onClick={() => handleGenerateReport('tax_certificate', String(currentYear))}
          disabled={generatingReport}
          className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-3 bg-green-500/10 rounded-lg">
            <FileText className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Generate {currentYear} Tax Certificate</p>
            <p className="text-xs text-gray-500 dark:text-white/60">For KRA filing</p>
          </div>
        </button>

        <button
          onClick={() => handleGenerateReport('earnings_report', 'current_year')}
          disabled={generatingReport}
          className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Generate Annual Report</p>
            <p className="text-xs text-gray-500 dark:text-white/60">Full year summary</p>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
          <span className="text-sm text-gray-500 dark:text-white/60">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Types</option>
            <option value="earnings_report">Earnings Reports</option>
            <option value="invoice">Invoices</option>
            <option value="tax_certificate">Tax Certificates</option>
            <option value="payout_receipt">Payout Receipts</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-white/60" />
          <span className="text-sm text-gray-500 dark:text-white/60">Year:</span>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 text-left">
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Type</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Title</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Period</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Amount</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Generated</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-lg border text-xs font-medium ${
                        typeColors[doc.document_type]
                      }`}
                    >
                      {typeLabels[doc.document_type]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{doc.title}</p>
                    {doc.metadata?.transaction_reference && (
                      <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mt-0.5">
                        Ref: {doc.metadata.transaction_reference}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 dark:text-white/80">
                      {format(new Date(doc.period_start), 'MMM d, yyyy')}
                    </p>
                    {doc.period_start !== doc.period_end && (
                      <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                        to {format(new Date(doc.period_end), 'MMM d, yyyy')}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {doc.amount ? (
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {formatCurrency(doc.amount)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-300 dark:text-white/40">—</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500 dark:text-white/60">
                      {format(new Date(doc.generated_at), 'MMM d, yyyy')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(doc.file_url, '_blank')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg transition-colors text-sm text-gray-900 dark:text-white"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = doc.file_url;
                          link.download = `${doc.title}.pdf`;
                          link.click();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {documents.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60">No documents found</p>
              <p className="text-sm text-gray-400 dark:text-gray-300 dark:text-white/40 mt-2">
                Generate your first report using the quick actions above
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-purple-200 mb-2">Document Retention Policy</h4>
        <ul className="text-sm text-purple-200/80 space-y-1 list-disc list-inside">
          <li>All financial documents are retained for 7 years for tax compliance purposes</li>
          <li>
            Monthly earnings reports are auto-generated on the 1st of each month for the previous
            month
          </li>
          <li>Tax certificates are available after year-end (January 15th each year)</li>
          <li>Payout receipts are generated immediately upon successful payout completion</li>
          <li>
            All documents are digitally signed and include a unique verification code for KRA
            validation
          </li>
          <li>You can regenerate any document at any time if you need an updated copy</li>
        </ul>
      </div>
    </div>
  );
};
