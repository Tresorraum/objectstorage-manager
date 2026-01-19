import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { LogsResponse, ViewMode, AuditLog } from './types';
import PremiumUpsell from './PremiumUpsell';
import LogsHeader from './LogsHeader';
import LogsFilters from './LogsFilters';
import LogsTable from './LogsTable';
import LogsCards from './LogsCards';
import LogsPagination from './LogsPagination';
import LogDetailModal from './LogDetailModal';
import EmptyState from './EmptyState';

export default function ActivityLogs() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterResource, setFilterResource] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(true);

  const isPremium = user?.is_premium;

  const { data: logsData, isLoading, refetch, isFetching } = useQuery<LogsResponse>({
    queryKey: ['audit-logs', page, limit, searchQuery, filterAction, filterResource],
    queryFn: () => 
      api.get('/audit/logs', {
        params: {
          page,
          limit,
          query: searchQuery,
          action: filterAction,
          resource: filterResource,
        },
      }).then(res => res.data),
    enabled: isPremium,
    refetchInterval: 30000,
  });

  const handleExport = () => {
    toast.success('Exporting audit logs...');
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleActionChange = (value: string) => {
    setFilterAction(value);
    setPage(1);
  };

  const handleResourceChange = (value: string) => {
    setFilterResource(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterAction('all');
    setFilterResource('all');
    setPage(1);
  };

  const hasFilters = Boolean(searchQuery || filterAction !== 'all' || filterResource !== 'all');

  if (!isPremium) {
    return <PremiumUpsell />;
  }

  return (
    <div className="space-y-6">
      <LogsHeader
        totalLogs={logsData?.total || 0}
        isFetching={isFetching}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={() => refetch()}
        onExport={handleExport}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <LogsFilters
          searchQuery={searchQuery}
          filterAction={filterAction}
          filterResource={filterResource}
          limit={limit}
          showFilters={showFilters}
          onSearchChange={handleSearchChange}
          onActionChange={handleActionChange}
          onResourceChange={handleResourceChange}
          onLimitChange={handleLimitChange}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-sm text-gray-600">Loading activity logs...</p>
          </div>
        ) : logsData && logsData.logs.length > 0 ? (
          <>
            {viewMode === 'table' ? (
              <LogsTable logs={logsData.logs} onViewDetails={setSelectedLog} />
            ) : (
              <LogsCards logs={logsData.logs} onViewDetails={setSelectedLog} />
            )}

            <LogsPagination
              currentPage={page}
              totalPages={logsData.pages}
              totalItems={logsData.total}
              limit={limit}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
        )}
      </div>

      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
