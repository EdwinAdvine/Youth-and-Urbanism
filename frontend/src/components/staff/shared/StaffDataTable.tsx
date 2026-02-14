import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Loader2,
} from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface StaffDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

function StaffDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  total,
  page = 1,
  pageSize = 10,
  onPageChange,
  onSort,
  sortKey,
  sortDirection,
  isLoading = false,
  emptyMessage = 'No data found',
  onRowClick,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
}: StaffDataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const currentSearch = searchValue ?? internalSearch;

  const totalCount = total ?? data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearch(value);
    }
  };

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDirection: 'asc' | 'desc' =
      sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const renderSortIcon = (columnKey: string, isSortable?: boolean) => {
    if (!isSortable || !onSort) return null;
    if (sortKey === columnKey) {
      return sortDirection === 'asc' ? (
        <ArrowUp className="w-3 h-3" />
      ) : (
        <ArrowDown className="w-3 h-3" />
      );
    }
    return <ArrowUpDown className="w-3 h-3 opacity-40" />;
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 3) {
      for (let i = 1; i <= maxVisible; i++) pages.push(i);
    } else if (page >= totalPages - 2) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = page - 2; i <= page + 2; i++) pages.push(i);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
      {/* Search Toolbar */}
      {onSearchChange && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#22272B]">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg
                text-white placeholder-white/40 focus:outline-none focus:border-[#E40000]/50 focus:ring-1 focus:ring-[#E40000]/30"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="bg-[#22272B]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.sortable && onSort ? (
                    <button
                      className="flex items-center gap-1.5 cursor-pointer hover:text-white/80 transition-colors"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.header}
                      {renderSortIcon(col.key, col.sortable)}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-16">
                  <div className="flex flex-col items-center justify-center text-white/40">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    <span className="text-sm">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16">
                  <div className="flex flex-col items-center justify-center text-white/40">
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`
                    border-b border-[#22272B] last:border-0 transition-colors
                    ${rowIdx % 2 === 1 ? 'bg-white/[0.01]' : ''}
                    ${onRowClick ? 'cursor-pointer hover:bg-white/[0.04]' : 'hover:bg-white/[0.02]'}
                  `}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm text-white/80"
                    >
                      {col.render
                        ? col.render(item)
                        : String(item[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#22272B]">
          <span className="text-xs text-white/50">
            Showing {Math.min((page - 1) * pageSize + 1, totalCount)}
            &ndash;
            {Math.min(page * pageSize, totalCount)} of {totalCount}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-0.5 mx-2">
              {pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`
                    min-w-[2rem] h-8 text-xs font-medium rounded transition-colors
                    ${page === pageNum
                      ? 'bg-[#E40000] text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
              className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDataTable;
