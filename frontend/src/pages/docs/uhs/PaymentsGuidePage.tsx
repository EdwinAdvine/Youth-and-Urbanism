// PaymentsGuidePage - Comprehensive guide for payments and financial features on UHS.
// Covers payment methods, pricing plans, M-Pesa flow, PayPal, card payments, wallet system,
// instructor earnings, and refund policy.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const PaymentsGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Payments Guide
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Understand payment methods, pricing plans, the wallet system, and how money flows on Urban Home School.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'methods', label: 'Supported Payment Methods' },
            { id: 'pricing', label: 'Pricing Plans' },
            { id: 'mpesa', label: 'M-Pesa Payment Flow' },
            { id: 'paypal', label: 'PayPal Payment Flow' },
            { id: 'card', label: 'Card Payment Flow' },
            { id: 'wallet', label: 'Wallet System' },
            { id: 'instructor-earnings', label: 'Instructor Earnings' },
            { id: 'refunds', label: 'Refund Policy' },
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

      {/* Supported Payment Methods */}
      <DocsSection
        id="methods"
        title="Supported Payment Methods"
        description="UHS supports multiple payment methods to accommodate all users."
      >
        <p className="mb-4">
          Urban Home School is designed for the Kenyan market and supports the most popular
          payment methods in the region. All transactions are processed securely with
          encryption and comply with local financial regulations.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Method</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Provider</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Currency</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Processing Time</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2 font-medium text-green-700 dark:text-green-400">M-Pesa</td>
                <td className="px-4 py-2">Safaricom</td>
                <td className="px-4 py-2">KES</td>
                <td className="px-4 py-2">Instant</td>
                <td className="px-4 py-2">Kenyan users (primary method)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-blue-700 dark:text-blue-400">PayPal</td>
                <td className="px-4 py-2">PayPal Inc.</td>
                <td className="px-4 py-2">USD / KES</td>
                <td className="px-4 py-2">Instant</td>
                <td className="px-4 py-2">International users and partners</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-purple-700 dark:text-purple-400">Card (Stripe)</td>
                <td className="px-4 py-2">Stripe</td>
                <td className="px-4 py-2">USD / KES</td>
                <td className="px-4 py-2">Instant</td>
                <td className="px-4 py-2">Visa, Mastercard, and debit cards</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      {/* Pricing Plans */}
      <DocsSection
        id="pricing"
        title="Pricing Plans"
        description="Choose the plan that fits your learning or sponsorship needs."
      >
        <p className="mb-4">
          UHS offers flexible pricing plans for students, parents, and sponsors. All plans
          include access to The Bird AI tutor and community forum. Higher tiers unlock more
          courses, advanced AI features, and premium support.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Plan</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Monthly Price (KES)</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Courses</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">AI Features</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2 font-medium">Free</td>
                <td className="px-4 py-2 font-semibold text-green-600 dark:text-green-400">0</td>
                <td className="px-4 py-2">3 free courses</td>
                <td className="px-4 py-2">Basic AI chat (limited)</td>
                <td className="px-4 py-2">Community forum</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Basic</td>
                <td className="px-4 py-2 font-semibold text-blue-600 dark:text-blue-400">500</td>
                <td className="px-4 py-2">10 courses per term</td>
                <td className="px-4 py-2">Full AI chat + voice</td>
                <td className="px-4 py-2">Email support</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Parents</td>
                <td className="px-4 py-2 font-semibold text-purple-600 dark:text-purple-400">1,500</td>
                <td className="px-4 py-2">Unlimited courses (3 children)</td>
                <td className="px-4 py-2">Full AI + analytics + insights</td>
                <td className="px-4 py-2">Priority support</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Sponsor</td>
                <td className="px-4 py-2 font-semibold text-yellow-600 dark:text-yellow-400">Custom</td>
                <td className="px-4 py-2">Unlimited (bulk pricing)</td>
                <td className="px-4 py-2">Full AI + reports + impact data</td>
                <td className="px-4 py-2">Dedicated account manager</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm mb-4">
          Annual plans are available at a 20% discount. Contact{' '}
          <Link to="/docs/support" className="text-red-600 dark:text-red-400 hover:underline">
            support
          </Link>{' '}
          for custom enterprise pricing.
        </p>
      </DocsSection>

      {/* M-Pesa Payment Flow */}
      <DocsSection
        id="mpesa"
        title="M-Pesa Payment Flow"
        description="Step-by-step guide for paying with M-Pesa on UHS."
      >
        <p className="mb-4">
          M-Pesa is the primary payment method for Kenyan users. UHS uses the M-Pesa STK
          (SIM Toolkit) push method, which sends a payment prompt directly to your phone.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Select M-Pesa</h4>
              <p className="text-sm">During checkout or wallet top-up, select "M-Pesa" as your payment method.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Enter Phone Number</h4>
              <p className="text-sm">Enter your Safaricom M-Pesa registered phone number (format: 2547XXXXXXXX) and confirm the amount.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Receive STK Push</h4>
              <p className="text-sm">An M-Pesa payment prompt appears on your phone within seconds. Review the amount and business name.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Enter M-Pesa PIN</h4>
              <p className="text-sm">Enter your M-Pesa PIN to authorize the payment. Never share your PIN with anyone.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-bold flex-shrink-0">5</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Confirmation</h4>
              <p className="text-sm">You receive an M-Pesa SMS confirmation and the UHS platform updates your balance or enrollment instantly.</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Troubleshooting M-Pesa:</h4>
          <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-400 space-y-1">
            <li>If you do not receive the STK push, ensure your phone has network signal</li>
            <li>Check that your M-Pesa account has sufficient funds</li>
            <li>If the prompt expires, click "Retry Payment" on the checkout page</li>
            <li>Contact support if the amount is deducted but the platform does not update</li>
          </ul>
        </div>
        <DocsImagePlaceholder
          description="M-Pesa payment flow showing phone number entry, STK push prompt, and confirmation"
          path="/docs/screenshots/payments-mpesa.png"
        />
      </DocsSection>

      {/* PayPal Payment Flow */}
      <DocsSection
        id="paypal"
        title="PayPal Payment Flow"
        description="How to pay using PayPal on UHS."
      >
        <p className="mb-4">
          PayPal is available for international users and organizations. When you select PayPal
          during checkout, you are redirected to PayPal's secure payment page to authorize the
          transaction.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm mb-4">
          <li>Select "PayPal" as your payment method during checkout or wallet top-up</li>
          <li>You are redirected to PayPal's login page</li>
          <li>Log in to your PayPal account and review the payment details</li>
          <li>Confirm the payment -- PayPal processes the transaction</li>
          <li>You are redirected back to UHS with a success confirmation</li>
        </ol>
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Note on currency:</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            PayPal transactions are processed in USD and converted to KES at the current exchange
            rate. The exact KES amount is displayed before you confirm the payment.
          </p>
        </div>
      </DocsSection>

      {/* Card Payment Flow */}
      <DocsSection
        id="card"
        title="Card Payment Flow"
        description="Pay with Visa, Mastercard, or debit cards via Stripe."
      >
        <p className="mb-4">
          Card payments are processed securely through Stripe. UHS never stores your full card
          details -- all sensitive data is handled by Stripe's PCI-compliant infrastructure.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm mb-4">
          <li>Select "Card" as your payment method during checkout</li>
          <li>Enter your card number, expiry date, CVV, and billing address</li>
          <li>Click "Pay KES [amount]" to submit the payment</li>
          <li>Stripe processes the transaction (3D Secure may be required by your bank)</li>
          <li>A confirmation message appears and your enrollment or wallet is updated</li>
        </ol>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Accepted cards:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Visa (credit and debit)</li>
            <li>Mastercard (credit and debit)</li>
            <li>Verve cards (Nigeria, supported for regional users)</li>
          </ul>
        </div>
      </DocsSection>

      {/* Wallet System */}
      <DocsSection
        id="wallet"
        title="Wallet System"
        description="Your digital wallet for seamless payments on UHS."
      >
        <p className="mb-4">
          Every UHS account comes with a digital wallet. You can top up your wallet and use the
          balance to pay for courses, store items, and subscriptions without entering payment
          details each time.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Wallet Balance</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Your current balance in KES is displayed in your dashboard and the top bar. The
              wallet icon shows a quick glance at your available funds.
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Top-Up</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              Add funds using M-Pesa, PayPal, or card. Select an amount or enter a custom amount.
              Top-ups are processed instantly.
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Auto-Pay</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Enable auto-pay to automatically deduct from your wallet when enrolling in courses
              or renewing subscriptions. No checkout step needed.
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Transaction History</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              View a complete log of all wallet transactions: top-ups, purchases, refunds, and
              transfers. Filter by date, type, or amount. Download receipts as PDF.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Wallet dashboard showing balance, top-up button, and transaction history"
          path="/docs/screenshots/payments-wallet.png"
        />
      </DocsSection>

      {/* Instructor Earnings */}
      <DocsSection
        id="instructor-earnings"
        title="Instructor Earnings"
        description="How instructors earn money from their courses."
      >
        <p className="mb-4">
          Instructors earn a share of the revenue from paid course enrollments. The earnings
          system is transparent, with detailed breakdowns and regular payouts.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Revenue sharing:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Standard rate:</strong> Instructors receive 70% of the course price</li>
            <li><strong>Premium rate:</strong> Top-performing instructors earn up to 85%</li>
            <li><strong>UHS platform fee:</strong> Covers hosting, AI services, payment processing, and support</li>
          </ul>
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payout schedule:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm mb-4">
          <li>Payouts are processed bi-monthly (1st and 15th of each month)</li>
          <li>Minimum payout threshold: KES 1,000</li>
          <li>Payout methods: M-Pesa (instant) or bank transfer (1-3 business days)</li>
          <li>Detailed payout reports with per-enrollment breakdowns</li>
        </ul>
        <p className="text-sm mb-4">
          For full details, see the{' '}
          <Link to="/docs/instructor-guide#earnings" className="text-red-600 dark:text-red-400 hover:underline">
            Instructor Guide: Earnings section
          </Link>.
        </p>
      </DocsSection>

      {/* Refund Policy */}
      <DocsSection
        id="refunds"
        title="Refund Policy"
        description="Understanding when and how refunds are processed."
      >
        <p className="mb-4">
          UHS has a fair refund policy designed to protect both learners and instructors.
          Refund eligibility depends on how much of the course you have completed.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Condition</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Refund</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Processing Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2">Within 48 hours of enrollment, less than 10% completed</td>
                <td className="px-4 py-2 font-semibold text-green-600 dark:text-green-400">Full refund</td>
                <td className="px-4 py-2">1-3 business days</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Within 7 days, less than 25% completed</td>
                <td className="px-4 py-2 font-semibold text-yellow-600 dark:text-yellow-400">75% refund</td>
                <td className="px-4 py-2">3-5 business days</td>
              </tr>
              <tr>
                <td className="px-4 py-2">More than 7 days or more than 25% completed</td>
                <td className="px-4 py-2 font-semibold text-red-600 dark:text-red-400">No refund</td>
                <td className="px-4 py-2">N/A</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Technical issue preventing access (verified by support)</td>
                <td className="px-4 py-2 font-semibold text-green-600 dark:text-green-400">Full refund</td>
                <td className="px-4 py-2">1-3 business days</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How to request a refund:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
          <li>Go to "My Courses" and find the course you want to refund</li>
          <li>Click the options menu and select "Request Refund"</li>
          <li>Provide a reason for the refund request</li>
          <li>Submit the request -- you will receive a confirmation email</li>
          <li>The refund is processed to your original payment method or wallet</li>
        </ol>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/assessments" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Assessments
        </Link>
        <Link to="/docs/forum" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Forum
        </Link>
      </div>
    </div>
  );
};

export default PaymentsGuidePage;
