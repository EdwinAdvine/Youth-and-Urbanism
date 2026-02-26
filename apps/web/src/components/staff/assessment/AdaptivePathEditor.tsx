import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, CheckCircle, XCircle, GitBranch } from 'lucide-react';

interface AdaptivePath {
  id: string;
  fromDifficulty: number;
  correctTarget: number;
  incorrectTarget: number;
}

interface AdaptivePathEditorProps {
  paths: AdaptivePath[];
  onChange: (paths: AdaptivePath[]) => void;
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Easy',
  2: 'Below Average',
  3: 'Average',
  4: 'Above Average',
  5: 'Hard',
};

const DIFFICULTY_COLORS: Record<number, string> = {
  1: 'bg-green-500/20 text-green-400 border-green-500/30',
  2: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  3: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  4: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  5: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const generateId = (): string => Math.random().toString(36).substring(2, 10);

const DifficultyBadge: React.FC<{ level: number; size?: 'sm' | 'md' }> = ({
  level,
  size = 'sm',
}) => {
  const colorClass = DIFFICULTY_COLORS[level] || DIFFICULTY_COLORS[3];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClass}`}>
      {level} - {DIFFICULTY_LABELS[level]}
    </span>
  );
};

const AdaptivePathEditor: React.FC<AdaptivePathEditorProps> = ({ paths, onChange }) => {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const handleAddPath = () => {
    const newPath: AdaptivePath = {
      id: generateId(),
      fromDifficulty: 3,
      correctTarget: Math.min(5, 4),
      incorrectTarget: Math.max(1, 2),
    };
    onChange([...paths, newPath]);
  };

  const handleUpdatePath = (id: string, field: keyof AdaptivePath, value: number) => {
    onChange(
      paths.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleRemovePath = (id: string) => {
    onChange(paths.filter((p) => p.id !== id));
  };

  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-[#22272B]">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-gray-500 dark:text-white/60" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Adaptive Paths</h3>
        </div>
        <button
          onClick={handleAddPath}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#E40000] bg-[#E40000]/10 rounded-lg hover:bg-[#E40000]/20 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Path
        </button>
      </div>

      <div className="p-5">
        {paths.length === 0 ? (
          <div className="text-center py-8">
            <GitBranch className="w-8 h-8 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-2" />
            <p className="text-sm text-gray-400 dark:text-white/40">No adaptive paths configured</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-1">
              Add paths to route students based on performance
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paths.map((path) => (
              <div
                key={path.id}
                onMouseEnter={() => setHoveredPath(path.id)}
                onMouseLeave={() => setHoveredPath(null)}
                className={`relative p-4 rounded-lg border transition-colors ${
                  hoveredPath === path.id
                    ? 'border-gray-300 dark:border-[#333] bg-gray-100 dark:bg-[#22272B]/50'
                    : 'border-gray-200 dark:border-[#22272B] bg-gray-100 dark:bg-[#22272B]/30'
                }`}
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemovePath(path.id)}
                  className={`absolute top-3 right-3 text-gray-400 dark:text-gray-300 dark:text-white/20 hover:text-red-400 transition-all ${
                    hoveredPath === path.id ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* From Difficulty */}
                <div className="mb-3">
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40 mb-1.5">
                    When question difficulty is
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={path.fromDifficulty}
                      onChange={(e) =>
                        handleUpdatePath(path.id, 'fromDifficulty', Number(e.target.value))
                      }
                      className="px-3 py-1.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:border-[#E40000]/50 appearance-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5].map((d) => (
                        <option key={d} value={d} className="bg-gray-100 dark:bg-[#22272B]">
                          {d} - {DIFFICULTY_LABELS[d]}
                        </option>
                      ))}
                    </select>
                    <DifficultyBadge level={path.fromDifficulty} />
                  </div>
                </div>

                {/* Branching paths */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Correct path */}
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs font-medium text-green-400">If Correct</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-green-400/50" />
                      <span className="text-[10px] text-gray-400 dark:text-white/40">Go to:</span>
                      <select
                        value={path.correctTarget}
                        onChange={(e) =>
                          handleUpdatePath(path.id, 'correctTarget', Number(e.target.value))
                        }
                        className="px-2 py-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded text-xs text-gray-900 dark:text-white outline-none focus:border-green-500/50 appearance-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5].map((d) => (
                          <option key={d} value={d} className="bg-gray-100 dark:bg-[#22272B]">
                            {d} - {DIFFICULTY_LABELS[d]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Incorrect path */}
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-1.5 mb-2">
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs font-medium text-red-400">If Wrong</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-red-400/50" />
                      <span className="text-[10px] text-gray-400 dark:text-white/40">Go to:</span>
                      <select
                        value={path.incorrectTarget}
                        onChange={(e) =>
                          handleUpdatePath(path.id, 'incorrectTarget', Number(e.target.value))
                        }
                        className="px-2 py-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded text-xs text-gray-900 dark:text-white outline-none focus:border-red-500/50 appearance-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5].map((d) => (
                          <option key={d} value={d} className="bg-gray-100 dark:bg-[#22272B]">
                            {d} - {DIFFICULTY_LABELS[d]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdaptivePathEditor;
