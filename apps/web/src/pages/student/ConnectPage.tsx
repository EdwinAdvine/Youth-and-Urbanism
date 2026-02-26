import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { UserPlus, Search, Check, X, MessageCircle } from 'lucide-react';

const suggestedFriends = [
  { id: '1', name: 'Sarah M.', grade: 'Grade 7', interests: ['Science', 'Math'], mutual: 3 },
  { id: '2', name: 'Kevin O.', grade: 'Grade 7', interests: ['English', 'Art'], mutual: 5 },
  { id: '3', name: 'Amina K.', grade: 'Grade 7', interests: ['Math', 'Kiswahili'], mutual: 2 },
  { id: '4', name: 'James N.', grade: 'Grade 8', interests: ['Science', 'Technology'], mutual: 1 },
];

const friendRequests = [
  { id: '1', name: 'Grace W.', grade: 'Grade 7', sentAt: '2 hours ago' },
  { id: '2', name: 'David L.', grade: 'Grade 6', sentAt: '1 day ago' },
];

const myFriends = [
  { id: '1', name: 'Faith A.', grade: 'Grade 7', online: true, lastSeen: 'Online now' },
  { id: '2', name: 'Brian K.', grade: 'Grade 7', online: true, lastSeen: 'Online now' },
  { id: '3', name: 'Mary W.', grade: 'Grade 8', online: false, lastSeen: '2 hours ago' },
  { id: '4', name: 'Peter O.', grade: 'Grade 7', online: false, lastSeen: 'Yesterday' },
];

const ConnectPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [search, setSearch] = useState('');
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const sendRequest = (id: string) => setSentRequests(prev => new Set(prev).add(id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Connect</h1>
        <p className="text-gray-600 dark:text-white/70">Find and connect with study buddies</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for students..." className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`} />
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Friend Requests ({friendRequests.length})</h2>
          <div className="space-y-2">
            {friendRequests.map((req) => (
              <div key={req.id} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center gap-4`}>
                <div className={`w-10 h-10 bg-purple-500/20 ${borderRadius} flex items-center justify-center text-purple-400 font-bold`}>{req.name[0]}</div>
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-white font-medium">{req.name}</h3>
                  <p className="text-gray-400 dark:text-white/40 text-sm">{req.grade} · {req.sentAt}</p>
                </div>
                <button className={`p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 ${borderRadius}`}><Check className="w-4 h-4" /></button>
                <button className={`p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 ${borderRadius}`}><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Friends */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">My Friends ({myFriends.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {myFriends.map((friend) => (
            <div key={friend.id} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center gap-4`}>
              <div className="relative">
                <div className={`w-10 h-10 bg-blue-500/20 ${borderRadius} flex items-center justify-center text-blue-400 font-bold`}>{friend.name[0]}</div>
                {friend.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#181C1F]" />}
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-medium">{friend.name}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{friend.lastSeen}</p>
              </div>
              <button className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 ${borderRadius}`}><MessageCircle className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Friends */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Suggested for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestedFriends.map((friend) => (
            <div key={friend.id} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center gap-4`}>
              <div className={`w-10 h-10 bg-green-500/20 ${borderRadius} flex items-center justify-center text-green-400 font-bold`}>{friend.name[0]}</div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-medium">{friend.name}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{friend.grade} · {friend.mutual} mutual friends</p>
                <div className="flex gap-1 mt-1">{friend.interests.map(i => <span key={i} className={`px-1.5 py-0.5 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 text-xs ${borderRadius}`}>{i}</span>)}</div>
              </div>
              <button
                onClick={() => sendRequest(friend.id)}
                disabled={sentRequests.has(friend.id)}
                className={`px-3 py-1.5 ${borderRadius} text-sm flex items-center gap-1 ${sentRequests.has(friend.id) ? 'bg-green-500/20 text-green-400' : 'bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white'}`}
              >
                {sentRequests.has(friend.id) ? <><Check className="w-3 h-3" /> Sent</> : <><UserPlus className="w-3 h-3" /> Add</>}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectPage;
