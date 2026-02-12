import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, Sparkles, Shield, Users, Building2 } from 'lucide-react';

/* ──────────────────────────────────────────────
   Type definitions
   ────────────────────────────────────────────── */

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  annualTotal: number | null;
  savingsLabel: string | null;
  perLabel: string;
  features: PlanFeature[];
  cta: string;
  ctaLink: string;
  popular: boolean;
  annualOnly: boolean;
  note: string | null;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ComparisonFeature {
  name: string;
  free: boolean | string;
  basic: boolean | string;
  parents: boolean | string;
  sponsor: boolean | string;
}

/* ──────────────────────────────────────────────
   Data
   ────────────────────────────────────────────── */

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    icon: <Sparkles className="w-6 h-6" />,
    description: 'Get started with the essentials',
    monthlyPrice: 0,
    annualPrice: 0,
    annualTotal: null,
    savingsLabel: null,
    perLabel: '',
    features: [
      { text: 'Enroll children & access free courses', included: true },
      { text: 'Limited AI access (5 messages/day)', included: true },
      { text: 'Basic progress reports', included: true },
      { text: 'Voice & video AI responses', included: false },
      { text: 'Paid course library', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started Free',
    ctaLink: '/signup',
    popular: false,
    annualOnly: false,
    note: null,
  },
  {
    id: 'basic',
    name: 'Basic',
    icon: <Shield className="w-6 h-6" />,
    description: 'Full access for 1 child',
    monthlyPrice: 1000,
    annualPrice: 800,
    annualTotal: 9600,
    savingsLabel: 'Save 20%',
    perLabel: '/month',
    features: [
      { text: 'Full AI tutor access (unlimited)', included: true },
      { text: 'All courses (free + paid)', included: true },
      { text: 'Detailed progress reports', included: true },
      { text: 'Voice & video AI responses', included: true },
      { text: 'CBC-aligned learning paths', included: true },
      { text: 'Priority support', included: false },
    ],
    cta: 'Subscribe Now',
    ctaLink: '/payments',
    popular: false,
    annualOnly: false,
    note: null,
  },
  {
    id: 'parents',
    name: 'Parents',
    icon: <Users className="w-6 h-6" />,
    description: 'Best value for 2+ children',
    monthlyPrice: 800,
    annualPrice: 600,
    annualTotal: null,
    savingsLabel: 'Save 25%',
    perLabel: '/child/month',
    features: [
      { text: 'Everything in Basic plan', included: true },
      { text: 'Multi-child dashboard', included: true },
      { text: 'Family progress comparison', included: true },
      { text: 'Voice & video AI responses', included: true },
      { text: 'CBC-aligned learning paths', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Subscribe Now',
    ctaLink: '/payments',
    popular: true,
    annualOnly: false,
    note: null,
  },
  {
    id: 'sponsor',
    name: 'Sponsor',
    icon: <Building2 className="w-6 h-6" />,
    description: 'For organizations & sponsors',
    monthlyPrice: null,
    annualPrice: 500,
    annualTotal: null,
    savingsLabel: null,
    perLabel: '/child/month',
    features: [
      { text: 'Everything in Parents plan', included: true },
      { text: 'Scholarship management', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Min. 10 children (5,000 KES/mo)', included: true },
    ],
    cta: 'Apply Now',
    ctaLink: '/contact',
    popular: false,
    annualOnly: true,
    note: 'For organizations and sponsors',
  },
];

const comparisonFeatures: ComparisonFeature[] = [
  { name: 'Enroll children', free: true, basic: true, parents: true, sponsor: true },
  { name: 'Free courses', free: true, basic: true, parents: true, sponsor: true },
  { name: 'AI tutor messages', free: '5/day', basic: 'Unlimited', parents: 'Unlimited', sponsor: 'Unlimited' },
  { name: 'Paid course library', free: false, basic: true, parents: true, sponsor: true },
  { name: 'Progress reports', free: 'Basic', basic: 'Detailed', parents: 'Detailed', sponsor: 'Advanced' },
  { name: 'Voice & video responses', free: false, basic: true, parents: true, sponsor: true },
  { name: 'CBC-aligned learning paths', free: false, basic: true, parents: true, sponsor: true },
  { name: 'Multi-child dashboard', free: false, basic: false, parents: true, sponsor: true },
  { name: 'Family progress comparison', free: false, basic: false, parents: true, sponsor: true },
  { name: 'Priority support', free: false, basic: false, parents: true, sponsor: true },
  { name: 'Scholarship management', free: false, basic: false, parents: false, sponsor: true },
  { name: 'Custom branding', free: false, basic: false, parents: false, sponsor: true },
  { name: 'Analytics dashboard', free: false, basic: false, parents: false, sponsor: true },
  { name: 'Dedicated account manager', free: false, basic: false, parents: false, sponsor: true },
];

const faqs: FAQ[] = [
  {
    question: 'Can I try the platform before paying?',
    answer:
      'Absolutely! Our Free plan gives you access to enroll your children, browse free courses, and interact with the AI tutor up to 5 times per day. No credit card or M-Pesa details required to get started.',
  },
  {
    question: 'How does billing work?',
    answer:
      'We bill through M-Pesa for maximum convenience. Monthly plans are charged at the start of each month. Annual plans are charged once per year at a discounted rate. You can switch between billing periods at any time.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer:
      'Yes! You can upgrade at any time and the price difference will be prorated. If you downgrade, the change takes effect at the start of your next billing period. Your data and progress are always preserved.',
  },
  {
    question: 'What is your refund policy?',
    answer:
      'We offer a 7-day money-back guarantee on all paid plans. If you are not satisfied, contact our support team within 7 days of your purchase for a full refund via M-Pesa.',
  },
  {
    question: 'How does the Parents plan work with multiple children?',
    answer:
      'The Parents plan charges per child at a discounted rate. You get a unified dashboard to monitor all your children\'s progress, compare their performance, and manage their learning paths from one account.',
  },
  {
    question: 'Who qualifies for the Sponsor plan?',
    answer:
      'The Sponsor plan is designed for NGOs, community organizations, schools, churches, and corporate sponsors who want to fund education for 10 or more children. Contact us to discuss your specific needs and get set up.',
  },
];

/* ──────────────────────────────────────────────
   Animation variants
   ────────────────────────────────────────────── */

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' },
  }),
};

const faqContentVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

/* ──────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────── */

const BillingToggle: React.FC<{ isAnnual: boolean; onToggle: () => void }> = ({ isAnnual, onToggle }) => (
  <motion.div
    className="flex items-center justify-center gap-4 mb-12 sm:mb-16"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.5 }}
  >
    <span className={`text-sm sm:text-base font-medium transition-colors duration-200 ${!isAnnual ? 'text-white' : 'text-white/50'}`}>
      Monthly
    </span>
    <button
      onClick={onToggle}
      className="relative w-14 h-7 rounded-full bg-[#22272B] border border-[#22272B] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50"
      aria-label="Toggle billing period"
    >
      <motion.div
        className="absolute top-0.5 w-6 h-6 rounded-full bg-[#FF0000]"
        animate={{ left: isAnnual ? '1.75rem' : '0.125rem' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
    <span className={`text-sm sm:text-base font-medium transition-colors duration-200 ${isAnnual ? 'text-white' : 'text-white/50'}`}>
      Annual
    </span>
    {isAnnual && (
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="ml-1 text-xs font-bold text-[#FF0000] bg-[#FF0000]/10 border border-[#FF0000]/30 px-2.5 py-1 rounded-full"
      >
        Save up to 25%
      </motion.span>
    )}
  </motion.div>
);

const PricingCard: React.FC<{ plan: Plan; isAnnual: boolean; index: number }> = ({ plan, isAnnual, index }) => {
  const displayPrice =
    plan.annualOnly
      ? plan.annualPrice
      : isAnnual
        ? plan.annualPrice
        : plan.monthlyPrice;

  const showSavings = isAnnual && plan.savingsLabel && !plan.annualOnly;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={`relative flex flex-col rounded-2xl sm:rounded-3xl p-6 sm:p-8 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        plan.popular
          ? 'border-[#FF0000] bg-[#181C1F] shadow-[#FF0000]/10 shadow-lg'
          : 'border-[#22272B] bg-[#181C1F] hover:border-[#FF0000]/30 hover:shadow-[#FF0000]/10'
      }`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-[#FF0000] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
            Most Popular
          </span>
        </div>
      )}

      {/* Annual only badge */}
      {plan.annualOnly && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-[#22272B] text-white/80 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap border border-[#22272B]">
            Annual Only
          </span>
        </div>
      )}

      {/* Icon + Name */}
      <div className="flex items-center gap-3 mb-4 mt-2">
        <div className={`p-2 rounded-xl ${plan.popular ? 'bg-[#FF0000]/10 text-[#FF0000]' : 'bg-white/5 text-white/70'}`}>
          {plan.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
          <p className="text-sm text-white/60">{plan.description}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          {displayPrice === 0 ? (
            <span className="text-4xl sm:text-5xl font-bold text-white">Free</span>
          ) : (
            <>
              <span className="text-lg text-white/50 font-medium">KES</span>
              <motion.span
                key={`${plan.id}-${isAnnual}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-4xl sm:text-5xl font-bold text-white"
              >
                {displayPrice?.toLocaleString()}
              </motion.span>
              <span className="text-white/50 text-sm">{plan.perLabel}</span>
            </>
          )}
        </div>

        {/* Savings label */}
        {showSavings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 flex items-center gap-2"
          >
            <span className="text-xs font-semibold text-[#FF0000] bg-[#FF0000]/10 px-2 py-0.5 rounded-full">
              {plan.savingsLabel}
            </span>
            {plan.annualTotal && (
              <span className="text-xs text-white/40">
                {plan.annualTotal.toLocaleString()} KES/year
              </span>
            )}
          </motion.div>
        )}

        {/* Crossed-out monthly price when annual is selected */}
        {isAnnual && !plan.annualOnly && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
          <p className="text-xs text-white/30 line-through mt-1">
            KES {plan.monthlyPrice.toLocaleString()}{plan.perLabel}
          </p>
        )}

        {/* Sponsor note */}
        {plan.note && (
          <p className="text-xs text-white/50 mt-2 italic">{plan.note}</p>
        )}
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="w-5 h-5 text-[#FF0000] shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-white/20 shrink-0 mt-0.5" />
            )}
            <span className={`text-sm ${feature.included ? 'text-white/80' : 'text-white/30'}`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        to={plan.ctaLink}
        className={`block w-full text-center py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] ${
          plan.popular
            ? 'bg-[#FF0000] hover:bg-[#E40000] text-white'
            : plan.id === 'free'
              ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
              : 'bg-[#FF0000]/10 hover:bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30'
        }`}
      >
        {plan.cta}
      </Link>
    </motion.div>
  );
};

const ComparisonTable: React.FC = () => {
  const planColumns = ['free', 'basic', 'parents', 'sponsor'] as const;
  const planLabels = { free: 'Free', basic: 'Basic', parents: 'Parents', sponsor: 'Sponsor' };

  const renderCell = (value: boolean | string) => {
    if (typeof value === 'string') {
      return <span className="text-xs sm:text-sm text-white/70 font-medium">{value}</span>;
    }
    return value ? (
      <Check className="w-5 h-5 text-[#FF0000] mx-auto" />
    ) : (
      <X className="w-5 h-5 text-white/20 mx-auto" />
    );
  };

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="overflow-x-auto"
    >
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-[#22272B]">
            <th className="text-left py-4 px-4 text-sm font-semibold text-white/60 w-[200px] sm:w-[260px]">
              Feature
            </th>
            {planColumns.map((col) => (
              <th key={col} className="py-4 px-3 text-center text-sm font-semibold text-white">
                {planLabels[col]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonFeatures.map((feature, i) => (
            <tr
              key={i}
              className={`border-b border-[#22272B]/50 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
            >
              <td className="py-3.5 px-4 text-sm text-white/80">{feature.name}</td>
              <td className="py-3.5 px-3 text-center">{renderCell(feature.free)}</td>
              <td className="py-3.5 px-3 text-center">{renderCell(feature.basic)}</td>
              <td className="py-3.5 px-3 text-center">{renderCell(feature.parents)}</td>
              <td className="py-3.5 px-3 text-center">{renderCell(feature.sponsor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

const FAQItem: React.FC<{ faq: FAQ; isOpen: boolean; onToggle: () => void; index: number }> = ({
  faq,
  isOpen,
  onToggle,
  index,
}) => (
  <motion.div
    custom={index}
    variants={cardVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-20px' }}
    className="border border-[#22272B] rounded-xl sm:rounded-2xl overflow-hidden"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-white/[0.02] transition-colors duration-200"
      aria-expanded={isOpen}
    >
      <span className="text-sm sm:text-base font-medium text-white pr-4">{faq.question}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.25 }}
        className="shrink-0"
      >
        <ChevronDown className="w-5 h-5 text-white/50" />
      </motion.div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          variants={faqContentVariants}
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
          className="overflow-hidden"
        >
          <div className="px-5 sm:px-6 pb-4 sm:pb-5">
            <p className="text-sm text-white/70 leading-relaxed">{faq.answer}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

/* ──────────────────────────────────────────────
   Main Page
   ────────────────────────────────────────────── */

const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="bg-[#0F1112] min-h-screen">
      {/* ── Header Section ── */}
      <section className="pt-20 sm:pt-28 pb-4 sm:pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs sm:text-sm mb-6 border border-white/20 text-white/80">
              <span className="bg-[#FF0000] text-white text-xs font-bold px-2 py-1 rounded-xl">
                PRICING
              </span>
              Simple, transparent pricing
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
              Choose Your <span className="text-[#FF0000]">Plan</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Invest in your child's future with personalized AI tutoring.
              Start free, upgrade when you're ready.
            </p>
          </motion.div>

          {/* ── Billing Toggle ── */}
          <div className="mt-10 sm:mt-12">
            <BillingToggle isAnnual={isAnnual} onToggle={() => setIsAnnual(!isAnnual)} />
          </div>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-5 lg:gap-6">
            {plans.map((plan, index) => (
              <PricingCard key={plan.id} plan={plan} isAnnual={isAnnual} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Comparison Table ── */}
      <section className="py-16 sm:py-24 bg-[#181C1F]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Compare Plans
            </h2>
            <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto">
              See exactly what you get with each plan
            </p>
          </motion.div>

          <ComparisonTable />
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-16 sm:py-24 bg-[#0F1112]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto">
              Everything you need to know about our pricing
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                isOpen={openFAQ === index}
                onToggle={() => toggleFAQ(index)}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA Section ── */}
      <section className="py-16 sm:py-24 bg-[#181C1F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Not sure? <span className="text-[#FF0000]">Start free</span> and upgrade anytime.
            </h2>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              Join thousands of Kenyan parents giving their children a brighter future
              with AI-powered, CBC-aligned tutoring. No commitment required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-[#FF0000] hover:bg-[#E40000] text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 hover:scale-[1.02] min-h-[44px]"
              >
                Get Started Free
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white/30 hover:border-[#FF0000] hover:bg-[#FF0000]/20 px-8 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-base sm:text-lg transition-all duration-200 min-h-[44px] flex items-center justify-center text-white/90 hover:text-white"
              >
                Contact Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
