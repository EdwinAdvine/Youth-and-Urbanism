// ScholarshipPage - Public page at /scholarships.
// Mission section + dual-path application form (student self-apply or parent/guardian applying for a child).
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  GraduationCap,
  Smartphone,
  BookOpen,
  Users,
  Star,
  MapPin,
  Send,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import apiClient from '../services/api';
import HoneypotField from '../components/common/HoneypotField';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

type ApplicantType = 'student' | 'parent_guardian';

interface FormData {
  applicant_type: ApplicantType;
  full_name: string;
  email: string;
  phone: string;
  student_name: string;
  student_age: string;
  school_name: string;
  grade: string;
  settlement: string;
  county: string;
  reason: string;
  supporting_info: string;
}

const INITIAL_FORM: FormData = {
  applicant_type: 'student',
  full_name: '',
  email: '',
  phone: '',
  student_name: '',
  student_age: '',
  school_name: '',
  grade: '',
  settlement: '',
  county: '',
  reason: '',
  supporting_info: '',
};

const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos',
  'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a',
  'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
  'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia',
  'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
];

const GRADE_OPTIONS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
];

const benefits = [
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Smartphone Device',
    desc: 'A dedicated smartphone preloaded with learning apps to enable digital education from home.',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Advanced Plan Access',
    desc: 'Full access to all CBC-aligned courses, offline content, and interactive assessments for one year.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Mentorship Program',
    desc: 'One-on-one mentorship from trained instructors and community leaders who guide academic progress.',
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: 'Sponsor Support',
    desc: 'Direct connection with corporate and individual sponsors who provide ongoing financial backing.',
  },
];

const ScholarshipPage: React.FC = () => {
  const [applicantType, setApplicantType] = useState<ApplicantType>('student');
  const [formData, setFormData] = useState<FormData>({ ...INITIAL_FORM });
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleTypeChange = (type: ApplicantType) => {
    setApplicantType(type);
    setFormData((prev) => ({ ...prev, applicant_type: type }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // bot detected

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        ...formData,
        student_age: formData.student_age || undefined,
      };
      await apiClient.post('/scholarships', payload);
      setSubmitState('success');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(
        typeof detail === 'string'
          ? detail
          : 'Submission failed. Please try again or contact us directly.'
      );
      setSubmitState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...INITIAL_FORM, applicant_type: applicantType });
    setSubmitState('idle');
    setErrorMessage('');
  };

  const inputCls =
    'w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors text-sm';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-white/80 mb-1.5';
  const selectCls = `${inputCls} appearance-none pr-10 cursor-pointer`;

  return (
    <div>
      {/* ── Hero Section ─────────────────────────────────────────────── */}
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
              Scholarship Programme
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Education for Every{' '}
              <span className="text-[#FF0000]">Child</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-white/80 max-w-3xl mx-auto leading-relaxed">
              We believe geography and income should never determine a child's future.
              Our scholarship programme provides underprivileged children in Kenya's
              informal urban settlements with full access to quality CBC-aligned education.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Mission & Target Section ──────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#181C1F]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#FF0000]/10 rounded-xl flex items-center justify-center text-[#FF0000]">
                  <Heart className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Our Mission
                </h2>
              </div>
              <p className="text-gray-600 dark:text-white/70 leading-relaxed mb-4">
                Urban Home School's scholarship programme targets children living in
                informal urban settlements across Kenya — areas such as Kibera, Mathare,
                Mukuru, Korogocho, and similar communities — where access to quality
                education is severely limited.
              </p>
              <p className="text-gray-600 dark:text-white/70 leading-relaxed">
                Each sponsored child receives a complete learning package: a dedicated
                device, full platform access, mentorship, and ongoing sponsor support.
                We partner with local community leaders, NGOs, and corporate sponsors to
                sustain this programme long-term.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <MapPin className="w-5 h-5 text-[#FF0000]" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Who We Target
                </h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-white/70">
                {[
                  'Children aged 6–18 in informal urban settlements',
                  'Households with monthly income below KES 15,000',
                  'Children attending under-resourced public schools',
                  'Orphans and children from single-parent households',
                  'Children with no existing access to digital learning tools',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#FF0000] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Benefits Section ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              What Each Scholar Receives
            </h2>
            <p className="text-gray-600 dark:text-white/70 max-w-xl mx-auto">
              A comprehensive package designed to remove every barrier between a child
              and quality education.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-2xl p-5 text-center"
              >
                <div className="w-12 h-12 bg-[#FF0000]/10 rounded-xl flex items-center justify-center text-[#FF0000] mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-white/60 leading-relaxed">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Form Section ───────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#181C1F]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Apply for a Scholarship
              </h2>
              <p className="text-gray-600 dark:text-white/70">
                Applications are reviewed monthly. We will contact you within 2 weeks
                of submission.
              </p>
            </div>

            {/* Success State */}
            {submitState === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 dark:bg-[#0F1112] border-2 border-green-500/40 rounded-2xl p-8 text-center"
              >
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-green-400 mb-3">
                  Application Submitted!
                </h3>
                <p className="text-gray-600 dark:text-white/70 leading-relaxed mb-6">
                  Thank you for applying. Our team will review your application and
                  reach out to you within two weeks. Please check your email for a
                  confirmation message.
                </p>
                <button
                  onClick={handleReset}
                  className="text-sm text-[#FF0000] hover:underline font-medium"
                >
                  Submit another application
                </button>
              </motion.div>
            ) : (
              <div className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                {/* Applicant Type Toggle */}
                <div className="mb-8">
                  <p className="text-sm font-medium text-gray-700 dark:text-white/80 mb-3">
                    I am applying as a:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { value: 'student', label: 'Student', icon: <GraduationCap className="w-5 h-5" />, desc: 'Applying for myself' },
                        { value: 'parent_guardian', label: 'Parent / Guardian', icon: <UserCheck className="w-5 h-5" />, desc: 'Applying for my child' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleTypeChange(opt.value)}
                        className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all text-center ${
                          applicantType === opt.value
                            ? 'border-[#FF0000] bg-[#FF0000]/5 text-[#FF0000]'
                            : 'border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/20'
                        }`}
                      >
                        {opt.icon}
                        <span className="text-sm font-semibold">{opt.label}</span>
                        <span className="text-xs opacity-70">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Banner */}
                {submitState === 'error' && (
                  <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{errorMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <HoneypotField value={honeypot} onChange={setHoneypot} />

                  {/* ── Applicant Details ── */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      {applicantType === 'student' ? 'Your Details' : 'Guardian Details'}
                    </h3>

                    <div>
                      <label className={labelCls}>
                        {applicantType === 'student' ? 'Your Full Name' : 'Guardian Full Name'}{' '}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        placeholder="Full legal name"
                        className={inputCls}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>
                          Email Address <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+254 7XX XXX XXX"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Student Details (always shown; labelled differently) ── */}
                  <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-[#22272B]">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider pt-1">
                      {applicantType === 'student' ? 'Academic Details' : "Child's Details"}
                    </h3>

                    {applicantType === 'parent_guardian' && (
                      <div>
                        <label className={labelCls}>
                          Child's Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="student_name"
                          value={formData.student_name}
                          onChange={handleChange}
                          required={applicantType === 'parent_guardian'}
                          placeholder="Child's legal name"
                          className={inputCls}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>
                          {applicantType === 'student' ? 'Your Age' : "Child's Age"}{' '}
                          <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          name="student_age"
                          value={formData.student_age}
                          onChange={handleChange}
                          required
                          min={5}
                          max={25}
                          placeholder="e.g. 12"
                          className={inputCls}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>
                          {applicantType === 'student' ? 'Your School' : "Child's School"}{' '}
                          <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="school_name"
                          value={formData.school_name}
                          onChange={handleChange}
                          required
                          placeholder="Current school name"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Current Grade / Class <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="grade"
                          value={formData.grade}
                          onChange={handleChange}
                          required
                          className={selectCls}
                        >
                          <option value="" disabled>Select grade</option>
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* ── Location ── */}
                  <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-[#22272B]">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider pt-1">
                      Location
                    </h3>

                    <div>
                      <label className={labelCls}>
                        Settlement / Area <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="settlement"
                        value={formData.settlement}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Kibera, Mathare, Mukuru, Korogocho"
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        County <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="county"
                          value={formData.county}
                          onChange={handleChange}
                          required
                          className={selectCls}
                        >
                          <option value="" disabled>Select county</option>
                          {KENYAN_COUNTIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* ── Motivation ── */}
                  <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-[#22272B]">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider pt-1">
                      Your Story
                    </h3>

                    <div>
                      <label className={labelCls}>
                        Why do you need this scholarship?{' '}
                        <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                        rows={4}
                        minLength={100}
                        placeholder={
                          applicantType === 'student'
                            ? 'Tell us about your situation, your goals, and why this scholarship would make a difference in your education...'
                            : "Tell us about your child's situation, their dreams, and why this scholarship would transform their educational journey..."
                        }
                        className={inputCls}
                      />
                      <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
                        Minimum 100 characters. Be as specific as possible.
                      </p>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Additional Supporting Information{' '}
                        <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        name="supporting_info"
                        value={formData.supporting_info}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Any other context that would help us understand your situation — e.g. household income, number of siblings, community involvement..."
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#E40000] disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.01]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting Application…
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Application
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center text-gray-400 dark:text-white/40 leading-relaxed">
                    By submitting you agree that the information provided is accurate.
                    All applications are treated with strict confidentiality.
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Sponsor CTA Section ───────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <div className="w-14 h-14 bg-[#FF0000]/10 rounded-2xl flex items-center justify-center text-[#FF0000] mx-auto mb-5">
              <Heart className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Want to Sponsor a Child?
            </h2>
            <p className="text-gray-600 dark:text-white/70 leading-relaxed mb-8 max-w-xl mx-auto">
              For just{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                KES 1,000 per month
              </span>
              , you can give one child in an informal settlement a full year of
              digital education. Sponsors receive quarterly impact reports and
              optional direct communication with the family (with consent).
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#FF0000] hover:bg-[#E40000] text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02]"
            >
              <Heart className="w-5 h-5" />
              Become a Sponsor
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ScholarshipPage;
