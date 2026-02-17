/**
 * Partner Shared Components - Usage Examples
 *
 * This file demonstrates how to use all 10 partner shared components
 * Copy and adapt these examples for your partner dashboard pages
 */

import React, { useState } from 'react';
import {
  PartnerStatsCard,
  PartnerPageHeader,
  PartnerBentoCard,
  PartnerDataTable,
  PartnerFilterBar,
  PartnerChart,
  PartnerModal,
  PartnerBadge,
  PartnerEmptyState,
  PartnerLoadingSkeleton,
} from './index';
import {
  Users,
  DollarSign,
  Heart,
  TrendingUp,
  Plus,
  Download,
  Edit,
  Trash2,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

// Example data types
interface Sponsorship {
  id: string;
  studentName: string;
  grade: string;
  amount: number;
  status: 'active' | 'pending' | 'inactive';
  startDate: string;
}

export const PartnerComponentExamples: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, _setIsLoading] = useState(false);

  // Example data
  const sponsorships: Sponsorship[] = [
    {
      id: '1',
      studentName: 'Jane Doe',
      grade: 'Grade 5',
      amount: 5000,
      status: 'active',
      startDate: '2025-01-15',
    },
    {
      id: '2',
      studentName: 'John Smith',
      grade: 'Grade 7',
      amount: 7500,
      status: 'pending',
      startDate: '2025-02-01',
    },
  ];

  const chartData = [
    { month: 'Jan', amount: 15000 },
    { month: 'Feb', amount: 22500 },
    { month: 'Mar', amount: 30000 },
    { month: 'Apr', amount: 27500 },
  ];

  // Table columns
  const columns: ColumnDef<Sponsorship>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student Name',
    },
    {
      accessorKey: 'grade',
      header: 'Grade',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `KES ${row.original.amount.toLocaleString()}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <PartnerBadge variant={row.original.status} dot>
          {row.original.status}
        </PartnerBadge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row: _row }) => (
        <div className="flex items-center gap-2">
          <button className="p-1 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-500 dark:text-white/60 hover:text-red-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Filter config
  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Inactive', value: 'inactive' },
      ],
      value: '',
    },
    {
      key: 'grade',
      label: 'Grade',
      options: [
        { label: 'Grade 1-3', value: '1-3' },
        { label: 'Grade 4-6', value: '4-6' },
        { label: 'Grade 7-9', value: '7-9' },
      ],
      value: '',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* 1. Page Header */}
      <PartnerPageHeader
        title="Sponsorships Dashboard"
        subtitle="Manage and track your student sponsorships"
        breadcrumbs={[{ label: 'Sponsorships' }]}
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-[#22272B] text-gray-700 dark:text-white/80 rounded-lg hover:bg-[#2a2f34] transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#CC0000] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Sponsorship
            </button>
          </>
        }
      />

      {/* 2. Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PartnerStatsCard
          title="Active Sponsorships"
          value={42}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 12.5, label: 'vs last month', direction: 'up' }}
          subtitle="Currently active"
        />
        <PartnerStatsCard
          title="Total Contribution"
          value="KES 315,000"
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 8.2, label: 'vs last month', direction: 'up' }}
        />
        <PartnerStatsCard
          title="Students Impacted"
          value={156}
          icon={<Heart className="w-5 h-5" />}
          trend={{ value: 15.3, label: 'all time', direction: 'up' }}
        />
        <PartnerStatsCard
          title="Avg. Sponsorship"
          value="KES 7,500"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 0, label: 'no change', direction: 'neutral' }}
        />
      </div>

      {/* 3. Loading Skeleton Example */}
      {isLoading && <PartnerLoadingSkeleton variant="stats-row" count={4} />}

      {/* 4. BentoCard with Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PartnerBentoCard
          title="Contribution Trends"
          icon={<TrendingUp className="w-4 h-4" />}
          colSpan={2}
        >
          <PartnerChart
            type="area"
            data={chartData}
            dataKeys={[{ key: 'amount', name: 'Contribution', color: '#E40000' }]}
            xAxisKey="month"
            height={250}
            showGrid
            showTooltip
          />
        </PartnerBentoCard>
      </div>

      {/* 5. Filter Bar */}
      <PartnerFilterBar
        filters={filters}
        onFilterChange={(key, value) => console.log(`Filter ${key}:`, value)}
        onClearAll={() => console.log('Cleared all filters')}
      />

      {/* 6. Data Table */}
      <PartnerDataTable
        data={sponsorships}
        columns={columns}
        totalCount={sponsorships.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        enableSearch
        enableExport
        searchPlaceholder="Search sponsorships..."
        onExport={(format) => console.log('Export as:', format)}
        bulkActions={[
          {
            label: 'Delete Selected',
            icon: <Trash2 className="w-3.5 h-3.5" />,
            variant: 'danger',
            onClick: (ids) => console.log('Delete:', ids),
          },
        ]}
        getRowId={(row) => row.id}
      />

      {/* 7. Empty State Example */}
      {sponsorships.length === 0 && (
        <PartnerEmptyState
          icon={<Heart className="w-10 h-10" />}
          title="No sponsorships yet"
          description="Start making a difference by sponsoring a student today."
          action={
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#CC0000] transition-colors"
            >
              Create Your First Sponsorship
            </button>
          }
        />
      )}

      {/* 8. Modal Example */}
      <PartnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Sponsorship"
        subtitle="Create a sponsorship for a student"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 text-sm bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#CC0000] transition-colors">
              Create Sponsorship
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
              Student Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#E40000]/50"
              placeholder="Enter student name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
              Sponsorship Amount
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#E40000]/50"
              placeholder="Enter amount in KES"
            />
          </div>
        </div>
      </PartnerModal>

      {/* 9. Badge Examples */}
      <div className="flex items-center gap-2 flex-wrap">
        <PartnerBadge variant="active" dot>Active</PartnerBadge>
        <PartnerBadge variant="pending" dot>Pending</PartnerBadge>
        <PartnerBadge variant="inactive" dot>Inactive</PartnerBadge>
        <PartnerBadge variant="success">Completed</PartnerBadge>
        <PartnerBadge variant="warning">Expiring Soon</PartnerBadge>
        <PartnerBadge variant="critical" size="md">Urgent</PartnerBadge>
      </div>

      {/* 10. Different Chart Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PartnerBentoCard title="Bar Chart Example">
          <PartnerChart
            type="bar"
            data={chartData}
            dataKeys={[{ key: 'amount', name: 'Amount' }]}
            xAxisKey="month"
            height={200}
          />
        </PartnerBentoCard>

        <PartnerBentoCard title="Line Chart Example">
          <PartnerChart
            type="line"
            data={chartData}
            dataKeys={[{ key: 'amount', name: 'Amount', color: '#E40000' }]}
            xAxisKey="month"
            height={200}
          />
        </PartnerBentoCard>

        <PartnerBentoCard title="Pie Chart Example">
          <PartnerChart
            type="pie"
            data={[
              { name: 'Active', value: 30 },
              { name: 'Pending', value: 15 },
              { name: 'Inactive', value: 5 },
            ]}
            dataKeys={[{ key: 'value' }]}
            xAxisKey="name"
            height={200}
            showLegend
          />
        </PartnerBentoCard>
      </div>
    </div>
  );
};

export default PartnerComponentExamples;
