/**
 * Cart Zustand Store
 *
 * Manages the shopping cart state with persistence (localStorage).
 * Follows the same pattern as authStore.ts.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import storeService from '../services/storeService';
import type { CartItem } from '../types/store';

// =============================================================================
// Types
// =============================================================================

interface CartState {
  // Data
  items: CartItem[];
  cartId: string | null;
  total: number;
  itemCount: number;

  // UI
  isCartOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => void;
  clearError: () => void;
}

// =============================================================================
// Helpers
// =============================================================================

function computeTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const price = item.product?.price ?? item.unit_price ?? 0;
    return sum + Number(price) * item.quantity;
  }, 0);
}

function computeItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

// =============================================================================
// Store
// =============================================================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // ----- Initial state -----
      items: [],
      cartId: null,
      total: 0,
      itemCount: 0,

      isCartOpen: false,
      isLoading: false,
      error: null,

      // ----- UI actions -----
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
      clearError: () => set({ error: null }),

      // ----- Data actions -----

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await storeService.getCart();
          const items = cart.items ?? [];
          set({
            cartId: cart.id,
            items,
            total: computeTotal(items),
            itemCount: computeItemCount(items),
            isLoading: false,
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to load cart';
          set({ error: message, isLoading: false });
        }
      },

      addItem: async (productId: string, quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          await storeService.addToCart({ product_id: productId, quantity });
          // Re-fetch the full cart so we have product details on every item
          await get().fetchCart();
          set({ isCartOpen: true, isLoading: false });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to add item';
          set({ error: message, isLoading: false });
        }
      },

      updateQuantity: async (itemId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
          await storeService.updateCartItem(itemId, { quantity });
          await get().fetchCart();
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to update quantity';
          set({ error: message, isLoading: false });
        }
      },

      removeItem: async (itemId: string) => {
        set({ isLoading: true, error: null });
        try {
          await storeService.removeCartItem(itemId);
          await get().fetchCart();
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to remove item';
          set({ error: message, isLoading: false });
        }
      },

      clearCart: () =>
        set({
          items: [],
          cartId: null,
          total: 0,
          itemCount: 0,
          isCartOpen: false,
        }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        total: state.total,
        itemCount: state.itemCount,
      }),
    },
  ),
);
