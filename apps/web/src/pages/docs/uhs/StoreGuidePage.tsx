// StoreGuidePage - Comprehensive guide for the UHS marketplace/store.
// Covers browsing products, product details, cart management, checkout,
// order tracking, and reporting issues.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const StoreGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Store Guide
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Browse, purchase, and track educational products and resources from the UHS Store.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'browsing', label: 'Browsing Products' },
            { id: 'product-detail', label: 'Product Detail Page' },
            { id: 'cart', label: 'Adding to Cart' },
            { id: 'cart-management', label: 'Cart Management' },
            { id: 'checkout', label: 'Checkout' },
            { id: 'tracking', label: 'Order Tracking' },
            { id: 'issues', label: 'Reporting Issues' },
          ].map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm text-red-600 dark:text-red-400 hover:underline py-0.5"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Browsing Products */}
      <DocsSection
        id="browsing"
        title="Browsing Products"
        description="Explore educational products organized by category."
      >
        <p className="mb-4">
          The UHS Store offers educational products and resources that complement your learning
          experience. From textbooks and stationery to digital resources and technology, everything
          is curated for Kenyan students following the CBC curriculum.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Product categories:</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Textbooks</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">CBC-aligned textbooks, revision guides, and reference materials</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Stationery</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Notebooks, pens, pencils, geometry sets, and school supplies</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Digital Resources</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">E-books, printable worksheets, past papers, and study guides</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Merchandise</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">UHS branded items: T-shirts, bags, water bottles, and accessories</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Learning Aids</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Flashcards, educational games, science kits, and manipulatives</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Technology</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Tablets, headphones, webcams, and other learning technology</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Store homepage showing product categories and featured products"
          path="/docs/screenshots/store-browse.png"
        />
      </DocsSection>

      {/* Product Detail Page */}
      <DocsSection
        id="product-detail"
        title="Product Detail Page"
        description="View complete product information before purchasing."
      >
        <p className="mb-4">
          Clicking on any product card takes you to the product detail page, where you can
          review all the information you need before adding the item to your cart.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Product Name & Images</h4>
              <p className="text-sm">The product title and a gallery of images you can click to enlarge. For physical products, multiple angles are shown.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Description</h4>
              <p className="text-sm">A detailed description of the product including its features, contents, and how it supports learning.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Price & Availability</h4>
              <p className="text-sm">The price in KES (Kenyan Shillings) and current availability status: In Stock, Low Stock, Pre-Order, or Out of Stock.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Reviews & Ratings</h4>
              <p className="text-sm">Customer reviews with star ratings, verified purchase badges, and helpful vote counts.</p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Product detail page with images, description, price, and reviews"
          path="/docs/screenshots/store-product-detail.png"
        />
      </DocsSection>

      {/* Adding to Cart */}
      <DocsSection
        id="cart"
        title="Adding to Cart"
        description="Select options and add products to your shopping cart."
      >
        <p className="mb-4">
          Before adding a product to your cart, you may need to select specific options such
          as size, color, format, or quantity.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How to add to cart:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm mb-4">
          <li>On the product detail page, select any required options (e.g., textbook edition, size for merchandise)</li>
          <li>Set the quantity using the +/- buttons or type a number directly</li>
          <li>Click "Add to Cart" -- the item is added and the cart icon updates with the count</li>
          <li>A confirmation toast appears with a quick link to view your cart</li>
          <li>Continue shopping or proceed to checkout</li>
        </ol>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Product options:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Textbooks:</strong> Choose between physical copy or digital (PDF) version</li>
            <li><strong>Stationery:</strong> Select pack sizes (single, pack of 5, pack of 10)</li>
            <li><strong>Merchandise:</strong> Choose size (S, M, L, XL) and color</li>
            <li><strong>Digital Resources:</strong> Instant download -- no options needed</li>
            <li><strong>Technology:</strong> Select configuration or bundled accessories</li>
          </ul>
        </div>
      </DocsSection>

      {/* Cart Management */}
      <DocsSection
        id="cart-management"
        title="Cart Management"
        description="Review, modify, and manage items in your shopping cart."
      >
        <p className="mb-4">
          Click the cart icon in the top bar to view your shopping cart. From here you can
          review items, adjust quantities, remove products, and see your total before checkout.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">View Cart</h4>
            <p className="text-sm">See all items in your cart with product names, images, selected options, quantities, and individual prices.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Modify Quantities</h4>
            <p className="text-sm">Adjust the quantity of any item using the +/- buttons. The subtotal updates automatically.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Remove Items</h4>
            <p className="text-sm">Click the remove button (trash icon) next to any item to take it out of your cart.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Order Totals</h4>
            <p className="text-sm">See the subtotal, delivery fee (for physical items), any applicable discounts, and the grand total in KES.</p>
          </div>
        </div>
      </DocsSection>

      {/* Checkout */}
      <DocsSection
        id="checkout"
        title="Checkout"
        description="Complete your purchase with delivery information and payment."
      >
        <p className="mb-4">
          The checkout process guides you through reviewing your order, entering delivery
          information (for physical products), selecting a payment method, and confirming
          your purchase.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Review Order</h4>
              <p className="text-sm">Confirm all items, quantities, and totals are correct before proceeding.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Delivery Information</h4>
              <p className="text-sm">For physical products, enter your delivery address (county, town, street, building). Digital products are delivered instantly via download link.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Payment</h4>
              <p className="text-sm">Choose your payment method: M-Pesa, wallet balance, PayPal, or card. Complete the payment process.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Confirmation</h4>
              <p className="text-sm">A confirmation page shows your order number, expected delivery date, and a summary. You also receive an email and SMS confirmation.</p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Checkout flow showing order review, delivery form, payment selection, and confirmation"
          path="/docs/screenshots/store-checkout.png"
        />
      </DocsSection>

      {/* Order Tracking */}
      <DocsSection
        id="tracking"
        title="Order Tracking"
        description="Track your order from confirmation to delivery."
      >
        <p className="mb-4">
          After placing an order, you can track its status in real time from the "My Orders"
          section in your sidebar or account menu.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Order statuses:</h4>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2 font-medium text-blue-700 dark:text-blue-400">Confirmed</td>
                <td className="px-4 py-2">Your order has been received and payment confirmed</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-yellow-700 dark:text-yellow-400">Processing</td>
                <td className="px-4 py-2">Your order is being prepared for shipment</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-purple-700 dark:text-purple-400">Shipped</td>
                <td className="px-4 py-2">Your order has been dispatched and is in transit</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-green-700 dark:text-green-400">Delivered</td>
                <td className="px-4 py-2">Your order has arrived at the delivery address</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-green-800 dark:text-green-300">Completed</td>
                <td className="px-4 py-2">Order fulfilled and confirmed received by you</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-red-700 dark:text-red-400">Cancelled</td>
                <td className="px-4 py-2">Order was cancelled (by you or due to an issue)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tracking features:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Real-time status updates with estimated delivery dates</li>
            <li>SMS and email notifications when the status changes</li>
            <li>Delivery partner tracking link (when available)</li>
            <li>Order history with the ability to reorder past purchases</li>
          </ul>
        </div>
        <DocsImagePlaceholder
          description="Order tracking page showing status timeline and delivery details"
          path="/docs/screenshots/store-tracking.png"
        />
      </DocsSection>

      {/* Reporting Issues */}
      <DocsSection
        id="issues"
        title="Reporting Issues"
        description="Get help when something goes wrong with your order."
      >
        <p className="mb-4">
          If you experience any issues with your order -- damaged items, wrong products,
          missing deliveries, or digital download problems -- UHS support is here to help.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How to report an issue:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm mb-4">
          <li>Go to "My Orders" and find the affected order</li>
          <li>Click "Report Issue" next to the order</li>
          <li>Select the issue type: damaged item, wrong product, missing item, quality issue, or other</li>
          <li>Upload photos if applicable (e.g., damaged packaging or wrong item received)</li>
          <li>Describe the issue in detail</li>
          <li>Submit the report -- you will receive a ticket number via email</li>
          <li>The support team responds within 24-48 hours with a resolution</li>
        </ol>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Resolution options:</h4>
          <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
            <li><strong>Replacement:</strong> A new item is shipped at no additional cost</li>
            <li><strong>Refund:</strong> Full or partial refund to your wallet or original payment method</li>
            <li><strong>Re-download:</strong> For digital products, a new download link is provided</li>
            <li><strong>Credit:</strong> Store credit for future purchases</li>
          </ul>
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/forum" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Forum
        </Link>
        <Link to="/docs/certificates" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Certificates
        </Link>
      </div>
    </div>
  );
};

export default StoreGuidePage;
