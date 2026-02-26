/**
 * Payment Service
 *
 * Handles all payment-related operations including:
 * - Payment initiation (M-Pesa, PayPal, Stripe)
 * - Payment verification and confirmation
 * - Wallet management
 * - Transaction history
 * - Payment method management
 */

import apiClient, { handleApiError } from './api';

// ==================== Type Definitions ====================

/**
 * Supported payment gateways
 */
export type PaymentGateway = 'mpesa' | 'paypal' | 'stripe';

/**
 * Transaction status types
 */
export type TransactionStatus = 'pending' | 'completed' | 'success' | 'failed' | 'cancelled' | 'refunded';

/**
 * Transaction type
 */
export type TransactionType =
  | 'payment'
  | 'refund'
  | 'wallet_topup'
  | 'course_purchase'
  | 'subscription'
  | 'withdrawal';

/**
 * Payment method type
 */
export type PaymentMethodType =
  | 'mpesa'
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'bank_account';

/**
 * Transaction interface
 */
export interface Transaction {
  id: string;
  transactionRef: string;
  userId: string;
  type: TransactionType;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description?: string;
  metadata?: Record<string, any>;
  paymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failureReason?: string;
}

/**
 * Wallet interface
 */
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  lastTransaction?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payment method interface
 */
export interface PaymentMethod {
  id: string;
  userId: string;
  gateway: PaymentGateway;
  methodType: PaymentMethodType;
  isDefault: boolean;
  details: {
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    phoneNumber?: string;
    email?: string;
    holderName?: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payment initiation response
 */
export interface PaymentInitiationResponse {
  success: boolean;
  transactionRef: string;
  checkoutUrl?: string;
  paymentIntentId?: string;
  orderId?: string;
  message?: string;
}

/**
 * Payment status response
 */
export interface PaymentStatusResponse {
  transactionRef: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  message?: string;
  completedAt?: string;
  failureReason?: string;
}

/**
 * M-Pesa payment options
 */
export interface MpesaPaymentOptions {
  phoneNumber: string;
  amount: number;
  accountReference?: string;
  description?: string;
}

/**
 * PayPal payment options
 */
export interface PayPalPaymentOptions {
  amount: number;
  currency?: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

/**
 * Stripe payment options
 */
export interface StripePaymentOptions {
  amount: number;
  currency?: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Transaction filters
 */
export interface TransactionFilters {
  status?: TransactionStatus;
  type?: TransactionType;
  gateway?: PaymentGateway;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Add payment method request
 */
export interface AddPaymentMethodRequest {
  gateway: PaymentGateway;
  methodType: PaymentMethodType;
  details: {
    phoneNumber?: string;
    stripePaymentMethodId?: string;
    paypalEmail?: string;
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  setAsDefault?: boolean;
}

// ==================== Payment Initiation ====================

/**
 * Initiate a payment with a specific gateway
 *
 * @param gateway - Payment gateway to use
 * @param amount - Amount to charge
 * @param options - Gateway-specific options
 * @returns Payment initiation response
 */
export const initiatePayment = async (
  gateway: PaymentGateway,
  amount: number,
  options: Record<string, any> = {}
): Promise<PaymentInitiationResponse> => {
  try {
    const response = await apiClient.post('/api/v1/payments/initiate', {
      gateway,
      amount,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Initiate M-Pesa STK Push payment
 *
 * @param phoneNumber - Customer phone number (format: 254XXXXXXXXX)
 * @param amount - Amount to charge
 * @param accountReference - Optional account reference
 * @param description - Optional payment description
 * @returns Payment initiation response with transaction reference
 */
export const initiateMpesaPayment = async (
  phoneNumber: string,
  amount: number,
  accountReference?: string,
  description?: string
): Promise<PaymentInitiationResponse> => {
  try {
    const response = await apiClient.post('/api/v1/payments/mpesa/stk-push', {
      phoneNumber,
      amount,
      accountReference: accountReference || 'TUHS',
      description: description || 'Urban Home School Payment',
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Initiate PayPal payment
 *
 * @param amount - Amount to charge
 * @param currency - Currency code (default: USD)
 * @param description - Payment description
 * @param returnUrl - URL to redirect after successful payment
 * @param cancelUrl - URL to redirect if payment is cancelled
 * @returns Payment initiation response with checkout URL and order ID
 */
export const initiatePayPalPayment = async (
  amount: number,
  currency: string = 'USD',
  description?: string,
  returnUrl?: string,
  cancelUrl?: string
): Promise<PaymentInitiationResponse> => {
  try {
    const response = await apiClient.post('/api/v1/payments/paypal/create-order', {
      amount,
      currency,
      description: description || 'Urban Home School Payment',
      returnUrl: returnUrl || `${window.location.origin}/payment/success`,
      cancelUrl: cancelUrl || `${window.location.origin}/payment/cancel`,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Initiate Stripe payment intent
 *
 * @param amount - Amount to charge
 * @param paymentMethodId - Stripe payment method ID (optional if using saved method)
 * @param currency - Currency code (default: USD)
 * @param description - Payment description
 * @param metadata - Additional metadata
 * @returns Payment initiation response with payment intent ID
 */
export const initiateStripePayment = async (
  amount: number,
  paymentMethodId?: string,
  currency: string = 'USD',
  description?: string,
  metadata?: Record<string, any>
): Promise<PaymentInitiationResponse> => {
  try {
    const response = await apiClient.post('/api/v1/payments/stripe/create-intent', {
      amount,
      currency,
      paymentMethodId,
      description: description || 'Urban Home School Payment',
      metadata,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ==================== Payment Verification ====================

/**
 * Check payment status
 *
 * @param transactionRef - Transaction reference to check
 * @returns Payment status details
 */
export const checkPaymentStatus = async (
  transactionRef: string
): Promise<PaymentStatusResponse> => {
  try {
    const response = await apiClient.get(`/api/v1/payments/mpesa/status/${transactionRef}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Capture PayPal payment after approval
 *
 * @param orderId - PayPal order ID
 * @returns Payment capture result
 */
export const capturePayPalPayment = async (
  orderId: string
): Promise<PaymentStatusResponse> => {
  try {
    const response = await apiClient.post('/api/v1/payments/paypal/capture', {
      orderId,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Confirm Stripe payment intent
 *
 * @param paymentIntentId - Stripe payment intent ID
 * @param paymentMethodId - Optional payment method ID if not already attached
 * @returns Payment confirmation result
 */
export const confirmStripePayment = async (
  paymentIntentId: string,
  paymentMethodId?: string
): Promise<PaymentStatusResponse> => {
  try {
    const response = await apiClient.post('/api/v1/payments/stripe/confirm', {
      paymentIntentId,
      paymentMethodId,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ==================== Wallet Operations ====================

/**
 * Get user's wallet details and balance
 *
 * @returns Wallet information
 */
export const getWallet = async (): Promise<Wallet> => {
  try {
    const response = await apiClient.get('/api/v1/payments/wallet');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Add funds to wallet
 *
 * @param amount - Amount to add
 * @param gateway - Payment gateway to use
 * @param transactionRef - Transaction reference from payment gateway
 * @returns Updated wallet information
 */
export const addFunds = async (
  amount: number,
  gateway: PaymentGateway,
  transactionRef: string
): Promise<Wallet> => {
  try {
    const response = await apiClient.post('/api/v1/wallet/add-funds', {
      amount,
      gateway,
      transactionRef,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get transaction history with pagination and filters
 *
 * @param limit - Number of transactions to retrieve (default: 20)
 * @param offset - Pagination offset (default: 0)
 * @param filters - Optional transaction filters
 * @returns Array of transactions and total count
 */
export const getTransactionHistory = async (
  limit: number = 20,
  offset: number = 0,
  filters?: TransactionFilters
): Promise<{ transactions: Transaction[]; total: number }> => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.gateway) params.append('gateway', filters.gateway);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.minAmount !== undefined) params.append('minAmount', filters.minAmount.toString());
      if (filters.maxAmount !== undefined) params.append('maxAmount', filters.maxAmount.toString());
    }

    const response = await apiClient.get(`/api/v1/payments/transactions?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get single transaction details
 *
 * @param transactionId - Transaction ID
 * @returns Transaction details
 */
export const getTransaction = async (transactionId: string): Promise<Transaction> => {
  try {
    const response = await apiClient.get(`/api/v1/payments/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ==================== Payment Methods Management ====================

/**
 * Get all saved payment methods for the user
 *
 * @returns Array of payment methods
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const response = await apiClient.get('/api/v1/payments/methods');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Add a new payment method
 *
 * @param gateway - Payment gateway
 * @param methodType - Type of payment method
 * @param details - Payment method details
 * @param setAsDefault - Set as default payment method
 * @returns Created payment method
 */
export const addPaymentMethod = async (
  gateway: PaymentGateway,
  methodType: PaymentMethodType,
  details: AddPaymentMethodRequest['details'],
  setAsDefault: boolean = false
): Promise<PaymentMethod> => {
  try {
    const response = await apiClient.post('/api/v1/payments/methods', {
      gateway,
      methodType,
      details,
      setAsDefault,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Set a payment method as default
 *
 * @param methodId - Payment method ID
 * @returns Updated payment method
 */
export const setDefaultPaymentMethod = async (methodId: string): Promise<PaymentMethod> => {
  try {
    const response = await apiClient.patch(`/api/v1/payments/methods/${methodId}/set-default`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete a payment method
 *
 * @param methodId - Payment method ID
 * @returns Success status
 */
export const deletePaymentMethod = async (methodId: string): Promise<{ success: boolean }> => {
  try {
    const response = await apiClient.delete(`/api/v1/payments/methods/${methodId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ==================== Helper Functions ====================

/**
 * Format phone number for M-Pesa (254XXXXXXXXX format)
 *
 * @param phoneNumber - Phone number in various formats
 * @returns Formatted phone number
 */
export const formatMpesaPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('254')) {
    // Already in correct format
  } else if (cleaned.length === 9) {
    cleaned = '254' + cleaned;
  }

  return cleaned;
};

/**
 * Validate M-Pesa phone number
 *
 * @param phoneNumber - Phone number to validate
 * @returns True if valid, false otherwise
 */
export const isValidMpesaPhoneNumber = (phoneNumber: string): boolean => {
  const formatted = formatMpesaPhoneNumber(phoneNumber);
  return /^254[17]\d{8}$/.test(formatted);
};

/**
 * Format currency amount
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: KES)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'KES'): string => {
  const formatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

/**
 * Get transaction status color for UI
 *
 * @param status - Transaction status
 * @returns Tailwind color class
 */
export const getTransactionStatusColor = (status: TransactionStatus): string => {
  const colors: Record<TransactionStatus, string> = {
    pending: 'text-yellow-600 bg-yellow-100',
    completed: 'text-green-600 bg-green-100',
    success: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
    cancelled: 'text-gray-600 bg-gray-100',
    refunded: 'text-blue-600 bg-blue-100',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
};

/**
 * Get payment gateway display name
 *
 * @param gateway - Payment gateway
 * @returns Display name
 */
export const getPaymentGatewayName = (gateway: PaymentGateway): string => {
  const names: Record<PaymentGateway, string> = {
    mpesa: 'M-Pesa',
    paypal: 'PayPal',
    stripe: 'Stripe',
  };
  return names[gateway] || gateway;
};

// Export default payment service object
export default {
  // Payment initiation
  initiatePayment,
  initiateMpesaPayment,
  initiatePayPalPayment,
  initiateStripePayment,

  // Payment verification
  checkPaymentStatus,
  capturePayPalPayment,
  confirmStripePayment,

  // Wallet operations
  getWallet,
  addFunds,
  getTransactionHistory,
  getTransaction,

  // Payment methods
  getPaymentMethods,
  addPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,

  // Helpers
  formatMpesaPhoneNumber,
  isValidMpesaPhoneNumber,
  formatCurrency,
  getTransactionStatusColor,
  getPaymentGatewayName,
};
