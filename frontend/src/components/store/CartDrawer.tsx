/**
 * Cart Drawer
 *
 * A sliding drawer from the right side that shows the shopping cart.
 * Controlled by the cartStore's `isCartOpen` state.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Package,
} from 'lucide-react';

import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

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
// Animation variants
// =============================================================================

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const drawerVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  exit: { x: '100%', transition: { duration: 0.2, ease: 'easeIn' as const } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// =============================================================================
// Component
// =============================================================================

export default function CartDrawer() {
  const {
    items,
    total,
    itemCount,
    isCartOpen,
    isLoading,
    closeCart,
    updateQuantity,
    removeItem,
    fetchCart,
  } = useCartStore();

  const { isAuthenticated } = useAuthStore();

  // Fetch cart when drawer opens and user is authenticated
  useEffect(() => {
    if (isCartOpen && isAuthenticated) {
      fetchCart();
    }
  }, [isCartOpen, isAuthenticated, fetchCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.aside
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0F1112] border-l border-[#22272B] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#22272B]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">
                  Your Cart
                  {itemCount > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg text-gray-400 hover:bg-[#181C1F] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {!isAuthenticated ? (
                /* Not logged in */
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Sign in to view your cart</h3>
                  <p className="text-gray-400 mb-6">Log in to add items and checkout.</p>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2.5 bg-[#E40000] text-white rounded-lg hover:bg-[#FF0000] transition-colors font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : isLoading && items.length === 0 ? (
                /* Loading */
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-[#E40000] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                /* Empty cart */
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
                  <p className="text-gray-400 mb-6">Looks like you haven't added anything yet.</p>
                  <Link
                    to="/store"
                    onClick={closeCart}
                    className="px-6 py-2.5 bg-[#E40000] text-white rounded-lg hover:bg-[#FF0000] transition-colors font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                /* Items list */
                <ul className="divide-y divide-[#22272B]">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => {
                      const product = item.product;
                      const lineTotal = Number(item.unit_price) * item.quantity;
                      const firstImage = product?.images?.[0];

                      return (
                        <motion.li
                          key={item.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className="p-4 flex gap-4"
                        >
                          {/* Thumbnail */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#22272B] flex-shrink-0">
                            {firstImage ? (
                              <img src={firstImage} alt={product?.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#1E2327] flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-600" />
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/store/products/${product?.slug ?? ''}`}
                              onClick={closeCart}
                              className="text-sm font-semibold text-white hover:text-[#FF0000] transition-colors line-clamp-2"
                            >
                              {product?.name ?? 'Product'}
                            </Link>

                            <p className="mt-1 text-sm text-gray-400">
                              {formatKES(Number(item.unit_price))} each
                            </p>

                            {/* Qty controls */}
                            <div className="mt-2 flex items-center gap-3">
                              <div className="inline-flex items-center border border-[#22272B] rounded-md overflow-hidden">
                                <button
                                  onClick={() =>
                                    item.quantity > 1
                                      ? updateQuantity(item.id, item.quantity - 1)
                                      : removeItem(item.id)
                                  }
                                  className="p-1.5 text-gray-400 hover:bg-[#1E2327] transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-3 text-sm font-medium text-white bg-[#181C1F]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1.5 text-gray-400 hover:bg-[#1E2327] transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Line total */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-white">
                              {formatKES(lineTotal)}
                            </p>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {isAuthenticated && items.length > 0 && (
              <div className="border-t border-[#22272B] px-5 py-4 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Subtotal</span>
                  <span className="text-xl font-bold text-white">{formatKES(total)}</span>
                </div>
                <p className="text-xs text-gray-500">Shipping calculated at checkout</p>

                {/* Checkout button */}
                <Link
                  to="/store/checkout"
                  onClick={closeCart}
                  className="block w-full text-center py-3.5 rounded-lg bg-[#E40000] text-white font-semibold hover:bg-[#FF0000] transition-colors"
                >
                  Checkout
                </Link>

                {/* Continue shopping */}
                <Link
                  to="/store"
                  onClick={closeCart}
                  className="block w-full text-center py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
