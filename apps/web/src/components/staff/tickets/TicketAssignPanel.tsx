import React, { useState } from 'react';
import { UserPlus, AlertOctagon, ChevronDown, User, X } from 'lucide-react';

interface TicketAssignPanelProps {
  ticketId: string;
  currentAssignee?: string;
  onAssign: (userId: string) => void;
  onEscalate: (reason: string) => void;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  activeTickets: number;
}

const MOCK_STAFF: StaffMember[] = [
  { id: 'staff-1', name: 'Alice Wanjiku', role: 'Support Lead', activeTickets: 3 },
  { id: 'staff-2', name: 'Brian Ochieng', role: 'Content Support', activeTickets: 5 },
  { id: 'staff-3', name: 'Catherine Mwangi', role: 'Technical Support', activeTickets: 2 },
  { id: 'staff-4', name: 'David Kamau', role: 'Billing Support', activeTickets: 4 },
  { id: 'staff-5', name: 'Esther Nyambura', role: 'Senior Support', activeTickets: 1 },
];

const TicketAssignPanel: React.FC<TicketAssignPanelProps> = ({
  ticketId: _ticketId,
  currentAssignee,
  onAssign,
  onEscalate,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  const currentStaff = currentAssignee
    ? MOCK_STAFF.find((s) => s.id === currentAssignee)
    : null;

  const handleAssign = (userId: string) => {
    onAssign(userId);
    setShowDropdown(false);
  };

  const handleEscalate = () => {
    if (!escalateReason.trim()) return;
    onEscalate(escalateReason.trim());
    setEscalateReason('');
    setShowEscalateModal(false);
  };

  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-200 dark:border-[#22272B]">
        <UserPlus className="w-4 h-4 text-gray-500 dark:text-white/60" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Assignment</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Assignee */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40 mb-2">
            Currently Assigned To
          </label>
          {currentStaff ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-[#22272B]/50 border border-gray-200 dark:border-[#22272B]">
              <div className="w-8 h-8 rounded-full bg-[#E40000]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-[#E40000]">
                  {currentStaff.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentStaff.name}</p>
                <p className="text-xs text-gray-400 dark:text-white/40">{currentStaff.role}</p>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-white/30">
                {currentStaff.activeTickets} active
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-[#22272B]/30 border border-dashed border-gray-200 dark:border-[#22272B]">
              <User className="w-4 h-4 text-gray-400 dark:text-gray-300 dark:text-white/20" />
              <span className="text-sm text-gray-400 dark:text-white/40">Unassigned</span>
            </div>
          )}
        </div>

        {/* Reassign dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-100 dark:bg-[#22272B]/50 border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#333] transition-colors"
          >
            <span>{currentAssignee ? 'Reassign to...' : 'Assign to...'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-[#1a1f23] border border-gray-200 dark:border-[#22272B] rounded-lg shadow-xl overflow-hidden">
              {MOCK_STAFF.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => handleAssign(staff.id)}
                  disabled={staff.id === currentAssignee}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    staff.id === currentAssignee
                      ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-[#22272B]/30'
                      : 'hover:bg-gray-100 dark:hover:bg-[#22272B]/50'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#22272B] flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-white/60">
                      {staff.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 dark:text-white truncate">{staff.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-white/40">{staff.role}</p>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      staff.activeTickets > 4
                        ? 'bg-red-500/20 text-red-400'
                        : staff.activeTickets > 2
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {staff.activeTickets}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Escalate button */}
        <div className="pt-2 border-t border-gray-200 dark:border-[#22272B]">
          <button
            onClick={() => setShowEscalateModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-colors"
          >
            <AlertOctagon className="w-4 h-4" />
            Escalate Ticket
          </button>
        </div>
      </div>

      {/* Escalation Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-[#22272B]">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Escalate Ticket</h3>
              </div>
              <button
                onClick={() => {
                  setShowEscalateModal(false);
                  setEscalateReason('');
                }}
                className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <label className="block text-xs font-medium text-gray-500 dark:text-white/60 mb-1.5">
                Reason for Escalation
              </label>
              <textarea
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="Describe why this ticket needs escalation..."
                rows={4}
                className="w-full px-3 py-2.5 bg-gray-100 dark:bg-[#22272B]/50 border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 outline-none focus:border-orange-500/50 resize-none transition-colors"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-200 dark:border-[#22272B]">
              <button
                onClick={() => {
                  setShowEscalateModal(false);
                  setEscalateReason('');
                }}
                className="px-4 py-2 text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                disabled={!escalateReason.trim()}
                className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-orange-600 rounded-lg hover:bg-orange-600/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Escalate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketAssignPanel;
