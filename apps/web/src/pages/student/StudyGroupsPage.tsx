import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Users, Plus, BookOpen, MessageCircle, LogIn } from 'lucide-react';

const initialGroups = [
  { id: '1', name: 'Math Wizards', subject: 'Mathematics', members: 6, maxMembers: 8, description: 'Practice fractions and algebra together', isJoined: true },
  { id: '2', name: 'Science Explorers', subject: 'Science', members: 4, maxMembers: 6, description: 'Weekly science experiments and discussions', isJoined: true },
  { id: '3', name: 'English Bookworms', subject: 'English', members: 7, maxMembers: 10, description: 'Book reading club and creative writing', isJoined: false },
  { id: '4', name: 'Code Ninjas', subject: 'Technology', members: 5, maxMembers: 8, description: 'Learn coding with Scratch and Python', isJoined: false },
];

const StudyGroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [showCreate, setShowCreate] = useState(false);
  const [groups, setGroups] = useState(initialGroups);
  const [newGroup, setNewGroup] = useState({ name: '', subject: '', description: '' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Study Groups</h1>
          <p className="text-gray-600 dark:text-white/70">Learn together with your classmates</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      {showCreate && (
        <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-[#FF0000]/30`}>
          <h3 className="text-gray-900 dark:text-white font-medium mb-3">Create Study Group</h3>
          <div className="space-y-3">
            <input value={newGroup.name} onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))} placeholder="Group name..." className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`} />
            <input value={newGroup.subject} onChange={(e) => setNewGroup(prev => ({ ...prev, subject: e.target.value }))} placeholder="Subject..." className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`} />
            <textarea value={newGroup.description} onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))} placeholder="Description..." className={`w-full h-20 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000] resize-none`} />
            <button
              onClick={() => {
                if (newGroup.name && newGroup.subject) {
                  setGroups(prev => [...prev, { id: String(prev.length + 1), name: newGroup.name, subject: newGroup.subject, members: 1, maxMembers: 8, description: newGroup.description, isJoined: true }]);
                  setNewGroup({ name: '', subject: '', description: '' });
                  setShowCreate(false);
                }
              }}
              disabled={!newGroup.name || !newGroup.subject}
              className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 disabled:opacity-50 text-gray-900 dark:text-white ${borderRadius}`}
            >Create</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div key={group.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-blue-500/20 ${borderRadius} flex items-center justify-center`}>
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-semibold">{group.name}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{group.subject} · {group.members}/{group.maxMembers} members</p>
                <p className="text-gray-500 dark:text-white/60 text-sm mt-1">{group.description}</p>
                <div className="flex gap-2 mt-3">
                  {group.isJoined ? (
                    <>
                      <button onClick={() => navigate(`/dashboard/student/community/groups/${group.id}/chat`)} className={`px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm ${borderRadius} flex items-center gap-1`}><MessageCircle className="w-3 h-3" /> Chat</button>
                      <button onClick={() => navigate(`/dashboard/student/community/groups/${group.id}/resources`)} className={`px-3 py-1.5 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 text-sm ${borderRadius} flex items-center gap-1`}><BookOpen className="w-3 h-3" /> Resources</button>
                    </>
                  ) : (
                    <button onClick={() => setGroups(prev => prev.map(g => g.id === group.id ? { ...g, isJoined: true, members: g.members + 1 } : g))} className={`px-3 py-1.5 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-1`}><LogIn className="w-3 h-3" /> Join</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyGroupsPage;
