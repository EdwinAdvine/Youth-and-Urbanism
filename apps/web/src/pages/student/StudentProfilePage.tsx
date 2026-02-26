import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { User, Camera, Edit2, Award, Flame, BookOpen, Star, MapPin, Calendar, Save } from 'lucide-react';

const StudentProfilePage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('I love learning Science and Math! Grade 7 student at Urban Home School. Aspiring scientist and coder.');
  const [displayName, setDisplayName] = useState('Kevin Ochieng');

  const stats = [
    { label: 'Courses', value: 8, icon: BookOpen, color: 'text-blue-400' },
    { label: 'Badges', value: 15, icon: Award, color: 'text-yellow-400' },
    { label: 'Day Streak', value: 23, icon: Flame, color: 'text-orange-400' },
    { label: 'XP', value: '2,450', icon: Star, color: 'text-purple-400' },
  ];

  const interests = ['Science', 'Mathematics', 'Coding', 'Space', 'Football', 'Music'];
  const recentBadges = [
    { name: 'Quiz Master', icon: '🏆', earned: '2 days ago' },
    { name: 'Streak Warrior', icon: '🔥', earned: '5 days ago' },
    { name: 'Bookworm', icon: '📚', earned: '1 week ago' },
    { name: 'Helpful Hand', icon: '🤝', earned: '2 weeks ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className={`p-6 bg-gradient-to-br from-[#FF0000]/20 to-purple-500/20 ${borderRadius} border border-[#FF0000]/30`}>
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className={`w-20 h-20 ${borderRadius} bg-gradient-to-br from-[#FF0000] to-orange-500 flex items-center justify-center`}>
              <User className="w-10 h-10 text-gray-900 dark:text-white" />
            </div>
            <button className={`absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} flex items-center justify-center`}>
              <Camera className="w-3 h-3 text-gray-500 dark:text-white/60" />
            </button>
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`px-3 py-1 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 ${borderRadius} text-gray-900 dark:text-white font-bold text-xl focus:outline-none w-full`}
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
            )}
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-white/60">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Nairobi, Kenya</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined Jan 2025</span>
            </div>
            <div className="mt-2">
              <span className={`px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs ${borderRadius}`}>Grade 7</span>
              <span className={`px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs ${borderRadius} ml-1`}>Level 12</span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 ${borderRadius} text-sm flex items-center gap-1 ${
              isEditing ? 'bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60'
            }`}
          >
            {isEditing ? <><Save className="w-3 h-3" /> Save</> : <><Edit2 className="w-3 h-3" /> Edit</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
              <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
              <div className="text-gray-900 dark:text-white font-bold">{stat.value}</div>
              <div className="text-gray-400 dark:text-white/40 text-xs">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Bio */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-2">About Me</h3>
        {isEditing ? (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-700 dark:text-white/80 focus:outline-none focus:border-[#FF0000] resize-none text-sm`}
          />
        ) : (
          <p className="text-gray-600 dark:text-white/70 text-sm">{bio}</p>
        )}
      </div>

      {/* Interests */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-3">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <span key={interest} className={`px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-white/70 text-sm ${borderRadius}`}>
              {interest}
            </span>
          ))}
          {isEditing && (
            <button className={`px-3 py-1 border border-dashed border-gray-300 dark:border-white/20 text-gray-400 dark:text-white/40 text-sm ${borderRadius}`}>
              + Add
            </button>
          )}
        </div>
      </div>

      {/* Learning Style */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-3">Learning Style</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 bg-blue-500/10 ${borderRadius} border border-blue-500/20`}>
            <div className="text-blue-400 font-bold text-sm">Visual Learner</div>
            <div className="text-gray-400 dark:text-white/40 text-xs mt-1">Prefers diagrams and videos</div>
          </div>
          <div className={`p-3 bg-green-500/10 ${borderRadius} border border-green-500/20`}>
            <div className="text-green-400 font-bold text-sm">Morning Person</div>
            <div className="text-gray-400 dark:text-white/40 text-xs mt-1">Most productive 8-11 AM</div>
          </div>
        </div>
      </div>

      {/* Recent Badges */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-3">Recent Badges</h3>
        <div className="grid grid-cols-2 gap-2">
          {recentBadges.map((badge) => (
            <div key={badge.name} className={`p-3 bg-gray-50 dark:bg-white/5 ${borderRadius} flex items-center gap-3`}>
              <span className="text-2xl">{badge.icon}</span>
              <div>
                <div className="text-gray-900 dark:text-white text-sm font-medium">{badge.name}</div>
                <div className="text-gray-400 dark:text-white/40 text-xs">{badge.earned}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
