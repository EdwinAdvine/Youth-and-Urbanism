/**
 * Instructor Earnings Service
 *
 * API calls to /api/v1/instructor/earnings endpoints.
 */
import apiClient from '../api';

export interface EarningsBreakdown {
  total_earnings: number;
  this_month: number;
  last_month: number;
  pending: number;
  monthly_trend: { month: string; amount: number }[];
  by_course: { course_id: string; course_title: string; amount: number }[];
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  payout_method: string;
  status: 'requested' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at?: string;
  transaction_reference?: string;
}

export async function getEarningsBreakdown(): Promise<EarningsBreakdown> {
  const { data } = await apiClient.get<EarningsBreakdown>(
    '/api/v1/instructor/earnings/breakdown',
  );
  return data;
}

export async function getPayoutHistory(): Promise<Payout[]> {
  const { data } = await apiClient.get<Payout[]>(
    '/api/v1/instructor/earnings/payouts',
  );
  return data;
}

export async function requestPayout(payoutData: {
  amount: number;
  payout_method: string;
  payout_details: Record<string, string>;
}): Promise<Payout> {
  const { data } = await apiClient.post<Payout>(
    '/api/v1/instructor/earnings/payouts',
    payoutData,
  );
  return data;
}

export async function exportEarnings(format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(
    '/api/v1/instructor/earnings/export',
    {
      params: { format },
      responseType: 'blob',
    },
  );
  return data;
}
