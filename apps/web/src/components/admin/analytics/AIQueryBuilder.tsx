import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Play,
  Loader2,
  Sparkles,
  Table,
  AlertCircle,
  Clock,
  Database,
} from 'lucide-react';
import adminAnalyticsService, {
  type NLQueryResult,
  type QueryExample,
} from '../../../services/admin/adminAnalyticsService';
import ChartRenderer from './ChartRenderer';

const AIQueryBuilder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NLQueryResult | null>(null);
  const [examples, setExamples] = useState<QueryExample[]>([]);
  const [showExamples, setShowExamples] = useState(false);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const loadExamples = useCallback(async () => {
    try {
      const data = await adminAnalyticsService.getAvailableQueries();
      setExamples(data);
      setShowExamples(true);
    } catch {
      // Fallback examples
      setExamples([
        { query: 'Total users by role', description: 'Count users grouped by role' },
        { query: 'Revenue by gateway', description: 'Revenue grouped by payment gateway' },
        { query: 'Top courses', description: 'Top 10 courses by enrollment' },
        { query: 'New registrations this month', description: 'Daily signups this month' },
        { query: 'Enrollment breakdown', description: 'Enrollment status distribution' },
        { query: 'Students per grade', description: 'Student count by grade level' },
      ]);
      setShowExamples(true);
    }
  }, []);

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await adminAnalyticsService.submitCustomQuery(query.trim());
      setResult(data);
      if (data.chart_config) setViewMode('chart');
      else setViewMode('table');
    } catch (err) {
      setResult({
        query,
        sql_generated: null,
        results: [],
        chart_config: null,
        row_count: 0,
        execution_time_ms: 0,
        error: err instanceof Error ? err.message : 'Query failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (q: string) => {
    setQuery(q);
    setShowExamples(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Query input */}
      <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-4">
        <label className="text-xs text-gray-400 font-medium mb-2 block">
          Ask a question about your data
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => !showExamples && examples.length === 0 && loadExamples()}
              placeholder="e.g. Total users by role, Revenue by gateway, Top courses..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0F1112] border border-[#22272B] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E40000]/50 transition-colors"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E40000] hover:bg-[#C00] text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Query
          </button>
        </div>

        {/* Example chips */}
        <AnimatePresence>
          {showExamples && examples.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-gray-500 mt-1" />
              {examples.map((ex) => (
                <button
                  key={ex.query}
                  onClick={() => handleExampleClick(ex.query)}
                  title={ex.description}
                  className="px-3 py-1 text-xs bg-[#0F1112] border border-[#22272B] rounded-full text-gray-400 hover:text-white hover:border-[#E40000]/50 transition-colors"
                >
                  {ex.query}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden"
          >
            {/* Result header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#22272B]">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-300">
                  {result.row_count} row{result.row_count !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {result.execution_time_ms.toFixed(0)}ms
                </span>
              </div>
              {result.chart_config && result.results.length > 0 && (
                <div className="flex items-center gap-1 bg-[#0F1112] rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('chart')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      viewMode === 'chart'
                        ? 'bg-[#E40000] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Chart
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      viewMode === 'table'
                        ? 'bg-[#E40000] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Table
                  </button>
                </div>
              )}
            </div>

            {/* Error state */}
            {result.error && (
              <div className="flex items-start gap-3 p-4">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-400 font-medium">Query Error</p>
                  <p className="text-xs text-gray-400 mt-1">{result.error}</p>
                </div>
              </div>
            )}

            {/* Chart view */}
            {!result.error && viewMode === 'chart' && result.chart_config && result.results.length > 0 && (
              <div className="p-4">
                <ChartRenderer
                  data={result.results}
                  config={result.chart_config}
                />
              </div>
            )}

            {/* Table view */}
            {!result.error && (viewMode === 'table' || !result.chart_config) && result.results.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#22272B]">
                      {Object.keys(result.results[0]).map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#22272B]">
                    {result.results.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#0F1112]/50">
                        {Object.values(row).map((val, vIdx) => (
                          <td
                            key={vIdx}
                            className="px-4 py-2 text-gray-300 whitespace-nowrap"
                          >
                            {val === null || val === undefined
                              ? '—'
                              : typeof val === 'number'
                                ? val.toLocaleString()
                                : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SQL preview */}
            {result.sql_generated && (
              <div className="px-4 py-3 border-t border-[#22272B]">
                <details className="group">
                  <summary className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                    <Table className="w-3 h-3" />
                    View generated SQL
                  </summary>
                  <pre className="mt-2 p-3 bg-[#0F1112] rounded-lg text-xs text-gray-400 overflow-x-auto font-mono">
                    {result.sql_generated}
                  </pre>
                </details>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIQueryBuilder;
