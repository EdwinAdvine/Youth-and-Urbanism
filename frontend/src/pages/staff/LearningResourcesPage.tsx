import React from 'react';
import { BookOpen, Video, FileText, ExternalLink } from 'lucide-react';

const LearningResourcesPage: React.FC = () => {
  const resources = [
    { id: '1', title: 'Effective Student Communication', type: 'video', duration: '15 min' },
    { id: '2', title: 'CBC Curriculum Guide 2024', type: 'document', pages: '45 pages' },
    { id: '3', title: 'Assessment Best Practices', type: 'article', readTime: '8 min' },
  ];

  return (
    <div className="min-h-screen bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Learning Resources</h1>

        <div className="grid gap-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5 hover:border-[#E40000]/30 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#22272B]">
                  {resource.type === 'video' && <Video className="w-5 h-5 text-blue-400" />}
                  {resource.type === 'document' && <FileText className="w-5 h-5 text-green-400" />}
                  {resource.type === 'article' && <BookOpen className="w-5 h-5 text-purple-400" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white">{resource.title}</h3>
                  <p className="text-sm text-white/40">
                    {resource.type === 'video' && resource.duration}
                    {resource.type === 'document' && resource.pages}
                    {resource.type === 'article' && resource.readTime}
                  </p>
                </div>
                <ExternalLink className="w-5 h-5 text-white/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningResourcesPage;
