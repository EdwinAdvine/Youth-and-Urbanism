// CertificateValidationPage - Public page at /validate-certificate. Allows anyone to verify
// the authenticity of a certificate by entering its validation code.
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { certificateService } from '../services/certificateService';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  Award,
  User,
  BookOpen,
  Calendar,
  Star,
  Loader2,
} from 'lucide-react';

interface CertificateResult {
  studentName: string;
  courseName: string;
  dateIssued: string;
  grade: string;
  serialNumber: string;
}

type ValidationState = 'idle' | 'loading' | 'success' | 'error';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const CertificateValidationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [serialNumber, setSerialNumber] = useState(searchParams.get('serial') || '');
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [certificate, setCertificate] = useState<CertificateResult | null>(null);

  const doValidate = async (serial: string) => {
    if (!serial.trim()) return;
    setValidationState('loading');
    setCertificate(null);
    try {
      const data = await certificateService.validateBySerial(serial.trim());
      if (data.is_valid) {
        setCertificate({
          studentName: data.student_name,
          courseName: data.course_name,
          dateIssued: data.completion_date
            ? new Date(data.completion_date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date(data.issued_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }),
          grade: data.grade || 'Completed',
          serialNumber: data.serial_number,
        });
        setValidationState('success');
      } else {
        setValidationState('error');
      }
    } catch {
      setValidationState('error');
    }
  };

  // Auto-validate if serial comes from URL query param
  useEffect(() => {
    const serial = searchParams.get('serial');
    if (serial) doValidate(serial);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    doValidate(serialNumber);
  };

  const handleReset = () => {
    setSerialNumber('');
    setValidationState('idle');
    setCertificate(null);
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
              Verification
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Validate a <span className="text-[#FF0000]">Certificate</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-white/80 max-w-2xl mx-auto leading-relaxed">
              Enter the certificate serial number to verify its authenticity.
              Every certificate issued by Urban Home School can be validated here.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Validation Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#181C1F]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-[#FF0000]/10 rounded-xl flex items-center justify-center text-[#FF0000]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Certificate Verification</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">
                  Serial numbers start with &quot;UHS-&quot;
                </p>
              </div>
            </div>

            <form onSubmit={handleValidate} className="space-y-4">
              <div>
                <label
                  htmlFor="serial"
                  className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
                >
                  Certificate Serial Number
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
                  <input
                    type="text"
                    id="serial"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. UHS-2026-00001"
                    required
                    className="w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors text-base"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={validationState === 'loading' || !serialNumber.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#E40000] disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 dark:text-white px-6 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02]"
                >
                  {validationState === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Validate
                    </>
                  )}
                </button>
                {validationState !== 'idle' && validationState !== 'loading' && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-3.5 border border-gray-200 dark:border-[#22272B] hover:border-white/30 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white rounded-xl font-medium transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </motion.div>

          {/* Results Area */}
          {validationState === 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl p-8 text-center"
            >
              <Loader2 className="w-10 h-10 text-[#FF0000] animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-white/70">Verifying certificate authenticity...</p>
            </motion.div>
          )}

          {validationState === 'success' && certificate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 bg-gray-50 dark:bg-[#0F1112] border-2 border-green-500/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-400">
                    Certificate Verified
                  </h3>
                  <p className="text-sm text-green-400/70">
                    This certificate is authentic and valid
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white dark:bg-[#181C1F] rounded-xl p-4 border border-gray-200 dark:border-[#22272B]">
                  <Award className="w-5 h-5 text-[#FF0000] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-white/50">Serial Number</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white font-mono">
                      {certificate.serialNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-[#181C1F] rounded-xl p-4 border border-gray-200 dark:border-[#22272B]">
                  <User className="w-5 h-5 text-[#FF0000] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-white/50">Student Name</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {certificate.studentName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-[#181C1F] rounded-xl p-4 border border-gray-200 dark:border-[#22272B]">
                  <BookOpen className="w-5 h-5 text-[#FF0000] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-white/50">Course Name</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {certificate.courseName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-white dark:bg-[#181C1F] rounded-xl p-4 border border-gray-200 dark:border-[#22272B]">
                    <Calendar className="w-5 h-5 text-[#FF0000] shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/50">Date Issued</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {certificate.dateIssued}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white dark:bg-[#181C1F] rounded-xl p-4 border border-gray-200 dark:border-[#22272B]">
                    <Star className="w-5 h-5 text-[#FF0000] shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/50">Grade</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {certificate.grade}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {validationState === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 bg-gray-50 dark:bg-[#0F1112] border-2 border-red-500/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-400">
                    Certificate Not Found
                  </h3>
                  <p className="text-sm text-red-400/70">
                    We could not verify this certificate
                  </p>
                </div>
              </div>
              <p className="text-base text-gray-500 dark:text-white/60 leading-relaxed">
                The serial number you entered does not match any certificate in our
                records. Please double-check the number and try again. Valid serial
                numbers begin with &quot;UHS-&quot;. If you believe this is an error,
                please{' '}
                <a href="/contact" className="text-[#FF0000] hover:underline">
                  contact our support team
                </a>
                .
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              About Our Certificates
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto leading-relaxed mb-8">
              Every certificate issued by Urban Home School is digitally signed and
              uniquely serialized. Employers, schools, and institutions can verify
              the authenticity of any certificate using this tool.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: <ShieldCheck className="w-6 h-6" />,
                  title: 'Tamper-Proof',
                  desc: 'Digitally signed and uniquely serialized',
                },
                {
                  icon: <Search className="w-6 h-6" />,
                  title: 'Instant Verification',
                  desc: 'Results in seconds, available 24/7',
                },
                {
                  icon: <Award className="w-6 h-6" />,
                  title: 'Recognized',
                  desc: 'Aligned with CBC standards and competencies',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeInUp}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-2xl p-6 text-center"
                >
                  <div className="w-12 h-12 bg-[#FF0000]/10 rounded-xl flex items-center justify-center text-[#FF0000] mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-white/60">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CertificateValidationPage;
