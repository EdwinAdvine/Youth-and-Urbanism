import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Video, FileText, ExternalLink, AlertCircle, GraduationCap } from 'lucide-react';
import { getLearningResources } from '@/services/staff/staffTeamService';
import type { LearningResource } from '@/services/staff/staffTeamService';

const LearningResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLearningResources();
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load learning resources');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const getIcon = (type: LearningResource['resource_type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-400" />;
      case 'document':
        return <FileText className="w-5 h-5 text-green-400" />;
      case 'article':
        return <BookOpen className="w-5 h-5 text-purple-400" />;
      case 'course':
        return <GraduationCap className="w-5 h-5 text-orange-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-purple-400" />;
    }
  };

  const getDurationLabel = (resource: LearningResource) => {
    if (resource.estimated_duration_minutes >= 60) {
      const hours = Math.floor(resource.estimated_duration_minutes / 60);
      const mins = resource.estimated_duration_minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${resource.estimated_duration_minutes} min`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-56 bg-white dark:bg-[#181C1F] rounded animate-pulse mb-6" />
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-lg text-gray-900 dark:text-white font-medium mb-2">Failed to load resources</p>
          <p className="text-sm text-gray-500 dark:text-white/50 mb-4">{error}</p>
          <button
            onClick={fetchResources}
            className="px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Learning Resources</h1>

        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-white/10 mb-4" />
            <p className="text-sm text-gray-500 dark:text-white/50">No learning resources available yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((resource) => (
              <div
                key={resource.id}
                onClick={() => window.open(resource.url, '_blank')}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 hover:border-[#E40000]/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-[#22272B]">
                    {getIcon(resource.resource_type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{resource.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-white/50 mt-0.5">{resource.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-400 dark:text-white/40 capitalize">
                        {resource.resource_type}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-white/40">
                        {getDurationLabel(resource)}
                      </span>
                      {resource.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {resource.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-[#22272B] text-gray-400 dark:text-white/40 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 dark:text-white/40 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningResourcesPage;
