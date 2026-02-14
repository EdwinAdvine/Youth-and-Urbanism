import React, { useEffect, useState } from 'react';
import { Upload, Search, Filter, File, FileText, Image, Video, Sparkles, Download, Trash2 } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Resource {
  id: string;
  title: string;
  description: string;
  file_type: 'document' | 'image' | 'video' | 'audio' | 'other';
  file_url: string;
  file_size: number;
  course_id?: string;
  course_title?: string;
  downloads_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [typeFilter]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;

      const response = await axios.get(`${API_URL}/api/v1/instructor/resources`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setResources([
          {
            id: '1',
            title: 'Algebra Worksheet - Linear Equations',
            description: 'Practice problems for solving linear equations',
            file_type: 'document',
            file_url: '/files/algebra-worksheet.pdf',
            file_size: 524288,
            course_id: '1',
            course_title: 'Introduction to Mathematics - Grade 7',
            downloads_count: 45,
            views_count: 120,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            title: 'Geometry Diagrams',
            description: 'Visual reference for 2D and 3D shapes',
            file_type: 'image',
            file_url: '/files/geometry-diagrams.png',
            file_size: 1048576,
            course_id: '1',
            course_title: 'Introduction to Mathematics - Grade 7',
            downloads_count: 32,
            views_count: 95,
            created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            title: 'Writing Techniques Video',
            description: 'Tutorial on descriptive writing techniques',
            file_type: 'video',
            file_url: '/files/writing-tutorial.mp4',
            file_size: 15728640,
            course_id: '2',
            course_title: 'English Language & Literature',
            downloads_count: 18,
            views_count: 67,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } else {
        setResources(response.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/api/v1/instructor/resources`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('File uploaded successfully!');
      fetchResources();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/api/v1/instructor/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource');
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'image':
        return Image;
      case 'video':
        return Video;
      default:
        return File;
    }
  };

  const stats = {
    total: resources.length,
    totalDownloads: resources.reduce((sum, r) => sum + r.downloads_count, 0),
    totalViews: resources.reduce((sum, r) => sum + r.views_count, 0),
    totalSize: resources.reduce((sum, r) => sum + r.file_size, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Learning Resources"
        description="Upload and manage course materials, worksheets, and media files"
        icon={<File className="w-6 h-6 text-purple-400" />}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg transition-colors font-medium"
            >
              <Sparkles className="w-5 h-5" />
              AI Suggestions
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium cursor-pointer">
              <Upload className="w-5 h-5" />
              {uploading ? 'Uploading...' : 'Upload File'}
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.mp3"
              />
            </label>
          </div>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <File className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Total Resources</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <File className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatFileSize(stats.totalSize)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showAISuggestions && (
        <div className="bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-500/20 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Resource Suggestions
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-white/80">
                Consider creating a visual guide for the Geometry module - students respond well to
                diagrams and interactive visuals
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-white/80">
                Add practice worksheets for probability - this competency has low student
                comprehension scores
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-white/80">
                Upload video explanations for complex topics - video content has 3x higher
                engagement than text-only materials
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
            <span className="text-sm text-gray-500 dark:text-white/60">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All</option>
              <option value="document">Documents</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
          <File className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Resources Yet</h3>
          <p className="text-gray-500 dark:text-white/60 mb-6">
            {searchQuery
              ? 'No resources match your search criteria'
              : 'Upload your first learning resource to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredResources.map((resource) => {
            const FileIcon = getFileIcon(resource.file_type);
            return (
              <div
                key={resource.id}
                className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <FileIcon className="w-6 h-6 text-purple-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{resource.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-white/60 mb-2">{resource.description}</p>
                    <div className="flex items-center gap-4 flex-wrap text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                      <span>{resource.course_title || 'No course'}</span>
                      <span>•</span>
                      <span>{formatFileSize(resource.file_size)}</span>
                      <span>•</span>
                      <span>{resource.downloads_count} downloads</span>
                      <span>•</span>
                      <span>{resource.views_count} views</span>
                      <span>•</span>
                      <span>Uploaded {format(new Date(resource.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={resource.file_url}
                      download
                      className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
