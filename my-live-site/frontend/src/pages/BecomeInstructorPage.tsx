// BecomeInstructorPage - Public page at /become-instructor. Presents the instructor program
// benefits, requirements, application form, and testimonials to attract new educators.
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  Bot,
  DollarSign,
  FileText,
  GraduationCap,
  Rocket,
  ArrowRight,
  CheckCircle,
  Upload,
} from 'lucide-react';

interface InstructorFormData {
  name: string;
  email: string;
  phone: string;
  expertise: string;
  experience: string;
  bio: string;
  cv: File | null;
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
    title: 'Reach Thousands of Students',
    description:
      'Your courses will be available to thousands of families across Kenya. Teach children in communities you might never physically reach.',
    icon: <Users className="w-7 h-7" />,
  },
  {
    title: 'Flexible Schedule',
    description:
      'Create courses on your own time. Once published, your content works for you 24/7. No commuting, no fixed classroom hours.',
    icon: <Clock className="w-7 h-7" />,
  },
  {
    title: 'AI-Powered Tools',
    description:
      'Use our AI tools to help create engaging quizzes, lesson plans, and assessment rubrics. Focus on content while we handle the technology.',
    icon: <Bot className="w-7 h-7" />,
  },
  {
    title: 'Revenue Sharing',
    description:
      'Earn 70% of every course sale. Transparent payments processed via M-Pesa. Track your earnings in real-time from your instructor dashboard.',
    icon: <DollarSign className="w-7 h-7" />,
  },
];

const howItWorksSteps: HowItWorksStep[] = [
  {
    number: 1,
    title: 'Apply',
    description:
      'Fill out the application form below with your qualifications and area of expertise. Our team reviews applications within 3 business days.',
    icon: <FileText className="w-7 h-7" />,
  },
  {
    number: 2,
    title: 'Create Courses',
    description:
      'Once approved, use our intuitive course builder to create CBC-aligned lessons with videos, quizzes, and interactive activities.',
    icon: <GraduationCap className="w-7 h-7" />,
  },
  {
    number: 3,
    title: 'Start Earning',
    description:
      'Publish your courses and start earning immediately. Track enrollments, ratings, and revenue from your personal instructor dashboard.',
    icon: <Rocket className="w-7 h-7" />,
  },
];

const expertiseOptions = [
  'Mathematics',
  'English Language',
  'Kiswahili',
  'Science & Technology',
  'Social Studies',
  'Religious Education (CRE/IRE/HRE)',
  'Creative Arts',
  'Physical & Health Education',
  'Home Science',
  'Agriculture',
  'Business Studies',
  'Life Skills',
  'Other',
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const BecomeInstructorPage: React.FC = () => {
  const [formData, setFormData] = useState<InstructorFormData>({
    name: '',
    email: '',
    phone: '',
    expertise: '',
    experience: '',
    bio: '',
    cv: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, cv: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      console.log('Instructor application submitted:', {
        ...formData,
        cv: formData.cv?.name || 'No file',
      });
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
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
              For Educators
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Teach on <span className="text-[#FF0000]">Urban Home School</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-white/80 max-w-2xl mx-auto leading-relaxed">
              Share your knowledge with thousands of Kenyan children. Create CBC-aligned
              courses, earn revenue, and make a lasting impact on education.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Revenue Split Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#181C1F]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Earn While You Teach
            </h2>
            <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
              Our transparent revenue model ensures instructors are fairly compensated
              for their expertise and effort.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8"
          >
            <div className="bg-gray-50 dark:bg-[#0F1112] border-2 border-[#FF0000]/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
              <div className="text-5xl sm:text-6xl font-bold text-[#FF0000] mb-2">70%</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Instructor</h3>
              <p className="text-sm text-gray-500 dark:text-white/60">
                You keep the majority of every sale. Your expertise, your earnings.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
              <div className="text-5xl sm:text-6xl font-bold text-gray-700 dark:text-white/80 mb-2">20%</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Platform</h3>
              <p className="text-sm text-gray-500 dark:text-white/60">
                Covers platform development, AI infrastructure, and student acquisition.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
              <div className="text-5xl sm:text-6xl font-bold text-gray-700 dark:text-white/80 mb-2">10%</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Maintenance</h3>
              <p className="text-sm text-gray-500 dark:text-white/60">
                Server hosting, security, M-Pesa processing, and ongoing support.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-[#0F1112]">
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
              Why Teach With Us
            </h2>
            <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
              Join a growing community of educators making a difference in Kenyan education.
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
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-[#FF0000]/30 transition-all duration-300"
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
      <section className="py-16 sm:py-24 bg-white dark:bg-[#181C1F]">
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
              Three simple steps to start teaching and earning on Urban Home School.
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
                className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center relative"
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
                    <ArrowRight className="w-6 h-6 text-gray-400 dark:text-gray-300 dark:text-white/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-[#0F1112]">
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
                Apply to Teach
              </h2>
              <p className="text-lg text-gray-600 dark:text-white/70 max-w-xl mx-auto">
                Ready to make a difference? Fill out the form below and our team
                will review your application.
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-[#181C1F] border-2 border-green-500/40 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center"
              >
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-4">
                  Application Submitted!
                </h3>
                <p className="text-base text-gray-600 dark:text-white/70 leading-relaxed max-w-md mx-auto">
                  Thank you for your interest in teaching on Urban Home School. Our team
                  will review your application and get back to you within 3 business days
                  via email.
                </p>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                        placeholder="Your full name"
                        className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors"
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
                        className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors"
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
                        className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="expertise"
                        className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                      >
                        Area of Expertise
                      </label>
                      <select
                        id="expertise"
                        name="expertise"
                        value={formData.expertise}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors appearance-none"
                      >
                        <option value="" disabled>
                          Select your area
                        </option>
                        {expertiseOptions.map((option) => (
                          <option key={option} value={option} className="bg-gray-50 dark:bg-[#0F1112]">
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="experience"
                      className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                    >
                      Years of Teaching Experience
                    </label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors appearance-none"
                    >
                      <option value="" disabled>
                        Select experience
                      </option>
                      <option value="0-1" className="bg-gray-50 dark:bg-[#0F1112]">
                        Less than 1 year
                      </option>
                      <option value="1-3" className="bg-gray-50 dark:bg-[#0F1112]">
                        1 - 3 years
                      </option>
                      <option value="3-5" className="bg-gray-50 dark:bg-[#0F1112]">
                        3 - 5 years
                      </option>
                      <option value="5-10" className="bg-gray-50 dark:bg-[#0F1112]">
                        5 - 10 years
                      </option>
                      <option value="10+" className="bg-gray-50 dark:bg-[#0F1112]">
                        10+ years
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                    >
                      Short Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="Tell us about your teaching background, qualifications, and why you want to teach on Urban Home School..."
                      className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cv"
                      className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                    >
                      Upload CV / Resume
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="cv"
                        name="cv"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="cv"
                        className="flex items-center gap-3 w-full bg-gray-50 dark:bg-[#0F1112] border border-dashed border-gray-200 dark:border-[#22272B] hover:border-[#FF0000]/50 rounded-xl px-4 py-4 cursor-pointer transition-colors group"
                      >
                        <div className="w-10 h-10 bg-[#FF0000]/10 rounded-lg flex items-center justify-center text-[#FF0000] group-hover:bg-[#FF0000]/20 transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 dark:text-white/80">
                            {formData.cv ? formData.cv.name : 'Click to upload your CV'}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-white/40">
                            PDF, DOC, or DOCX (max 10MB)
                          </p>
                        </div>
                      </label>
                    </div>
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
                        Submit Application
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 dark:text-white/40 text-center mt-4">
                    By submitting this form, you agree to our Terms of Service and
                    Instructor Agreement. We will review your application and respond
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

export default BecomeInstructorPage;
