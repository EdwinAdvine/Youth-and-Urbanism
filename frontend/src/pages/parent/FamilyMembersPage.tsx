/**
 * Family Members Page
 *
 * Manage linked family members, invite new members, configure
 * viewing rights, and remove members.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Trash2,
  Settings,
  Mail,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import {
  getFamilyMembers,
  inviteFamilyMember,
  removeFamilyMember,
  updateViewingRights,
} from '../../services/parentSettingsService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface FamilyMember {
  id: string;
  email: string;
  full_name: string;
  relationship: string;
  viewing_rights: string[];
  can_edit: boolean;
  invited_at: string;
  accepted_at: string | null;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'co_parent', label: 'Co-Parent' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'other', label: 'Other' },
];

const RELATIONSHIP_COLORS: Record<string, string> = {
  co_parent: 'bg-blue-500/20 text-blue-400',
  grandparent: 'bg-purple-500/20 text-purple-400',
  guardian: 'bg-green-500/20 text-green-400',
  other: 'bg-gray-500/20 text-gray-400',
};

const FamilyMembersPage: React.FC = () => {
  const { children } = useParentStore();

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState<string | null>(null);
  const [editingRights, setEditingRights] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Invite form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('co_parent');
  const [inviting, setInviting] = useState(false);

  // Editing rights state
  const [rightsCanViewGrades, setRightsCanViewGrades] = useState(false);
  const [rightsCanViewActivity, setRightsCanViewActivity] = useState(false);
  const [rightsCanViewAIInsights, setRightsCanViewAIInsights] = useState(false);
  const [rightsCanEdit, setRightsCanEdit] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getFamilyMembers();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Failed to load family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    try {
      setInviting(true);
      await inviteFamilyMember({
        email: inviteEmail,
        full_name: inviteName,
        relationship: inviteRelationship,
        viewing_rights: children.map((c) => c.student_id),
        can_edit: false,
      });
      setToast({ type: 'success', message: `Invitation sent to ${inviteEmail}` });
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
      setInviteRelationship('co_parent');
      loadMembers();
    } catch (error) {
      console.error('Failed to invite family member:', error);
      setToast({ type: 'error', message: 'Failed to send invitation. Please try again.' });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await removeFamilyMember(memberId);
      setToast({ type: 'success', message: 'Family member removed.' });
      setShowRemoveModal(null);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (error) {
      console.error('Failed to remove family member:', error);
      setToast({ type: 'error', message: 'Failed to remove member. Please try again.' });
    }
  };

  const openEditRights = (member: FamilyMember) => {
    setEditingRights(member.id);
    // Derive toggles from viewing_rights array
    setRightsCanViewGrades(member.viewing_rights.includes('grades'));
    setRightsCanViewActivity(member.viewing_rights.includes('activity'));
    setRightsCanViewAIInsights(member.viewing_rights.includes('ai_insights'));
    setRightsCanEdit(member.can_edit);
  };

  const handleSaveRights = async () => {
    if (!editingRights) return;

    const rights: string[] = [];
    if (rightsCanViewGrades) rights.push('grades');
    if (rightsCanViewActivity) rights.push('activity');
    if (rightsCanViewAIInsights) rights.push('ai_insights');

    try {
      await updateViewingRights(editingRights, {
        viewing_rights: rights,
        can_edit: rightsCanEdit,
      });
      setToast({ type: 'success', message: 'Viewing rights updated.' });
      setEditingRights(null);
      loadMembers();
    } catch (error) {
      console.error('Failed to update viewing rights:', error);
      setToast({ type: 'error', message: 'Failed to update rights. Please try again.' });
    }
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

  return (
    <>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                : 'bg-red-500/20 border border-red-500/40 text-red-400'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Family Members</h1>
                <p className="text-sm text-gray-500 dark:text-white/60">
                  Manage who can view your children's progress
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>
        </motion.div>

        {/* Members List */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          {members.length === 0 ? (
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60 mb-2">No family members linked.</p>
              <p className="text-sm text-gray-400 dark:text-white/40 mb-6">
                Invite family to share your children's progress.
              </p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
              >
                Invite Family Member
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
                >
                  {/* Member header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-[#22272B] rounded-full flex items-center justify-center text-gray-900 dark:text-white font-bold text-sm">
                        {member.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{member.full_name}</p>
                        <p className="text-xs text-gray-400 dark:text-white/40">{member.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        RELATIONSHIP_COLORS[member.relationship] || 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {RELATIONSHIP_OPTIONS.find((r) => r.value === member.relationship)?.label ||
                        member.relationship}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mb-4 text-xs">
                    <Mail className="w-3 h-3 text-gray-400 dark:text-white/40" />
                    <span className="text-gray-400 dark:text-white/40">
                      {member.accepted_at
                        ? `Joined ${new Date(member.accepted_at).toLocaleDateString()}`
                        : `Invited ${new Date(member.invited_at).toLocaleDateString()} (pending)`}
                    </span>
                  </div>

                  {/* Viewing rights */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {member.viewing_rights.map((right) => (
                      <span
                        key={right}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 text-xs rounded"
                      >
                        {right}
                      </span>
                    ))}
                    {member.viewing_rights.length === 0 && (
                      <span className="text-xs text-gray-400 dark:text-white/30">No viewing rights configured</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditRights(member)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 text-xs rounded-lg hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      Edit Rights
                    </button>
                    <button
                      onClick={() => setShowRemoveModal(member.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invite Family Member</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-white/60 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#E40000] placeholder:text-gray-400 dark:placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 dark:text-white/60 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#E40000] placeholder:text-gray-400 dark:placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 dark:text-white/60 mb-1.5">Relationship</label>
                  <select
                    value={inviteRelationship}
                    onChange={(e) => setInviteRelationship(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#E40000]"
                  >
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 rounded-lg hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={inviting || !inviteName.trim() || !inviteEmail.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Remove Confirmation Modal */}
        {showRemoveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Remove Family Member</h3>
              <p className="text-sm text-gray-500 dark:text-white/60 mb-6">
                This person will lose access to your children's progress. This action cannot be
                undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowRemoveModal(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 rounded-lg hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemove(showRemoveModal)}
                  className="px-5 py-2 bg-red-600 text-gray-900 dark:text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Rights Modal */}
        {editingRights && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Viewing Rights</h3>
                <button
                  onClick={() => setEditingRights(null)}
                  className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: 'View Grades',
                    value: rightsCanViewGrades,
                    setter: setRightsCanViewGrades,
                  },
                  {
                    label: 'View Activity',
                    value: rightsCanViewActivity,
                    setter: setRightsCanViewActivity,
                  },
                  {
                    label: 'View AI Insights',
                    value: rightsCanViewAIInsights,
                    setter: setRightsCanViewAIInsights,
                  },
                  {
                    label: 'Can Edit',
                    value: rightsCanEdit,
                    setter: setRightsCanEdit,
                  },
                ].map((toggle) => (
                  <div
                    key={toggle.label}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm text-gray-900 dark:text-white">{toggle.label}</span>
                    <button
                      onClick={() => toggle.setter(!toggle.value)}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        toggle.value ? 'bg-[#E40000]' : 'bg-gray-100 dark:bg-[#22272B]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          toggle.value ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setEditingRights(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 rounded-lg hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRights}
                  className="px-5 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
                >
                  Save Rights
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FamilyMembersPage;
