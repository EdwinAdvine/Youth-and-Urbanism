/**
 * Product Detail Page
 *
 * Displays a single product with image gallery, description, quantity
 * selector, stock status, and related products from the same category.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  ChevronRight,
  Plus,
  Minus,
  Package,
  Truck,
  Shield,
  Tag,
  ArrowLeft,
} from 'lucide-react';

import storeService from '../services/storeService';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import type { Product } from '../types/store';

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

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const relatedCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
};

// =============================================================================
// Main Component
// =============================================================================

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  // Data
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  // Stores
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const openCart = useCartStore((s) => s.openCart);

  // ---- Load product ----
  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setQuantity(1);
    setSelectedImage(0);

    storeService
      .getProductBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);

        // Load related products from same category
        if (data.category?.slug) {
          storeService
            .listProducts({ category: data.category.slug, limit: 4 })
            .then((res) => {
              if (!cancelled) {
                setRelatedProducts(res.products.filter((p) => p.id !== data.id).slice(0, 4));
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Product not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // ---- Handlers ----
  const handleAddToCart = async () => {
    if (!product || !isAuthenticated) return;
    setAddingToCart(true);
    try {
      await addItem(product.id, quantity);
      openCart();
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQty = () => {
    if (product && quantity < product.inventory_count) {
      setQuantity((q) => q + 1);
    }
  };
  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));

  // ---- Loading / Error states ----
  if (loading) return <LoadingSkeleton />;
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0F1112] flex flex-col items-center justify-center px-4">
        <Package className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-gray-400 mb-6">{error || 'The product you are looking for does not exist.'}</p>
        <Link
          to="/store"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#E40000] text-white rounded-lg hover:bg-[#FF0000] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </div>
    );
  }

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const inStock = product.inventory_count > 0;
  const images = product.images?.length ? product.images : [];

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
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link to="/store" className="hover:text-white transition-colors">
            Store
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {product.category && (
            <>
              <Link
                to={`/store?category=${product.category.slug}`}
                className="hover:text-white transition-colors"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* ---- Left: Images ---- */}
          <div>
            {/* Main image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#181C1F] border border-[#22272B]">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#E40000]/20 via-[#1E2327] to-[#181C1F] flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-600" />
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === selectedImage
                        ? 'border-[#E40000]'
                        : 'border-[#22272B] hover:border-gray-500'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---- Right: Product info ---- */}
          <div className="flex flex-col">
            {/* Category */}
            {product.category && (
              <div className="flex items-center gap-1.5 mb-3">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {product.category.name}
                </span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white">{formatKES(product.price)}</span>
              {hasDiscount && (
                <span className="text-xl text-gray-500 line-through">
                  {formatKES(product.compare_at_price!)}
                </span>
              )}
              {hasDiscount && (
                <span className="px-2.5 py-1 text-xs font-bold bg-[#E40000] text-white rounded-full">
                  {Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mt-4">
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  In Stock ({product.inventory_count} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 text-gray-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs bg-[#1E2327] text-gray-400 rounded-full border border-[#22272B]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="my-6 border-t border-[#22272B]" />

            {/* Quantity + Add to Cart */}
            {inStock && (
              <div className="space-y-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Quantity
                  </label>
                  <div className="inline-flex items-center border border-[#22272B] rounded-lg overflow-hidden">
                    <button
                      onClick={decrementQty}
                      disabled={quantity <= 1}
                      className="p-3 text-gray-300 hover:bg-[#1E2327] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-5 py-3 text-white font-medium min-w-[56px] text-center bg-[#181C1F]">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQty}
                      disabled={quantity >= product.inventory_count}
                      className="p-3 text-gray-300 hover:bg-[#1E2327] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  disabled={addingToCart || !isAuthenticated}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-[#E40000] text-white font-semibold text-lg hover:bg-[#FF0000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addingToCart ? 'Adding...' : !isAuthenticated ? 'Log in to Add to Cart' : 'Add to Cart'}
                </motion.button>
              </div>
            )}

            {/* Guarantees */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Truck className="w-4 h-4 flex-shrink-0" />
                <span>Nationwide delivery across Kenya</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>Secure M-Pesa payments</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Related Products                                                 */}
        {/* ---------------------------------------------------------------- */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-white mb-6">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts.map((rp, idx) => (
                <motion.div
                  key={rp.id}
                  custom={idx}
                  variants={relatedCardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                >
                  <Link
                    to={`/store/products/${rp.slug}`}
                    className="group block rounded-2xl bg-[#181C1F] border border-[#22272B] overflow-hidden hover:border-[#E40000]/30 transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden">
                      {rp.images?.[0] ? (
                        <img
                          src={rp.images[0]}
                          alt={rp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#E40000]/20 via-[#1E2327] to-[#181C1F] flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold line-clamp-1 group-hover:text-[#FF0000] transition-colors">
                        {rp.name}
                      </h3>
                      <p className="mt-1 text-lg font-bold text-white">{formatKES(rp.price)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// Loading skeleton
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0F1112]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb skeleton */}
        <div className="h-4 bg-[#1E2327] rounded w-48 mb-8 animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Image skeleton */}
          <div className="aspect-square rounded-2xl bg-[#181C1F] border border-[#22272B] animate-pulse" />

          {/* Details skeleton */}
          <div className="space-y-5 animate-pulse">
            <div className="h-3 bg-[#1E2327] rounded w-24" />
            <div className="h-8 bg-[#1E2327] rounded w-3/4" />
            <div className="h-10 bg-[#1E2327] rounded w-1/3" />
            <div className="h-4 bg-[#1E2327] rounded w-36" />
            <div className="space-y-2">
              <div className="h-4 bg-[#1E2327] rounded" />
              <div className="h-4 bg-[#1E2327] rounded" />
              <div className="h-4 bg-[#1E2327] rounded w-2/3" />
            </div>
            <div className="h-14 bg-[#1E2327] rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
