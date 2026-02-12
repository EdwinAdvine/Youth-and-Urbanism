/**
 * Checkout Page
 *
 * Protected page with order summary, shipping address form,
 * payment method selection, and order placement.
 */

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Truck,
  CreditCard,
  Smartphone,
  Package,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

import storeService from '../services/storeService';
import { useCartStore } from '../store/cartStore';
import type { ShippingAddress, ShippingAddressCreateRequest } from '../types/store';

// =============================================================================
// Currency formatter
// =============================================================================

const formatKES = (price: number) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price);

// =============================================================================
// Kenyan counties for address form
// =============================================================================

const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
  'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
  'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
  'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir',
  'West Pokot',
];

// =============================================================================
// Animation
// =============================================================================

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// =============================================================================
// Component
// =============================================================================

export default function CheckoutPage() {
  const navigate = useNavigate();

  // Cart state
  const { items, total, itemCount, fetchCart, clearCart } = useCartStore();

  // Existing addresses
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New address form
  const [addressForm, setAddressForm] = useState<ShippingAddressCreateRequest>({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    county: '',
    postal_code: '',
    country: 'Kenya',
    is_default: false,
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [notes, setNotes] = useState('');

  // Loading / status
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ---- Load cart + addresses on mount ----
  useEffect(() => {
    fetchCart();
    storeService
      .listShippingAddresses()
      .then((addrs) => {
        setSavedAddresses(addrs);
        const defaultAddr = addrs.find((a) => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (addrs.length > 0) {
          setSelectedAddressId(addrs[0].id);
        } else {
          setShowNewAddressForm(true);
        }
      })
      .catch(() => setShowNewAddressForm(true))
      .finally(() => setLoadingAddresses(false));
  }, [fetchCart]);

  // ---- Form field updater ----
  const updateField = (field: keyof ShippingAddressCreateRequest, value: string | boolean) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  // ---- Place order ----
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    let addressId = selectedAddressId;

    // If using new address form, create it first
    if (showNewAddressForm || !addressId) {
      if (!addressForm.full_name || !addressForm.phone || !addressForm.address_line_1 || !addressForm.city || !addressForm.county) {
        setError('Please fill in all required shipping fields.');
        return;
      }

      setSubmitting(true);
      try {
        const newAddr = await storeService.createShippingAddress(addressForm);
        addressId = newAddr.id;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to save address');
        setSubmitting(false);
        return;
      }
    }

    if (!addressId) {
      setError('Please select or enter a shipping address.');
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    try {
      const order = await storeService.checkout({
        shipping_address_id: addressId,
        payment_method: paymentMethod,
        notes: notes || undefined,
      });
      setOrderNumber(order.order_number);
      setOrderSuccess(true);
      clearCart();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Order success view ----
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#0F1112] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#181C1F] border border-[#22272B] rounded-2xl p-8 text-center"
        >
          <CheckCircle2 className="mx-auto w-16 h-16 text-green-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
          <p className="text-gray-400 mb-1">Your order has been placed successfully.</p>
          <p className="text-sm text-gray-500 mb-6">
            Order number: <span className="text-white font-mono">{orderNumber}</span>
          </p>
          <div className="space-y-3">
            <Link
              to="/store"
              className="block w-full py-3 rounded-lg bg-[#E40000] text-white font-semibold hover:bg-[#FF0000] transition-colors"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => navigate('/store/orders')}
              className="block w-full py-3 rounded-lg border border-[#22272B] text-gray-300 hover:bg-[#1E2327] transition-colors"
            >
              View Orders
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-[#0F1112]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        {items.length === 0 && !submitting ? (
          <div className="text-center py-16">
            <Package className="mx-auto w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-400 mb-6">Add some items before checking out.</p>
            <Link
              to="/store"
              className="inline-block px-6 py-2.5 bg-[#E40000] text-white rounded-lg hover:bg-[#FF0000] transition-colors font-medium"
            >
              Browse Store
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* ---- Left: Shipping + Payment ---- */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping address */}
                <section className="bg-[#181C1F] border border-[#22272B] rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Truck className="w-5 h-5 text-[#FF0000]" />
                    <h2 className="text-lg font-bold text-white">Shipping Address</h2>
                  </div>

                  {loadingAddresses ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                    </div>
                  ) : (
                    <>
                      {/* Saved addresses */}
                      {savedAddresses.length > 0 && !showNewAddressForm && (
                        <div className="space-y-3 mb-4">
                          {savedAddresses.map((addr) => (
                            <label
                              key={addr.id}
                              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                                selectedAddressId === addr.id
                                  ? 'border-[#E40000] bg-[#E40000]/5'
                                  : 'border-[#22272B] hover:border-gray-600'
                              }`}
                            >
                              <input
                                type="radio"
                                name="shipping_address"
                                value={addr.id}
                                checked={selectedAddressId === addr.id}
                                onChange={() => setSelectedAddressId(addr.id)}
                                className="mt-1 accent-[#E40000]"
                              />
                              <div className="text-sm">
                                <p className="text-white font-medium">{addr.full_name}</p>
                                <p className="text-gray-400">
                                  {addr.address_line_1}
                                  {addr.address_line_2 ? `, ${addr.address_line_2}` : ''}
                                </p>
                                <p className="text-gray-400">
                                  {addr.city}, {addr.county}
                                  {addr.postal_code ? ` ${addr.postal_code}` : ''}
                                </p>
                                <p className="text-gray-500">{addr.phone}</p>
                              </div>
                            </label>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewAddressForm(true);
                              setSelectedAddressId(null);
                            }}
                            className="text-sm text-[#FF0000] hover:text-[#FF0000]/80 font-medium transition-colors"
                          >
                            + Add new address
                          </button>
                        </div>
                      )}

                      {/* New address form */}
                      {showNewAddressForm && (
                        <div className="space-y-4">
                          {savedAddresses.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewAddressForm(false);
                                if (savedAddresses.length > 0 && !selectedAddressId) {
                                  setSelectedAddressId(savedAddresses[0].id);
                                }
                              }}
                              className="text-sm text-gray-400 hover:text-white transition-colors mb-2"
                            >
                              Use saved address instead
                            </button>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                              label="Full Name *"
                              value={addressForm.full_name}
                              onChange={(v) => updateField('full_name', v)}
                              placeholder="Jane Wanjiku"
                            />
                            <InputField
                              label="Phone *"
                              value={addressForm.phone}
                              onChange={(v) => updateField('phone', v)}
                              placeholder="+254 712 345678"
                              type="tel"
                            />
                          </div>

                          <InputField
                            label="Address Line 1 *"
                            value={addressForm.address_line_1}
                            onChange={(v) => updateField('address_line_1', v)}
                            placeholder="Street address, apartment, floor"
                          />
                          <InputField
                            label="Address Line 2"
                            value={addressForm.address_line_2 ?? ''}
                            onChange={(v) => updateField('address_line_2', v)}
                            placeholder="Building name, landmark (optional)"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InputField
                              label="City *"
                              value={addressForm.city}
                              onChange={(v) => updateField('city', v)}
                              placeholder="Nairobi"
                            />
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                                County *
                              </label>
                              <select
                                value={addressForm.county}
                                onChange={(e) => updateField('county', e.target.value)}
                                className="w-full px-3 py-2.5 bg-[#1E2327] border border-[#22272B] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
                              >
                                <option value="">Select county</option>
                                {KENYAN_COUNTIES.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <InputField
                              label="Postal Code"
                              value={addressForm.postal_code ?? ''}
                              onChange={(v) => updateField('postal_code', v)}
                              placeholder="00100"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </section>

                {/* Payment method */}
                <section className="bg-[#181C1F] border border-[#22272B] rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <CreditCard className="w-5 h-5 text-[#FF0000]" />
                    <h2 className="text-lg font-bold text-white">Payment Method</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === 'mpesa'
                          ? 'border-[#E40000] bg-[#E40000]/5'
                          : 'border-[#22272B] hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="mpesa"
                        checked={paymentMethod === 'mpesa'}
                        onChange={() => setPaymentMethod('mpesa')}
                        className="accent-[#E40000]"
                      />
                      <Smartphone className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">M-Pesa</p>
                        <p className="text-xs text-gray-500">Pay via Safaricom M-Pesa</p>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === 'card'
                          ? 'border-[#E40000] bg-[#E40000]/5'
                          : 'border-[#22272B] hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="accent-[#E40000]"
                      />
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Card</p>
                        <p className="text-xs text-gray-500">Visa / Mastercard</p>
                      </div>
                    </label>
                  </div>

                  {/* Notes */}
                  <div className="mt-5">
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      Order Notes (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions for your order..."
                      className="w-full px-3 py-2.5 bg-[#1E2327] border border-[#22272B] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50 resize-none"
                    />
                  </div>
                </section>
              </div>

              {/* ---- Right: Order Summary ---- */}
              <div>
                <div className="bg-[#181C1F] border border-[#22272B] rounded-2xl p-6 sticky top-8">
                  <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>

                  {/* Items */}
                  <ul className="space-y-3 mb-5">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-md overflow-hidden border border-[#22272B] flex-shrink-0">
                            {item.product?.images?.[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#1E2327] flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate">
                              {item.product?.name ?? 'Product'}
                            </p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-white flex-shrink-0">
                          {formatKES(Number(item.unit_price) * item.quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-[#22272B] pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal ({itemCount} items)</span>
                      <span className="text-white">{formatKES(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Shipping</span>
                      <span className="text-gray-500">Calculated after order</span>
                    </div>
                    <div className="border-t border-[#22272B] pt-3 flex justify-between">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-xl font-bold text-white">{formatKES(total)}</span>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  {/* Place order */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={submitting || items.length === 0}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-[#E40000] text-white font-semibold text-lg hover:bg-[#FF0000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Place Order
                      </>
                    )}
                  </motion.button>

                  <p className="mt-3 text-xs text-gray-500 text-center">
                    Your payment details are secure and encrypted.
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// InputField helper
// =============================================================================

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#1E2327] border border-[#22272B] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50 transition"
      />
    </div>
  );
}
