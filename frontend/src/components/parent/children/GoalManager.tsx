/**
 * Goal Manager Component
 *
 * CRUD interface for family goals with progress tracking.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Check, Target,
  TrendingUp, BookOpen, Heart, Zap
} from 'lucide-react';
import type { FamilyGoalResponse, FamilyGoalCreate, FamilyGoalUpdate } from '../../../types/parent';
import { createGoal, updateGoal, deleteGoal } from '../../../services/parentChildrenService';

interface GoalManagerProps {
  goals: FamilyGoalResponse[];
  childId?: string;
  onGoalsChange: () => void;
}

const GoalManager: React.FC<GoalManagerProps> = ({ goals, childId, onGoalsChange }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<FamilyGoalCreate>>({
    title: '',
    description: '',
    category: 'academic',
    progress_percentage: 0,
  });

  const categoryIcons: Record<string, React.ReactNode> = {
    academic: <BookOpen className="w-4 h-4" />,
    behavioral: <Heart className="w-4 h-4" />,
    creative: <Zap className="w-4 h-4" />,
    health: <TrendingUp className="w-4 h-4" />,
  };

  const categoryColors: Record<string, string> = {
    academic: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
    behavioral: 'bg-green-500/20 text-green-500 border-green-500/50',
    creative: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
    health: 'bg-orange-500/20 text-orange-500 border-orange-500/50',
  };

  const handleCreate = async () => {
    if (!formData.title) return;

    try {
      await createGoal({
        ...formData as FamilyGoalCreate,
        child_id: childId,
      });
      setFormData({
        title: '',
        description: '',
        category: 'academic',
        progress_percentage: 0,
      });
      setIsCreating(false);
      onGoalsChange();
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleUpdate = async (goalId: string, updates: FamilyGoalUpdate) => {
    try {
      await updateGoal(goalId, updates);
      setEditingId(null);
      onGoalsChange();
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Delete this goal?')) return;

    try {
      await deleteGoal(goalId);
      onGoalsChange();
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-blue-500/20 text-blue-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#E40000]" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Goals</h3>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-[#E40000] text-gray-900 dark:text-white text-sm rounded-lg hover:bg-[#FF0000] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4"
        >
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Create New Goal</h4>

          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="text-xs text-gray-700 dark:text-white/80 mb-1 block">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Master multiplication tables"
                className="w-full p-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#E40000]/50"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-gray-700 dark:text-white/80 mb-1 block">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {['academic', 'behavioral', 'creative', 'health'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                      formData.category === cat
                        ? categoryColors[cat]
                        : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 border-gray-200 dark:border-[#22272B] hover:border-[#E40000]/30'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {categoryIcons[cat]}
                      <span>{cat}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-gray-700 dark:text-white/80 mb-1 block">Description (optional)</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details about this goal..."
                className="w-full p-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#E40000]/50"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!formData.title}
                className="flex-1 py-2 bg-[#E40000] text-gray-900 dark:text-white text-sm rounded-lg hover:bg-[#FF0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Goal
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setFormData({
                    title: '',
                    description: '',
                    category: 'academic',
                    progress_percentage: 0,
                  });
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-8 text-center">
          <Target className="w-12 h-12 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-white/60">No goals yet. Create your first goal!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4"
            >
              {/* Goal Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs rounded border ${categoryColors[goal.category]}`}>
                      {categoryIcons[goal.category]}
                      <span className="ml-1">{goal.category}</span>
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{goal.title}</h4>
                  {goal.description && (
                    <p className="text-xs text-gray-500 dark:text-white/60 mt-1">{goal.description}</p>
                  )}
                  {goal.child_name && (
                    <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Child: {goal.child_name}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingId(goal.id)}
                    className="p-1.5 bg-gray-100 dark:bg-[#22272B] rounded hover:bg-[#2A2E33] transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-700 dark:text-white/80" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 bg-gray-100 dark:bg-[#22272B] rounded hover:bg-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-700 dark:text-white/80" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-white/60">Progress</span>
                  <span className="text-xs font-semibold text-[#E40000]">
                    {goal.progress_percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#22272B] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#E40000] to-[#FF0000] h-2 rounded-full transition-all"
                    style={{ width: `${goal.progress_percentage}%` }}
                  />
                </div>
              </div>

              {/* Quick Update Progress */}
              {editingId !== goal.id && goal.status === 'active' && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleUpdate(goal.id, {
                        progress_percentage: Math.min(100, goal.progress_percentage + 10),
                      })
                    }
                    className="flex-1 py-1.5 bg-gray-100 dark:bg-[#22272B] text-gray-700 dark:text-white/80 text-xs rounded hover:bg-[#2A2E33] transition-colors"
                  >
                    +10%
                  </button>
                  <button
                    onClick={() =>
                      handleUpdate(goal.id, {
                        progress_percentage: Math.min(100, goal.progress_percentage + 25),
                      })
                    }
                    className="flex-1 py-1.5 bg-gray-100 dark:bg-[#22272B] text-gray-700 dark:text-white/80 text-xs rounded hover:bg-[#2A2E33] transition-colors"
                  >
                    +25%
                  </button>
                  {goal.progress_percentage < 100 && (
                    <button
                      onClick={() =>
                        handleUpdate(goal.id, {
                          progress_percentage: 100,
                          status: 'completed',
                        })
                      }
                      className="flex-1 py-1.5 bg-green-500/20 text-green-500 text-xs rounded hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Complete
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalManager;
