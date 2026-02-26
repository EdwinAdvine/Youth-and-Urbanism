// BecomePartnerPage - Public page at /become-partner. Presents the partnership program
// benefits, how it works, and application form to attract organizations and individuals.
import React, { useState } from 'react';
import apiClient from '../services/api';
import HoneypotField from '../components/common/HoneypotField';
import { motion } from 'framer-motion';
import {
  Heart,
  Eye,
  BarChart3,
  HeadphonesIcon,
  FileText,
  Search,
  LayoutDashboard,
  ArrowRight,
  CheckCircle,
  Globe,
} from 'lucide-react';

interface PartnerFormData {
  organization_name: string;
  organization_type: string;
  contact_person_name: string;
  email: string;
  phone: string;
  partnership_goals: string;
  website: string;
}

interface Benefit {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface HowItWorksStep {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const benefits: Benefit[] = [
  {
    title: 'Impact Education',
    description:
      'Your partnership directly supports thousands of Kenyan children with access to quality, CBC-aligned education powered by AI tutoring technology.',
    icon: <Heart className="w-7 h-7" />,
  },
  {
    title: 'Brand Visibility',
    description:
      'Gain visibility across our platform, marketing channels, and community events. Your brand will be associated with transformative educational impact.',
    icon: <Eye className="w-7 h-7" />,
  },
  {
    title: 'Data-Driven Impact Reports',
    description:
      'Receive detailed analytics and reports showing exactly how your partnership is making a difference — student outcomes, reach, and engagement metrics.',
    icon: <BarChart3 className="w-7 h-7" />,
  },
  {
    title: 'Dedicated Support',
    description:
      'Work with a dedicated partnership manager who ensures your goals are met, your questions are answered, and your experience is seamless.',
    icon: <HeadphonesIcon className="w-7 h-7" />,
  },
];

const howItWorksSteps: HowItWorksStep[] = [
  {
    number: 1,
    title: 'Apply',
    description:
      'Fill out the partnership application form below with your organization details and goals. Our partnerships team reviews applications within 3 business days.',
    icon: <FileText className="w-7 h-7" />,
  },
  {
    number: 2,
    title: 'Review',
    description:
      'Our team will assess alignment between your goals and our mission. We may schedule a call to discuss partnership opportunities and structures.',
    icon: <Search className="w-7 h-7" />,
  },
  {
    number: 3,
    title: 'Partner Dashboard',
    description:
      'Once approved, access your dedicated partner dashboard to track impact metrics, manage sponsorships, and collaborate with our team in real time.',
    icon: <LayoutDashboard className="w-7 h-7" />,
  },
];

const organizationTypes = [
  'NGO',
  'Corporate',
  'Government',
  'Foundation',
  'Individual',
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const BecomePartnerPage: React.FC = () => {
  const [formData, setFormData] = useState<PartnerFormData>({
    organization_name: '',
    organization_type: '',
    contact_person_name: '',
    email: '',
    phone: '',
    partnership_goals: '',
    website: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Bot detection: honeypot should always be empty
    if (honeypot) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await apiClient.post('/partner-applications', {
        organization_name: formData.organization_name,
        organization_type: formData.organization_type,
        contact_person_name: formData.contact_person_name,
        email: formData.email,
        phone: formData.phone,
        partnership_goals: formData.partnership_goals,
        website: formData.website || undefined,
      });
      setSubmitted(true);
    } catch {
      setSubmitError('Failed to submit your application. Please try again or email us at info@youthandurbanism.org.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 sm:py-28 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-[#FF0000]/10 text-[#FF0000] text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-[#FF0000]/20">
              For Partners
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Partner with <span className="text-[#FF0000]">Urban Home School</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-white/80 max-w-2xl mx-auto leading-relaxed">
              Join us in transforming education for thousands of Kenyan children.
              Whether you're an NGO, corporation, or foundation — together we can
              make quality education accessible to every child.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#181C1F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Partner With Us
            </h2>
            <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
              Our partnerships create measurable impact in education while aligning
              with your organization's mission and goals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-[#FF0000]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#FF0000]/10 rounded-xl flex items-center justify-center text-[#FF0000] mb-5">
                  {benefit.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-base text-gray-600 dark:text-white/70 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
              Three simple steps to start making an impact with Urban Home School.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center relative"
              >
                <div className="w-14 h-14 bg-[#FF0000] rounded-2xl flex items-center justify-center text-gray-900 dark:text-white font-bold text-2xl mx-auto mb-5">
                  {step.number}
                </div>
                <div className="w-12 h-12 bg-[#FF0000]/10 rounded-xl flex items-center justify-center text-[#FF0000] mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-base text-gray-600 dark:text-white/70 leading-relaxed">
                  {step.description}
                </p>
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-400 dark:text-white/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#181C1F]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Apply to Partner
              </h2>
              <p className="text-lg text-gray-600 dark:text-white/70 max-w-xl mx-auto">
                Ready to make a difference? Fill out the form below and our
                partnerships team will review your application.
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-50 dark:bg-[#0F1112] border-2 border-green-500/40 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center"
              >
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-4">
                  Application Submitted!
                </h3>
                <p className="text-base text-gray-600 dark:text-white/70 leading-relaxed max-w-md mx-auto">
                  Thank you for your interest in partnering with Urban Home School.
                  We'll review your application and get back to you within 3 business
                  days via email.
                </p>
              </motion.div>
            ) : (
              <div className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-5" style={{ position: 'relative' }}>
                  <HoneypotField value={honeypot} onChange={setHoneypot} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="organization_name"
                        className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                      >
                        Organization Name
                      </label>
                      <input
                        type="text"
                        id="organization_name"
                        name="organization_name"
                        value={formData.organization_name}
                        onChange={handleChange}
                        required
                        placeholder="Your organization name"
                        className="w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="organization_type"
                        className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                      >
                        Organization Type
                      </label>
                      <select
                        id="organization_type"
                        name="organization_type"
                        value={formData.organization_type}
                        onChange={handleChange}
                        required
                        className="w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors appearance-none"
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        {organizationTypes.map((type) => (
                          <option key={type} value={type} className="bg-white dark:bg-[#181C1F]">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact_person_name"
                        className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                      >
                        Contact Person Name
                      </label>
                      <input
                        type="text"
                        id="contact_person_name"
                        name="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={handleChange}
                        required
                        placeholder="Full name of contact person"
                        className="w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className="w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+254 700 000 000"
                        className="w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="website"
                        className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                      >
                        Website <span className="text-gray-400 dark:text-white/40">(optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40">
                          <Globe className="w-5 h-5" />
                        </div>
                        <input
                          type="url"
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://yourorganization.org"
                          className="w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="partnership_goals"
                      className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                    >
                      Description of Partnership Goals
                    </label>
                    <textarea
                      id="partnership_goals"
                      name="partnership_goals"
                      value={formData.partnership_goals}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="Tell us about your partnership goals, what kind of impact you'd like to make, and how you envision working with Urban Home School..."
                      className="w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#E40000] disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        Submit Partnership Application
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  {submitError && (
                    <p className="text-sm text-red-400 text-center">{submitError}</p>
                  )}

                  <p className="text-xs text-gray-400 dark:text-white/40 text-center mt-4">
                    By submitting this form, you agree to our Terms of Service and
                    Partnership Agreement. We will review your application and respond
                    within 3 business days.
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BecomePartnerPage;
