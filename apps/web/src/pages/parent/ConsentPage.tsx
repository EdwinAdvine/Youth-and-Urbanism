/**
 * Consent & Permissions Page
 *
 * Granular consent matrix allowing parents to control data sharing
 * per child, per data type, per recipient. Includes audit trail.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ChevronDown, Clock, Check, X, Users } from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import {
  getConsentMatrix,
  updateConsent,
  getConsentAudit,
} from '../../services/parentSettingsService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ConsentRecord {
  id: string;
  child_id: string;
  child_name: string;
  data_type: string;
  recipient_type: string;
  consent_given: boolean;
  granted_at: string | null;
  revoked_at: string | null;
}

interface ConsentMatrix {
  child_id: string;
  child_name: string;
  consents: ConsentRecord[];
  data_types: string[];
  recipient_types: string[];
}

interface AuditEntry {
  id: string;
  action: string;
  performed_by: string;
  old_value: boolean | null;
  new_value: boolean | null;
  ip_address: string | null;
  created_at: string;
}

const DATA_TYPE_LABELS: Record<string, string> = {
  learning_analytics: 'Learning Analytics',
  ai_conversations: 'AI Conversations',
  assessment_scores: 'Assessment Scores',
  behavioral: 'Behavioral Data',
  health: 'Health Data',
};

const RECIPIENT_LABELS: Record<string, string> = {
  platform: 'Platform',
  instructors: 'Instructors',
  ai_system: 'AI System',
  third_party: 'Third Party',
  research: 'Research',
};

const ConsentPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChildId, children } = useParentStore();

  const [activeChildId, setActiveChildId] = useState<string | null>(
    selectedChildId || (children.length > 0 ? children[0].student_id : null)
  );
  const [matrix, setMatrix] = useState<ConsentMatrix | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (activeChildId) {
      loadMatrix(activeChildId);
    } else {
      setLoading(false);
    }
  }, [activeChildId]);

  const loadMatrix = async (childId: string) => {
    try {
      setLoading(true);
      const data = await getConsentMatrix(childId);
      setMatrix(data);
    } catch (error) {
      console.error('Failed to load consent matrix:', error);
      // Fallback with default structure
      setMatrix({
        child_id: childId,
        child_name: children.find((c) => c.student_id === childId)?.full_name || 'Child',
        consents: [],
        data_types: ['learning_analytics', 'ai_conversations', 'assessment_scores', 'behavioral', 'health'],
        recipient_types: ['platform', 'instructors', 'ai_system', 'third_party', 'research'],
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAudit = async () => {
    try {
      const data = await getConsentAudit(activeChildId || undefined);
      setAuditEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to load audit trail:', error);
    }
  };

  const getConsentValue = (dataType: string, recipientType: string): boolean => {
    if (!matrix) return false;
    const record = matrix.consents.find(
      (c) => c.data_type === dataType && c.recipient_type === recipientType
    );
    return record?.consent_given ?? false;
  };

  const handleToggle = async (dataType: string, recipientType: string) => {
    if (!activeChildId || !matrix) return;
    const currentValue = getConsentValue(dataType, recipientType);
    const cellKey = `${dataType}-${recipientType}`;
    setUpdating(cellKey);

    try {
      await updateConsent({
        child_id: activeChildId,
        data_type: dataType,
        recipient_type: recipientType,
        consent_given: !currentValue,
      });

      // Update local state
      setMatrix((prev) => {
        if (!prev) return prev;
        const existingIdx = prev.consents.findIndex(
          (c) => c.data_type === dataType && c.recipient_type === recipientType
        );
        const updatedConsents = [...prev.consents];
        if (existingIdx >= 0) {
          updatedConsents[existingIdx] = {
            ...updatedConsents[existingIdx],
            consent_given: !currentValue,
          };
        } else {
          updatedConsents.push({
            id: `temp-${Date.now()}`,
            child_id: activeChildId,
            child_name: prev.child_name,
            data_type: dataType,
            recipient_type: recipientType,
            consent_given: !currentValue,
            granted_at: !currentValue ? new Date().toISOString() : null,
            revoked_at: currentValue ? new Date().toISOString() : null,
          });
        }
        return { ...prev, consents: updatedConsents };
      });
    } catch (error) {
      console.error('Failed to update consent:', error);
    } finally {
      setUpdating(null);
    }
  };

  const toggleAudit = () => {
    if (!showAudit) {
      loadAudit();
    }
    setShowAudit(!showAudit);
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  if (children.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white font-medium mb-2">No children linked to your account</p>
          <p className="text-gray-500 dark:text-white/60 mb-4">Add your children to manage consent and permissions</p>
          <button
            onClick={() => navigate('/dashboard/parent/children')}
            className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
          >
            Manage Children
          </button>
        </div>
      </>
    );
  }

  const dataTypes = matrix?.data_types || [];
  const recipientTypes = matrix?.recipient_types || [];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consent & Permissions</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">
                Control what data is collected and shared for each child
              </p>
            </div>
          </div>
        </motion.div>

        {/* Child Selector Tabs */}
        {children.length > 1 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {children.map((child) => (
                <button
                  key={child.student_id}
                  onClick={() => setActiveChildId(child.student_id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeChildId === child.student_id
                      ? 'bg-[#E40000] text-gray-900 dark:text-white'
                      : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {child.full_name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Consent Matrix Table */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#22272B]">
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 uppercase tracking-wider px-4 py-3">
                    Data Type
                  </th>
                  {recipientTypes.map((rt) => (
                    <th
                      key={rt}
                      className="text-center text-xs text-gray-400 dark:text-white/40 uppercase tracking-wider px-3 py-3"
                    >
                      {RECIPIENT_LABELS[rt] || rt}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataTypes.map((dt) => (
                  <tr key={dt} className="border-b border-gray-200 dark:border-[#22272B] last:border-0">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {DATA_TYPE_LABELS[dt] || dt}
                      </span>
                    </td>
                    {recipientTypes.map((rt) => {
                      const cellKey = `${dt}-${rt}`;
                      const granted = getConsentValue(dt, rt);
                      const isUpdating = updating === cellKey;
                      return (
                        <td key={rt} className="text-center px-3 py-3">
                          <button
                            onClick={() => handleToggle(dt, rt)}
                            disabled={isUpdating}
                            className={`w-10 h-6 rounded-full transition-colors relative mx-auto ${
                              isUpdating
                                ? 'bg-gray-100 dark:bg-[#22272B] animate-pulse'
                                : granted
                                ? 'bg-green-500'
                                : 'bg-red-500/40'
                            } cursor-pointer`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                granted ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-3 text-xs text-gray-400 dark:text-white/40">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span>Consent granted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500/40" />
              <span>Consent revoked</span>
            </div>
          </div>
        </motion.div>

        {/* Audit Trail Section */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <button
            onClick={toggleAudit}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>View Audit Trail</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showAudit ? 'rotate-180' : ''}`}
            />
          </button>

          {showAudit && (
            <div className="mt-4 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-x-auto">
              {auditEntries.length === 0 ? (
                <div className="p-6 text-center text-gray-400 dark:text-white/40 text-sm">
                  No audit entries found.
                </div>
              ) : (
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#22272B]">
                      <th className="text-left text-xs text-gray-400 dark:text-white/40 uppercase tracking-wider px-4 py-3">
                        Date
                      </th>
                      <th className="text-left text-xs text-gray-400 dark:text-white/40 uppercase tracking-wider px-4 py-3">
                        Action
                      </th>
                      <th className="text-left text-xs text-gray-400 dark:text-white/40 uppercase tracking-wider px-4 py-3">
                        Change
                      </th>
                      <th className="text-left text-xs text-gray-400 dark:text-white/40 uppercase tracking-wider px-4 py-3">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-200 dark:border-[#22272B] last:border-0">
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-white/60">
                          {new Date(entry.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                              entry.action === 'granted'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {entry.action === 'granted' ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            {entry.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-white/60">
                          {entry.old_value !== null
                            ? `${entry.old_value ? 'Granted' : 'Revoked'} -> ${entry.new_value ? 'Granted' : 'Revoked'}`
                            : entry.new_value
                            ? 'Granted'
                            : 'Revoked'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 dark:text-white/40">
                          {entry.ip_address || '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ConsentPage;
