import React from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UrgentTicket {
  id: string;
  subject: string;
  priority: 'critical' | 'high';
  slaRemaining: string;
  isBreached: boolean;
}

interface UrgentTicketsCardProps {
  tickets: UrgentTicket[];
  isLoading?: boolean;
}

const UrgentTicketsCard: React.FC<UrgentTicketsCardProps> = ({ tickets, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5 animate-pulse">
        <div className="h-5 w-32 bg-[#22272B] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-[#22272B] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF4444]" />
          Urgent Tickets
        </h3>
        <span className="text-xs text-white/40">{tickets.length} items</span>
      </div>
      <div className="space-y-2">
        {tickets.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-4">No urgent tickets</p>
        ) : (
          tickets.slice(0, 5).map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => navigate(`/dashboard/staff/support/tickets/${ticket.id}`)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#22272B]/50 hover:bg-[#22272B] transition-colors text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{ticket.subject}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    ticket.priority === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {ticket.priority}
                  </span>
                  <span className={`text-xs flex items-center gap-1 ${ticket.isBreached ? 'text-red-400' : 'text-white/50'}`}>
                    <Clock className="w-3 h-3" />
                    {ticket.isBreached ? 'BREACHED' : ticket.slaRemaining}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0 ml-2" />
            </button>
          ))
        )}
      </div>
      {tickets.length > 5 && (
        <button
          onClick={() => navigate('/dashboard/staff/support/tickets?priority=critical,high')}
          className="mt-3 text-xs text-[#FF4444] hover:text-[#FF6666] transition-colors"
        >
          View all {tickets.length} urgent tickets
        </button>
      )}
    </div>
  );
};

export default UrgentTicketsCard;
