/**
 * Transcripts Page
 *
 * Displays the official academic transcript for a selected child
 * with grade table, school info header, and print/download.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award, ArrowLeft, Printer, Download,
} from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import { getTranscript } from '../../services/parentReportsService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface AcademicRecord {
  subject: string;
  term_1: string | null;
  term_2: string | null;
  term_3: string | null;
  final_grade: string;
}

interface TranscriptData {
  student_id: string;
  student_name: string;
  admission_number: string;
  grade_level: string;
  academic_records: AcademicRecord[];
  certificates: { name: string; date: string }[];
  total_credits: number;
  gpa: number;
  generated_at: string;
  pdf_url: string;
}

const TranscriptsPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChildId } = useParentStore();

  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedChildId) {
      loadTranscript();
    }
  }, [selectedChildId]);

  const loadTranscript = async () => {
    if (!selectedChildId) return;
    try {
      setLoading(true);
      const data = await getTranscript(selectedChildId);
      setTranscript(data);
    } catch (error) {
      console.error('Failed to load transcript:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!selectedChildId) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Award className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No child selected</h3>
            <p className="text-gray-500 dark:text-white/60 text-sm">
              Please select a child from the sidebar to view their transcript.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/parent/reports')}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors print:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Reports</span>
        </button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Official Transcripts</h1>
                <p className="text-gray-500 dark:text-white/60 mt-1">
                  Academic record for {transcript?.student_name || 'student'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              {transcript?.pdf_url && (
                <a
                  href={transcript.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#E40000] text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-[#C00] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {transcript ? (
          <>
            {/* School Info Header */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Urban Home School</h2>
                  <p className="text-gray-500 dark:text-white/50 text-sm">Official Academic Transcript</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#181C1F]">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-white/40">Student Name</p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{transcript.student_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-white/40">Admission No.</p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{transcript.admission_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-white/40">Grade Level</p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{transcript.grade_level}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-white/40">Generated</p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {new Date(transcript.generated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Grade Table */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#181C1F]">
                      <th className="text-left text-xs text-gray-500 dark:text-white/50 font-medium px-6 py-4">Subject</th>
                      <th className="text-center text-xs text-gray-500 dark:text-white/50 font-medium px-4 py-4">Term 1</th>
                      <th className="text-center text-xs text-gray-500 dark:text-white/50 font-medium px-4 py-4">Term 2</th>
                      <th className="text-center text-xs text-gray-500 dark:text-white/50 font-medium px-4 py-4">Term 3</th>
                      <th className="text-center text-xs text-gray-500 dark:text-white/50 font-medium px-4 py-4">Final Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transcript.academic_records.map((record, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-[#181C1F] last:border-b-0"
                      >
                        <td className="px-6 py-3 text-sm text-gray-900 dark:text-white font-medium">{record.subject}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-white/80 text-center">
                          {record.term_1 || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-white/80 text-center">
                          {record.term_2 || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-white/80 text-center">
                          {record.term_3 || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-bold text-center">
                          {record.final_grade}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Overall Results Summary */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 text-center">
                  <p className="text-gray-500 dark:text-white/60 text-sm mb-1">GPA</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{transcript.gpa.toFixed(2)}</p>
                </div>
                <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 text-center">
                  <p className="text-gray-500 dark:text-white/60 text-sm mb-1">Total Credits</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{transcript.total_credits}</p>
                </div>
                <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 text-center">
                  <p className="text-gray-500 dark:text-white/60 text-sm mb-1">Certificates</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{transcript.certificates.length}</p>
                </div>
              </div>
            </motion.div>

            {/* Certificates */}
            {transcript.certificates.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Certificates Earned</h3>
                <div className="space-y-2">
                  {transcript.certificates.map((cert, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{cert.name}</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-white/40">
                        {new Date(cert.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Award className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No transcript available
              </h3>
              <p className="text-gray-500 dark:text-white/60 text-sm">
                The transcript will be available once academic records are entered.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default TranscriptsPage;
