import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserPlus,
  CreditCard,
  BookOpen,
  Bot,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  detail: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Sign Up',
    description: 'A parent or guardian creates an account and adds their children.',
    icon: <UserPlus className="w-8 h-8" />,
    detail:
      'Registration is quick and simple. As a parent, you create your account with your name, email, and phone number. Then you add each of your children with their name, age, and current grade level. We require verifiable parental consent to keep every child safe and comply with Kenya\'s Data Protection Act.',
  },
  {
    number: 2,
    title: 'Choose a Plan',
    description: 'Select the free tier or upgrade for premium features.',
    icon: <CreditCard className="w-8 h-8" />,
    detail:
      'Our free plan gives your child access to core CBC-aligned lessons, basic AI tutoring, and progress tracking. Premium plans unlock unlimited AI tutoring sessions, offline downloads, advanced analytics, certificate generation, and priority support. Pay conveniently via M-Pesa.',
  },
  {
    number: 3,
    title: 'Explore Courses',
    description: 'Browse CBC-aligned courses across all 12 learning areas.',
    icon: <BookOpen className="w-8 h-8" />,
    detail:
      'Our course catalog covers all CBC learning areas including Mathematics, English, Kiswahili, Science & Technology, Social Studies, Creative Arts, and more. Courses are organized by grade level and taught through interactive lessons, stories, videos, and activities designed for Kenyan learners.',
  },
  {
    number: 4,
    title: 'Meet The Bird AI',
    description: 'Each child gets a personal AI tutor they can name and talk to.',
    icon: <Bot className="w-8 h-8" />,
    detail:
      'The Bird AI is your child\'s dedicated tutor available anytime, day or night. Powered by multiple AI models, it remembers your child\'s strengths and weaknesses, adapts to their learning pace, and communicates in both English and Kiswahili. Your child can even give their tutor a name to make learning feel personal and fun.',
  },
  {
    number: 5,
    title: 'Track Progress',
    description: 'View reports, earn certificates, and celebrate achievements.',
    icon: <BarChart3 className="w-8 h-8" />,
    detail:
      'Parents receive detailed progress reports showing each child\'s performance across subjects, time spent learning, quiz scores, and areas for improvement. Children earn certificates and achievement badges as they complete courses and reach milestones, building confidence and motivation.',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'How do I get started with Urban Home School?',
    answer:
      'Simply click the "Get Started Free" button, create your parent account, add your children\'s profiles, and they can start learning immediately. No credit card required for the free plan.',
  },
  {
    question: 'Is my child\'s data safe on the platform?',
    answer:
      'Absolutely. We comply with Kenya\'s Data Protection Act 2019 and follow strict child safety protocols. All data is encrypted, we require verifiable parental consent, and we never share children\'s data with third parties. Our AI models are configured with strict content filters to ensure age-appropriate interactions.',
  },
  {
    question: 'Does the platform follow the CBC curriculum?',
    answer:
      'Yes, all our courses and AI tutoring are aligned with Kenya\'s Competency-Based Curriculum (CBC). Our content covers all 12 CBC learning areas and is organized by grade level, from Pre-Primary through Senior School. Content is regularly reviewed and updated to match KICD guidelines.',
  },
  {
    question: 'Can my child learn offline?',
    answer:
      'Yes. Premium plan subscribers can download lessons, activities, and reading materials for offline use. This is ideal for families with unreliable internet connections. Progress syncs automatically when the device reconnects to the internet.',
  },
  {
    question: 'How much does Urban Home School cost?',
    answer:
      'Our basic plan is completely free and includes core lessons and limited AI tutoring. Premium plans start from KES 500 per month and include unlimited AI tutoring, offline downloads, certificates, and advanced progress reports. We also offer family plans for multiple children. All payments are processed securely via M-Pesa.',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const HowItWorksPage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
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
              Getting Started
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              How Urban Home School <span className="text-[#FF0000]">Works</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-white/80 max-w-2xl mx-auto leading-relaxed">
              From sign-up to success in five simple steps. Getting your child started
              with AI-powered, CBC-aligned education has never been easier.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#181C1F]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 sm:space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-8 lg:gap-16 items-center`}
              >
                {/* Content Side */}
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-[#FF0000] rounded-2xl flex items-center justify-center text-gray-900 dark:text-white font-bold text-2xl shrink-0">
                      {step.number}
                    </div>
                    <div className="w-10 h-10 bg-[#FF0000]/10 rounded-xl flex items-center justify-center text-[#FF0000]">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-white/70 mb-4">{step.description}</p>
                  <p className="text-base text-gray-500 dark:text-white/60 leading-relaxed">
                    {step.detail}
                  </p>
                </div>

                {/* Illustration Placeholder */}
                <div className="flex-1 w-full">
                  <div className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl aspect-[4/3] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-[#FF0000]/10 rounded-2xl flex items-center justify-center text-[#FF0000] mx-auto mb-4">
                        {step.icon}
                      </div>
                      <p className="text-gray-400 dark:text-white/40 text-sm">Step {step.number} Illustration</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-white/70">
              Everything you need to know about getting started.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-[#FF0000] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 dark:text-white/50 shrink-0" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                    <p className="text-base text-gray-600 dark:text-white/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#181C1F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Give your child the gift of personalized, AI-powered education today.
              Sign up is free and takes less than two minutes.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-3 bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white px-8 py-4 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-lg transition-all duration-200 hover:scale-[1.02]"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
