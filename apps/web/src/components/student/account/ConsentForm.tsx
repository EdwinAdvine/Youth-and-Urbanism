import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Shield, CheckCircle } from 'lucide-react';

interface ConsentFormProps {
  onSubmit: (consents: Record<string, boolean>) => void;
}

const consentItems = [
  { id: 'data_collection', label: 'Allow collection of learning data to personalize my experience', required: true },
  { id: 'ai_interaction', label: 'Allow AI tutors to use my learning history for better responses', required: false },
  { id: 'parent_access', label: 'Allow my parent/guardian to view my progress reports', required: true },
  { id: 'peer_visibility', label: 'Show my name on class leaderboards', required: false },
  { id: 'notifications', label: 'Receive learning reminders and notifications', required: false },
];

const ConsentForm: React.FC<ConsentFormProps> = ({ onSubmit }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [consents, setConsents] = useState<Record<string, boolean>>(
    Object.fromEntries(consentItems.map(c => [c.id, c.required]))
  );
  const [saved, setSaved] = useState(false);

  const toggle = (id: string, required: boolean) => {
    if (required) return;
    setConsents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = () => {
    onSubmit(consents);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-green-400" />
        <h3 className="text-gray-900 dark:text-white font-semibold">Privacy & Consent</h3>
      </div>
      <p className="text-gray-500 dark:text-white/50 text-sm mb-4">
        We respect your privacy. Review and manage your data preferences below.
      </p>
      <div className="space-y-3">
        {consentItems.map((item) => (
          <label
            key={item.id}
            className={`flex items-start gap-3 p-3 bg-gray-50 dark:bg-white/5 ${borderRadius} cursor-pointer ${item.required ? 'opacity-75' : ''}`}
          >
            <input
              type="checkbox"
              checked={consents[item.id]}
              onChange={() => toggle(item.id, item.required)}
              disabled={item.required}
              className="mt-0.5 accent-green-500"
            />
            <div>
              <span className="text-gray-900 dark:text-white text-sm">{item.label}</span>
              {item.required && <span className="text-gray-400 dark:text-white/30 text-xs block mt-0.5">Required</span>}
            </div>
          </label>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className={`w-full mt-4 py-2.5 ${saved ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'} text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
      >
        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Preferences'}
      </button>
    </div>
  );
};

export default ConsentForm;
