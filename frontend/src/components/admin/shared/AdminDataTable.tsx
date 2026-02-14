import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Loader2,
} from 'lucide-react';
import AdminEmptyState from './AdminEmptyState';

interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  onClick: (selectedIds: string[]) => void;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange?: (sort: { field: string; direction: 'asc' | 'desc' } | null) => void;
  onSearchChange?: (search: string) => void;
  onRowSelect?: (selectedRows: T[]) => void;
  isLoading?: boolean;
  searchPlaceholder?: string;
  enableSearch?: boolean;
  enableExport?: boolean;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  bulkActions?: BulkAction[];
  emptyTitle?: string;
  emptyDescription?: string;
  getRowId?: (row: T) => string;
}

function AdminDataTable<T>({
  data,
  columns,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSearchChange,
  isLoading = false,
  searchPlaceholder = 'Search...',
  enableSearch = true,
  enableExport = false,
  onExport,
  bulkActions,
  emptyTitle = 'No data found',
  emptyDescription = 'Try adjusting your search or filters.',
  getRowId,
}: AdminDataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchValue, setSearchValue] = useState('');

  const totalPages = Math.ceil(totalCount / pageSize);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      if (onSortChange) {
        if (newSorting.length > 0) {
          onSortChange({
            field: newSorting[0].id,
            direction: newSorting[0].desc ? 'desc' : 'asc',
          });
        } else {
          onSortChange(null);
        }
      }
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: totalPages,
    enableRowSelection: !!bulkActions,
    getRowId: getRowId as ((row: T) => string) | undefined,
  });

  const selectedRowIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
  const hasSelection = selectedRowIds.length > 0;

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-b border-[#22272B]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {enableSearch && (
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg
                  text-white placeholder-white/40 focus:outline-none focus:border-[#E40000]/50 focus:ring-1 focus:ring-[#E40000]/30"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {enableExport && onExport && (
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white/60 bg-[#22272B] rounded-lg hover:text-white hover:bg-[#2a2f34] transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <div className="absolute right-0 top-full mt-1 bg-[#22272B] border border-[#333] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {['csv', 'excel', 'pdf'].map((format) => (
                  <button
                    key={format}
                    onClick={() => onExport(format as 'csv' | 'excel' | 'pdf')}
                    className="block w-full px-4 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 first:rounded-t-lg last:rounded-b-lg"
                  >
                    Export as {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {hasSelection && bulkActions && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#E40000]/10 border-b border-[#E40000]/20">
          <span className="text-xs font-medium text-[#FF4444]">
            {selectedRowIds.length} selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => action.onClick(selectedRowIds)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                  ${action.variant === 'danger'
                    ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                    : 'text-white/70 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setRowSelection({})}
            className="ml-auto text-xs text-white/40 hover:text-white/60"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[#22272B]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        className={`flex items-center gap-1.5 ${
                          header.column.getCanSort() ? 'cursor-pointer hover:text-white/80' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <>
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-40" />
                            )}
                          </>
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
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
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <AdminEmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`
                    border-b border-[#22272B] last:border-0 transition-colors
                    ${row.getIsSelected() ? 'bg-[#E40000]/5' : 'hover:bg-white/[0.02]'}
                  `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-white/80">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#22272B]">
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span>
            Showing {Math.min((page - 1) * pageSize + 1, totalCount)}–{Math.min(page * pageSize, totalCount)} of {totalCount}
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-[#22272B] border border-[#333] text-white/70 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#E40000]/50"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>

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
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
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
              );
            })}
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
    </div>
  );
}

export default AdminDataTable;
