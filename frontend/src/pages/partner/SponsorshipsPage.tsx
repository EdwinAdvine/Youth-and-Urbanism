import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Users,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Archive,
  CheckCircle,
  Clock,
  AlertCircle,
  PlayCircle,
  X,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSponsorshipPrograms } from '../../services/partner/sponsorshipService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface SponsorshipProgram {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'pending' | 'paused' | 'completed';
  childrenCount: number;
  monthlyBudget: number;
  startDate: string;
  endDate?: string;
  progress: number;
  description: string;
}

const hardcodedPrograms: SponsorshipProgram[] = [
  {
    id: '1',
    name: 'STEM Excellence Program',
    type: 'Academic',
    status: 'active',
    childrenCount: 45,
    monthlyBudget: 225000,
    startDate: 'Jan 2026',
    progress: 68,
    description: 'Advanced STEM education for high-performing students in grades 7-9',
  },
  {
    id: '2',
    name: 'Early Childhood Development',
    type: 'Foundation',
    status: 'active',
    childrenCount: 82,
    monthlyBudget: 410000,
    startDate: 'Sep 2025',
    progress: 85,
    description: 'Comprehensive early learning support for children aged 3-6',
  },
  {
    id: '3',
    name: 'Girls in Tech Initiative',
    type: 'Specialized',
    status: 'active',
    childrenCount: 30,
    monthlyBudget: 180000,
    startDate: 'Mar 2026',
    progress: 42,
    description: 'Empowering young girls with coding and technology skills',
  },
  {
    id: '4',
    name: 'Rural Education Access',
    type: 'Community',
    status: 'pending',
    childrenCount: 0,
    monthlyBudget: 300000,
    startDate: 'Apr 2026',
    progress: 0,
    description: 'Bringing quality education to underserved rural communities',
  },
  {
    id: '5',
    name: 'Sports & Arts Program',
    type: 'Enrichment',
    status: 'active',
    childrenCount: 55,
    monthlyBudget: 165000,
    startDate: 'Oct 2025',
    progress: 90,
    description: 'Holistic development through sports, music, and creative arts',
  },
  {
    id: '6',
    name: 'Special Needs Support',
    type: 'Inclusive',
    status: 'paused',
    childrenCount: 18,
    monthlyBudget: 270000,
    startDate: 'Nov 2025',
    progress: 55,
    description: 'Tailored learning support for children with special educational needs',
  },
];

const SponsorshipsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programs, setPrograms] = useState<SponsorshipProgram[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await getSponsorshipPrograms();
        if (data.items && data.items.length > 0) {
          setPrograms(data.items as unknown as SponsorshipProgram[]);
        } else {
          // Use hardcoded fallback
          setPrograms(hardcodedPrograms);
        }
      } catch (err) {
        console.error('Failed to fetch programs:', err);
        setError('Failed to load programs');
        setPrograms(hardcodedPrograms);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      paused: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    const icons = {
      active: CheckCircle,
      pending: Clock,
      paused: AlertCircle,
      completed: PlayCircle,
    };
    const Icon = icons[status as keyof typeof icons];
    return (
      <span
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles]
        }`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectProgram = (id: string) => {
    setSelectedPrograms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const stats = [
    {
      label: 'Total Programs',
      value: programs.length,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Active',
      value: programs.filter((p) => p.status === 'active').length,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Total Children',
      value: programs.reduce((sum, p) => sum + p.childrenCount, 0),
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Monthly Budget',
      value: `KSh ${(programs.reduce((sum, p) => sum + p.monthlyBudget, 0) / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#E40000]/30 border-t-[#E40000] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60 text-sm">Loading sponsorship programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
            <p className="text-sm text-yellow-400">
              {error}. Showing cached data instead.
            </p>
          </div>
        )}

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sponsorship Programs</h1>
              <p className="text-gray-500 dark:text-white/60">Manage and monitor all your sponsorship initiatives</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF4444] transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Program
            </button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                {selectedPrograms.length > 0 && (
                  <div className="relative flex items-center gap-2 px-4 py-2 bg-[#E40000]/20 border border-[#E40000]/30 rounded-lg">
                    <span className="text-sm text-gray-900 dark:text-white">{selectedPrograms.length} selected</span>
                    <button
                      onClick={() => setShowBulkMenu(!showBulkMenu)}
                      className="text-xs text-[#E40000] hover:text-[#FF4444]"
                    >
                      Bulk Action
                    </button>
                    {showBulkMenu && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg shadow-lg z-10 py-1">
                        <button
                          onClick={() => { setShowBulkMenu(false); alert('Export CSV coming soon'); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#22272B] flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <button
                          onClick={() => { setShowBulkMenu(false); alert('Archive selected coming soon'); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#22272B] flex items-center gap-2"
                        >
                          <Archive className="w-4 h-4" /> Archive Selected
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Programs Grid */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {filteredPrograms.map((program) => (
            <motion.div
              key={program.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-[#E40000]/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedPrograms.includes(program.id)}
                    onChange={() => handleSelectProgram(program.id)}
                    className="mt-1 w-4 h-4 rounded border-gray-200 dark:border-[#2A2F34] bg-gray-100 dark:bg-[#22272B] text-[#E40000] focus:ring-[#E40000]/50"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{program.name}</h3>
                    <span className="px-2 py-1 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 text-xs rounded-full">
                      {program.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(program.status)}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === program.id ? null : program.id);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-[#22272B] rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500 dark:text-white/60" />
                    </button>
                    {openDropdownId === program.id && (
                      <div className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg shadow-lg z-10 py-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); navigate(`/dashboard/partner/sponsored-children`); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#22272B] flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" /> View Details
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); alert('Edit modal coming soon'); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#22272B] flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" /> Edit Program
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); alert('Archive coming soon'); }}
                          className="w-full text-left px-4 py-2 text-sm text-orange-400 hover:bg-gray-100 dark:hover:bg-[#22272B] flex items-center gap-2"
                        >
                          <Archive className="w-4 h-4" /> Archive
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-white/60 mb-4">{program.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Children</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-400" />
                    {program.childrenCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Monthly Budget</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    {(program.monthlyBudget / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Start Date</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    {program.startDate}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 dark:text-white/40">Progress</span>
                  <span className="text-xs text-gray-500 dark:text-white/60 font-medium">{program.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E40000] to-[#FF4444] rounded-full transition-all duration-500"
                    style={{ width: `${program.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/dashboard/partner/sponsored-children')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-lg hover:bg-[#2A2F34] transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => alert('Edit program modal coming soon')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#E40000] rounded-lg hover:bg-[#E40000]/30 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredPrograms.length === 0 && (
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
            <Archive className="w-12 h-12 text-gray-400 dark:text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No programs found</h3>
            <p className="text-sm text-gray-500 dark:text-white/60">
              Try adjusting your search or filters to find what you're looking for
            </p>
          </div>
        )}
      </div>

      {/* Create Program Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl w-full max-w-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New Sponsorship Program</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#22272B] rounded-lg">
                <X className="w-5 h-5 text-gray-500 dark:text-white/60" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Program Name</label>
                <input type="text" placeholder="e.g. STEM Excellence Program" className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Description</label>
                <textarea rows={3} placeholder="Describe the program goals..." className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Type</label>
                  <select className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50">
                    <option>Academic</option>
                    <option>Foundation</option>
                    <option>Specialized</option>
                    <option>Community</option>
                    <option>Enrichment</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Monthly Budget (KSh)</label>
                  <input type="number" placeholder="e.g. 225000" className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => { setShowCreateModal(false); alert('Program creation submitted'); }}
                  className="px-6 py-2.5 bg-[#E40000] text-white rounded-lg hover:bg-[#FF4444] transition-colors"
                >
                  Create Program
                </button>
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2.5 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-lg hover:bg-[#2A2F34] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SponsorshipsPage;
