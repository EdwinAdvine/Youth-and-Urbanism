import React, { useState } from 'react';
import { Plus, Users, X, GripVertical, DoorOpen } from 'lucide-react';

interface BreakoutRoom {
  id: string;
  name: string;
  participants: { id: string; name: string }[];
}

interface BreakoutRoomManagerProps {
  rooms: BreakoutRoom[];
  onCreateRoom: (name: string) => void;
  onAssignParticipant: (roomId: string, participantId: string) => void;
}

const UNASSIGNED_PARTICIPANTS = [
  { id: 'up1', name: 'Emily Akinyi' },
  { id: 'up2', name: 'Felix Mutua' },
  { id: 'up3', name: 'Grace Nyokabi' },
  { id: 'up4', name: 'Hassan Omar' },
  { id: 'up5', name: 'Irene Chebet' },
];

const BreakoutRoomManager: React.FC<BreakoutRoomManagerProps> = ({
  rooms,
  onCreateRoom,
  onAssignParticipant,
}) => {
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [draggedParticipant, setDraggedParticipant] = useState<string | null>(null);

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    onCreateRoom(newRoomName.trim());
    setNewRoomName('');
    setShowCreateInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateRoom();
    if (e.key === 'Escape') {
      setShowCreateInput(false);
      setNewRoomName('');
    }
  };

  const assignedIds = new Set(rooms.flatMap((r) => r.participants.map((p) => p.id)));
  const availableParticipants = UNASSIGNED_PARTICIPANTS.filter((p) => !assignedIds.has(p.id));

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#22272B]">
        <div className="flex items-center gap-2">
          <DoorOpen className="w-4 h-4 text-white/60" />
          <h3 className="text-sm font-semibold text-white">Breakout Rooms</h3>
          <span className="text-xs text-white/40">{rooms.length} rooms</span>
        </div>
        <button
          onClick={() => setShowCreateInput(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#E40000] bg-[#E40000]/10 rounded-lg hover:bg-[#E40000]/20 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Create Room
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Create room input */}
        {showCreateInput && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#E40000]/5 border border-[#E40000]/20">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Room name..."
              className="flex-1 px-2 py-1.5 bg-[#22272B]/50 border border-[#22272B] rounded text-sm text-white placeholder:text-white/30 outline-none focus:border-[#E40000]/50"
              autoFocus
            />
            <button
              onClick={handleCreateRoom}
              disabled={!newRoomName.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#E40000] rounded hover:bg-[#E40000]/90 transition-colors disabled:opacity-40"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateInput(false);
                setNewRoomName('');
              }}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Rooms */}
        {rooms.length === 0 && !showCreateInput ? (
          <div className="text-center py-8">
            <DoorOpen className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/40">No breakout rooms</p>
            <p className="text-xs text-white/30 mt-1">Create rooms to split participants</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-[#E40000]/50');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-[#E40000]/50');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-[#E40000]/50');
                if (draggedParticipant) {
                  onAssignParticipant(room.id, draggedParticipant);
                  setDraggedParticipant(null);
                }
              }}
              className="p-3 rounded-lg border border-[#22272B] bg-[#22272B]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{room.name}</span>
                <span className="flex items-center gap-1 text-xs text-white/40">
                  <Users className="w-3 h-3" />
                  {room.participants.length}
                </span>
              </div>
              {room.participants.length === 0 ? (
                <p className="text-xs text-white/30 italic py-2 text-center border border-dashed border-[#22272B] rounded">
                  Drag participants here
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {room.participants.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] bg-[#181C1F] border border-[#22272B] text-white/60"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      {p.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {/* Unassigned Participants */}
        {availableParticipants.length > 0 && (
          <div className="pt-3 border-t border-[#22272B]">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
              Unassigned ({availableParticipants.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableParticipants.map((p) => (
                <span
                  key={p.id}
                  draggable
                  onDragStart={() => setDraggedParticipant(p.id)}
                  onDragEnd={() => setDraggedParticipant(null)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-[#22272B]/50 border border-[#22272B] text-white/60 cursor-grab active:cursor-grabbing hover:border-[#333] transition-colors"
                >
                  <GripVertical className="w-3 h-3 text-white/20" />
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakoutRoomManager;
