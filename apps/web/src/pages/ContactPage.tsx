// ContactPage - Public page at /contact. Provides a contact form, office location,
// phone, email, and business hours for reaching Urban Home School support.
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { contactService } from '../services/contactService';
import HoneypotField from '../components/common/HoneypotField';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactInfo {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}

const contactInfo: ContactInfo[] = [
  {
    icon: <Mail className="w-6 h-6" />,
    label: 'Email',
    value: 'info@youthandurbanism.org',
    detail: 'We respond within 24 hours',
  },
  {
    icon: <Phone className="w-6 h-6" />,
    label: 'Phone',
    value: '+254 799 075 061',
    detail: 'Mon-Fri, 8am-6pm EAT',
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    label: 'Location',
    value: 'Nairobi, Kenya',
    detail: 'Serving families nationwide',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    label: 'Office Hours',
    value: 'Mon - Fri, 8am - 6pm EAT',
    detail: 'Weekend support via email',
  },
];

const subjectOptions = [
  'General Inquiry',
  'Technical Support',
  'Partnership Opportunity',
  'Billing & Payments',
  'Feedback & Suggestions',
  'Press & Media',
  'Other',
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
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
      await contactService.submitContact(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setSubmitError('Failed to send your message. Please try again or email us directly.');
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
              Contact Us
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Get in <span className="text-[#FF0000]">Touch</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-white/80 max-w-2xl mx-auto leading-relaxed">
              Have questions about Urban Home School? We would love to hear from you.
              Reach out and our team will get back to you as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#181C1F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12">
            {/* Contact Form - Left Side */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              <div className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Send Us a Message
                </h2>

                {submitted && (
                  <div className="mb-6 flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-4 rounded-xl">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm sm:text-base">
                      Thank you for your message! We will get back to you within 24 hours.
                    </p>
                  </div>
                )}

                {submitError && (
                  <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm sm:text-base">{submitError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" style={{ position: 'relative' }}>
                  <HoneypotField value={honeypot} onChange={setHoneypot} />
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
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

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors appearance-none"
                    >
                      <option value="" disabled>
                        Select a subject
                      </option>
                      {subjectOptions.map((option) => (
                        <option key={option} value={option} className="bg-white dark:bg-[#181C1F]">
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#E40000] disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 dark:text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info Cards - Right Side */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-2 space-y-4 sm:space-y-6"
            >
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.label}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeInUp}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl p-5 sm:p-6 hover:border-[#FF0000]/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-[#FF0000]/10 rounded-xl flex items-center justify-center text-[#FF0000] shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-white/50 mb-1">{info.label}</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {info.value}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-white/50">{info.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Map Placeholder */}
              <div className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl aspect-[4/3] flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-10 h-10 text-[#FF0000]/40 mx-auto mb-3" />
                  <p className="text-gray-400 dark:text-white/40 text-sm">Map Placeholder</p>
                  <p className="text-gray-400 dark:text-white/30 text-xs mt-1">Nairobi, Kenya</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
