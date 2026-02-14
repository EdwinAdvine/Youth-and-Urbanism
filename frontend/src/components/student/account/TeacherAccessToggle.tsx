import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Eye, EyeOff } from 'lucide-react';

interface Permission {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface TeacherAccessToggleProps {
  permissions: Permission[];
  onUpdate: (permissions: Permission[]) => void;
}

const TeacherAccessToggle: React.FC<TeacherAccessToggleProps> = ({ permissions: initialPerms, onUpdate }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [permissions, setPermissions] = useState(initialPerms);

  const toggle = (id: string) => {
    const updated = permissions.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    setPermissions(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-3">
      {permissions.map((perm) => (
        <div
          key={perm.id}
          className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center gap-4`}
        >
          <div className={`w-9 h-9 ${borderRadius} flex items-center justify-center ${
            perm.enabled ? 'bg-green-500/20' : 'bg-gray-50 dark:bg-white/5'
          }`}>
            {perm.enabled ? (
              <Eye className="w-4 h-4 text-green-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400 dark:text-white/40" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 dark:text-white text-sm font-medium">{perm.label}</h3>
            <p className="text-gray-400 dark:text-white/40 text-xs">{perm.description}</p>
          </div>
          <button
            onClick={() => toggle(perm.id)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              perm.enabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-white/20'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                perm.enabled ? 'translate-x-5.5 left-0.5' : 'left-0.5'
              }`}
              style={{ transform: perm.enabled ? 'translateX(22px)' : 'translateX(0)' }}
            />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TeacherAccessToggle;
