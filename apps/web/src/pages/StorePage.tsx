/**
 * Store Page - Product Catalog
 *
 * Shopify-inspired product browsing experience with filtering, search,
 * sort, and animated product grid. Dark theme throughout.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  ChevronDown,
  X,
  Package,
  Tag,
} from 'lucide-react';

import storeService from '../services/storeService';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import type { Product, ProductCategory, ProductFilterParams } from '../types/store';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const filterPanelVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2 } },
};

// =============================================================================
// Sort options
// =============================================================================

const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest' },
  { value: 'created_at_asc', label: 'Oldest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A-Z' },
  { value: 'name_desc', label: 'Name: Z-A' },
];

// =============================================================================
// Main Component
// =============================================================================

export default function StorePage() {
  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const itemsPerPage = 20;

  // Stores
  const { addItem, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const openCart = useCartStore((s) => s.openCart);

  // ---- Load categories on mount ----
  useEffect(() => {
    storeService.listCategories().then(setCategories).catch(console.error);
  }, []);

  // ---- Load products when filters change ----
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: ProductFilterParams = {
        page: currentPage,
        limit: itemsPerPage,
        sort_by: sortBy,
      };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (minPrice) params.min_price = Number(minPrice);
      if (maxPrice) params.max_price = Number(maxPrice);

      const res = await storeService.listProducts(params);
      setProducts(res.products);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, sortBy, minPrice, maxPrice, currentPage]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ---- Derived ----
  const totalPages = Math.ceil(total / itemsPerPage);
  const hasFilters = search || selectedCategory || minPrice || maxPrice;
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Sort';

  // ---- Handlers ----
  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      // The auth modal would typically open here; for now we just scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    await addItem(productId);
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112]">
      {/* ------------------------------------------------------------------ */}
      {/* Hero / Header                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-b border-gray-200 dark:border-[#22272B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              The Bird Store
            </h1>
            <p className="mt-3 text-gray-400 text-lg max-w-2xl">
              Uniforms, stationery, learning materials and more -- everything your child needs to thrive.
            </p>
          </motion.div>

          {/* Search + Controls Row */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 bg-[#1E2327] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50 focus:border-[#E40000] transition"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg border font-medium transition-colors ${
                showFilters
                  ? 'bg-[#E40000] border-[#E40000] text-gray-900 dark:text-white'
                  : 'bg-white dark:bg-[#181C1F] border-gray-200 dark:border-[#22272B] text-gray-400 dark:text-gray-300 hover:border-[#E40000]/40'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="ml-1 w-2 h-2 rounded-full bg-[#FF0000]" />
              )}
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown((v) => !v)}
                className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] text-gray-400 dark:text-gray-300 hover:border-[#E40000]/40 font-medium transition-colors w-full sm:w-auto"
              >
                {currentSortLabel}
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showSortDropdown && (
                  <motion.ul
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg shadow-xl z-30 overflow-hidden"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <li key={opt.value}>
                        <button
                          onClick={() => {
                            setSortBy(opt.value);
                            setShowSortDropdown(false);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            sortBy === opt.value
                              ? 'bg-[#E40000]/10 text-[#FF0000]'
                              : 'text-gray-400 dark:text-gray-300 hover:bg-[#1E2327]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Cart icon */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] text-gray-400 dark:text-gray-300 hover:border-[#E40000]/40 transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <CartBadge />
            </button>
          </div>

          {/* Collapsible filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                variants={filterPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="mt-4 p-5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2.5 bg-[#1E2327] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.slug}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Min price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Min Price (KES)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => {
                          setMinPrice(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2.5 bg-[#1E2327] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
                      />
                    </div>

                    {/* Max price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Max Price (KES)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="No limit"
                        value={maxPrice}
                        onChange={(e) => {
                          setMaxPrice(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2.5 bg-[#1E2327] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
                      />
                    </div>

                    {/* Clear */}
                    <div className="flex items-end">
                      {hasFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="flex items-center gap-1.5 text-sm text-[#FF0000] hover:text-[#FF0000]/80 font-medium transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-500">
            {loading ? 'Loading...' : `Showing ${products.length} of ${total} products`}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Product Grid                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 text-lg">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 px-5 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="mx-auto w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No products found</h3>
            <p className="mt-2 text-gray-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                cartLoading={cartLoading}
              />
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-400 dark:text-gray-300 hover:bg-white dark:hover:bg-[#181C1F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-400 dark:text-gray-300 hover:bg-white dark:hover:bg-[#181C1F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

// =============================================================================
// ProductCard
// =============================================================================

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
  cartLoading: boolean;
}

function ProductCard({ product, onAddToCart, cartLoading }: ProductCardProps) {
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const firstImage = product.images?.[0];

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group flex flex-col rounded-2xl bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] overflow-hidden hover:border-[#E40000]/30 hover:shadow-lg hover:shadow-[#E40000]/5 transition-all duration-300"
    >
      {/* Image */}
      <Link to={`/store/products/${product.slug}`} className="block relative aspect-square overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#E40000]/20 via-[#1E2327] to-gray-100 dark:to-[#181C1F] flex items-center justify-center">
            <Package className="w-14 h-14 text-gray-600" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="px-2.5 py-1 text-xs font-bold bg-[#E40000] text-gray-900 dark:text-white rounded-full">
              Featured
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 text-xs font-bold bg-white text-[#0F1112] rounded-full">
              Sale
            </span>
          )}
        </div>

        {product.inventory_count <= 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-gray-900 dark:text-white font-bold text-sm tracking-wider uppercase">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category tag */}
        {product.category && (
          <div className="flex items-center gap-1 mb-2">
            <Tag className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {product.category.name}
            </span>
          </div>
        )}

        <Link
          to={`/store/products/${product.slug}`}
          className="text-gray-900 dark:text-white font-semibold line-clamp-2 hover:text-[#FF0000] transition-colors"
        >
          {product.name}
        </Link>

        <p className="mt-1 text-sm text-gray-400 line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{formatKES(product.price)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              {formatKES(product.compare_at_price!)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={product.inventory_count <= 0 || cartLoading}
          onClick={() => onAddToCart(product.id)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#E40000] text-gray-900 dark:text-white font-medium text-sm hover:bg-[#FF0000] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          {product.inventory_count <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Cart badge (reads from store)
// =============================================================================

function CartBadge() {
  const itemCount = useCartStore((s) => s.itemCount);
  if (itemCount <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center bg-[#E40000] text-gray-900 dark:text-white text-xs font-bold rounded-full px-1">
      {itemCount}
    </span>
  );
}

// =============================================================================
// Skeleton loader
// =============================================================================

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-[#1E2327]" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-[#1E2327] rounded w-1/3" />
            <div className="h-4 bg-[#1E2327] rounded w-3/4" />
            <div className="h-3 bg-[#1E2327] rounded w-full" />
            <div className="h-5 bg-[#1E2327] rounded w-1/3" />
            <div className="h-10 bg-[#1E2327] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
