/**
 * Support & Questions Page
 *
 * Two-tab layout for Help Articles and Support Tickets.
 * Includes article search, expandable content, ticket creation
 * modal, status filtering, and ticket detail with message thread.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, ArrowLeft, Search, Plus, ChevronDown, ChevronUp,
  Tag, Clock, CheckCircle, AlertCircle, X, Send, MessageSquare,
  Loader2,
} from 'lucide-react';
import {
  getSupportArticles,
  getSupportTickets,
  createSupportTicket,
  addTicketMessage,
} from '../../services/parentCommunicationsService';
import type {
  SupportArticlesResponse,
  SupportTicketsListResponse,
  SupportTicketResponse,
  CreateSupportTicketRequest,
} from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

type MainTab = 'articles' | 'tickets';
type TicketStatusFilter = 'all' | 'open' | 'pending' | 'resolved';

const TICKET_STATUS_FILTERS: { key: TicketStatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'pending', label: 'Pending' },
  { key: 'resolved', label: 'Resolved' },
];

const TICKET_CATEGORIES = ['technical', 'billing', 'content', 'account', 'other'];

/* ------------------------------------------------------------------ */
/* Helper: status badge                                               */
/* ------------------------------------------------------------------ */
function statusBadge(status: string) {
  const map: Record<string, { color: string; icon: React.ReactNode }> = {
    open: { color: 'bg-blue-500/20 text-blue-400', icon: <AlertCircle className="w-3 h-3" /> },
    in_progress: { color: 'bg-yellow-500/20 text-yellow-400', icon: <Loader2 className="w-3 h-3" /> },
    waiting_response: { color: 'bg-orange-500/20 text-orange-400', icon: <Clock className="w-3 h-3" /> },
    pending: { color: 'bg-orange-500/20 text-orange-400', icon: <Clock className="w-3 h-3" /> },
    resolved: { color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
    closed: { color: 'bg-gray-500/20 text-gray-400', icon: <CheckCircle className="w-3 h-3" /> },
  };
  const entry = map[status] || map['open'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded font-medium ${entry.color}`}>
      {entry.icon}
      {status.replace('_', ' ')}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Helper: category badge                                             */
/* ------------------------------------------------------------------ */
function categoryBadge(category: string) {
  const colors: Record<string, string> = {
    technical: 'bg-purple-500/20 text-purple-400',
    billing: 'bg-green-500/20 text-green-400',
    content: 'bg-blue-500/20 text-blue-400',
    account: 'bg-yellow-500/20 text-yellow-400',
    other: 'bg-gray-500/20 text-gray-400',
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded capitalize ${colors[category] || colors['other']}`}>
      {category}
    </span>
  );
}

/* ================================================================== */
/* Component                                                          */
/* ================================================================== */

const SupportPage: React.FC = () => {
  const navigate = useNavigate();

  /* ---- state ---- */
  const [mainTab, setMainTab] = useState<MainTab>('articles');
  const [loading, setLoading] = useState(true);

  // Articles
  const [articlesData, setArticlesData] = useState<SupportArticlesResponse | null>(null);
  const [articleSearch, setArticleSearch] = useState('');
  const [articleCategory, setArticleCategory] = useState('');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  // Tickets
  const [ticketsData, setTicketsData] = useState<SupportTicketsListResponse | null>(null);
  const [ticketStatusFilter, setTicketStatusFilter] = useState<TicketStatusFilter>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketResponse | null>(null);
  const [ticketMessageText, setTicketMessageText] = useState('');
  const [sendingTicketMsg, setSendingTicketMsg] = useState(false);

  // Create ticket modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState<CreateSupportTicketRequest>({
    title: '',
    description: '',
    category: 'technical',
    priority: 'normal',
  });
  const [creating, setCreating] = useState(false);

  /* ---- load articles ---- */
  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (articleSearch) params.search = articleSearch;
      if (articleCategory) params.category = articleCategory;
      const data = await getSupportArticles(params);
      setArticlesData(data);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  }, [articleSearch, articleCategory]);

  /* ---- load tickets ---- */
  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const status = ticketStatusFilter === 'all' ? undefined : ticketStatusFilter;
      const data = await getSupportTickets(status);
      setTicketsData(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [ticketStatusFilter]);

  /* ---- effects ---- */
  useEffect(() => {
    if (mainTab === 'articles') {
      loadArticles();
    } else {
      loadTickets();
    }
  }, [mainTab, loadArticles, loadTickets]);

  /* ---- create ticket ---- */
  const handleCreateTicket = async () => {
    if (!newTicket.title.trim() || !newTicket.description.trim() || creating) return;
    try {
      setCreating(true);
      await createSupportTicket(newTicket);
      setShowCreateModal(false);
      setNewTicket({ title: '', description: '', category: 'technical', priority: 'normal' });
      loadTickets();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    } finally {
      setCreating(false);
    }
  };

  /* ---- add ticket message ---- */
  const handleAddTicketMessage = async () => {
    if (!ticketMessageText.trim() || !selectedTicket || sendingTicketMsg) return;
    try {
      setSendingTicketMsg(true);
      await addTicketMessage(selectedTicket.id, ticketMessageText.trim());
      setTicketMessageText('');
      // Reload tickets to refresh messages
      loadTickets();
      setSelectedTicket(null);
    } catch (error) {
      console.error('Failed to add ticket message:', error);
    } finally {
      setSendingTicketMsg(false);
    }
  };

  /* ---- loading state ---- */
  if (loading && !articlesData && !ticketsData) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard/parent')}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support &amp; Questions</h1>
              <p className="text-gray-500 dark:text-white/60 mt-1">Find answers or get help from our team</p>
            </div>
          </div>
        </motion.div>

        {/* Main Tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#22272B] rounded-xl p-1">
            <button
              onClick={() => setMainTab('articles')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                mainTab === 'articles'
                  ? 'bg-[#E40000] text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Help Articles
            </button>
            <button
              onClick={() => setMainTab('tickets')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                mainTab === 'tickets'
                  ? 'bg-[#E40000] text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Support Tickets
              {ticketsData && ticketsData.open_count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] bg-gray-200 dark:bg-white/20 text-gray-900 dark:text-white text-[10px] font-bold rounded-full px-1">
                  {ticketsData.open_count}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* ================================================================ */}
        {/* ARTICLES TAB                                                     */}
        {/* ================================================================ */}
        {mainTab === 'articles' && (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
            {/* Search + Category Filter */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                <input
                  type="text"
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  placeholder="Search help articles..."
                  className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E40000]"
                />
              </div>
              <select
                value={articleCategory}
                onChange={(e) => setArticleCategory(e.target.value)}
                className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E40000] appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {(articlesData?.categories || []).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Article List */}
            {articlesData && articlesData.articles.length > 0 ? (
              articlesData.articles.map((article) => (
                <motion.div
                  key={article.id}
                  variants={fadeUp}
                  className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedArticle(
                        expandedArticle === article.id ? null : article.id
                      )
                    }
                    className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-[#2A2E33] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{article.title}</h4>
                        {categoryBadge(article.category)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-white/60 line-clamp-2">{article.summary}</p>
                    </div>
                    {expandedArticle === article.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 dark:text-white/40 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 dark:text-white/40 flex-shrink-0 mt-1" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedArticle === article.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-[#181C1F]">
                          <div className="pt-4 text-sm text-gray-600 dark:text-white/70 leading-relaxed whitespace-pre-wrap">
                            {article.content}
                          </div>
                          {article.tags.length > 0 && (
                            <div className="flex items-center gap-2 mt-4 flex-wrap">
                              <Tag className="w-3 h-3 text-gray-400 dark:text-white/30" />
                              {article.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-white dark:bg-[#181C1F] text-gray-500 dark:text-white/50 text-[10px] rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div variants={fadeUp}>
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
                  <HelpCircle className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
                  <p className="text-gray-500 dark:text-white/60 text-sm">
                    Try adjusting your search or category filter.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* TICKETS TAB                                                      */}
        {/* ================================================================ */}
        {mainTab === 'tickets' && (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
            {/* Create Button + Status Filter */}
            <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {TICKET_STATUS_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setTicketStatusFilter(f.key)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      ticketStatusFilter === f.key
                        ? 'bg-[#E40000] text-gray-900 dark:text-white'
                        : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-[#2A2E33]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#E40000] text-gray-900 dark:text-white text-sm rounded-lg hover:bg-[#c00000] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Ticket
              </button>
            </motion.div>

            {/* Ticket List */}
            {ticketsData && ticketsData.tickets.length > 0 ? (
              ticketsData.tickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  variants={fadeUp}
                  onClick={() =>
                    setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)
                  }
                  className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 cursor-pointer hover:bg-[#2A2E33] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.title}</h4>
                        {statusBadge(ticket.status)}
                        {categoryBadge(ticket.category)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-white/50 line-clamp-1 mb-2">{ticket.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 dark:text-white/30">
                          Created {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-white/30">
                          Updated {new Date(ticket.updated_at).toLocaleDateString()}
                        </span>
                        {ticket.messages.length > 0 && (
                          <span className="text-[10px] text-gray-400 dark:text-white/40 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {ticket.messages.length}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedTicket?.id === ticket.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 dark:text-white/40 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 dark:text-white/40 flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Expanded Ticket Detail */}
                  <AnimatePresence>
                    {selectedTicket?.id === ticket.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="mt-4 pt-4 border-t border-[#181C1F] space-y-3">
                          {/* Full description */}
                          <p className="text-sm text-gray-600 dark:text-white/70 whitespace-pre-wrap">
                            {ticket.description}
                          </p>

                          {/* Message thread */}
                          {ticket.messages.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase">
                                Messages
                              </h5>
                              {ticket.messages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className={`p-3 rounded-lg text-sm ${
                                    msg.is_staff_response
                                      ? 'bg-blue-500/10 border border-blue-500/20'
                                      : 'bg-white dark:bg-[#181C1F] border border-[#181C1F]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-gray-600 dark:text-white/70">
                                      {msg.sender.full_name}
                                    </span>
                                    {msg.is_staff_response && (
                                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                        Staff
                                      </span>
                                    )}
                                    <span className="text-[10px] text-gray-400 dark:text-white/30 ml-auto">
                                      {new Date(msg.created_at).toLocaleString([], {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-gray-500 dark:text-white/60">{msg.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add message */}
                          {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                            <div className="flex items-end gap-2 pt-2">
                              <textarea
                                value={ticketMessageText}
                                onChange={(e) => setTicketMessageText(e.target.value)}
                                placeholder="Add a message..."
                                rows={2}
                                className="flex-1 bg-white dark:bg-[#181C1F] border border-[#181C1F] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-[#E40000]"
                              />
                              <button
                                onClick={handleAddTicketMessage}
                                disabled={!ticketMessageText.trim() || sendingTicketMsg}
                                className="w-9 h-9 flex items-center justify-center bg-[#E40000] rounded-lg text-gray-900 dark:text-white transition-colors hover:bg-[#c00000] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                              >
                                {sendingTicketMsg ? (
                                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div variants={fadeUp}>
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
                  <HelpCircle className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No support tickets</h3>
                  <p className="text-gray-500 dark:text-white/60 text-sm mb-4">
                    Create a ticket if you need help from our support team.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#E40000] text-gray-900 dark:text-white text-sm rounded-lg hover:bg-[#c00000] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Ticket
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* CREATE TICKET MODAL                                              */}
        {/* ================================================================ */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-2xl w-full max-w-lg p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Support Ticket</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    placeholder="Brief summary of your issue..."
                    className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E40000]"
                  />
                </div>

                {/* Category + Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Category</label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E40000] appearance-none cursor-pointer"
                    >
                      {TICKET_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Priority</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                      className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E40000] appearance-none cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Description</label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Describe your issue in detail (minimum 20 characters)..."
                    rows={4}
                    className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-[#E40000]"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTicket}
                    disabled={
                      !newTicket.title.trim() ||
                      newTicket.description.trim().length < 20 ||
                      creating
                    }
                    className="flex items-center gap-2 px-5 py-2 bg-[#E40000] text-gray-900 dark:text-white text-sm rounded-lg hover:bg-[#c00000] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {creating ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SupportPage;
