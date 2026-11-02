import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queriesApi } from '../../api/queries.api';
import { QueryThread } from '../../components/query/QueryThread';
import { StatusBadge, PriorityBadge } from '../../components/query/Badges';
import { Button } from '../../components/ui/Button';
import { Modal, Spinner } from '../../components/ui/Feedback';
import { Textarea } from '../../components/ui/Input';
import { ArrowLeft, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function StudentQueryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealReason, setAppealReason] = useState('');

  // Polling query detail every 20 seconds as specified in Section 11.2
  const { data: query, isLoading } = useQuery({
    queryKey: ['query_detail', id],
    queryFn: () => queriesApi.getQueryDetail(id),
    refetchInterval: 20000,
  });

  const appealMutation = useMutation({
    mutationFn: () => queriesApi.appealQuery(id, { reason: appealReason }),
    onSuccess: () => {
      setAppealModalOpen(false);
      setAppealReason('');
      queryClient.invalidateQueries({ queryKey: ['query_detail', id] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => queriesApi.closeQuery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['query_detail', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-12">
        <h3 className="text-base font-bold text-slate-200">Query not found</h3>
        <Button className="mt-4" onClick={() => navigate('/student/queries')}>Back to My Queries</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/queries')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">Query #{query.id}</span>
              <StatusBadge status={query.status} />
              <PriorityBadge priority={query.priority} />
            </div>
            <h1 className="text-lg font-bold text-slate-100 mt-1">{query.subject}</h1>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {query.status === 'resolved' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAppealModalOpen(true)}
              icon={AlertTriangle}
            >
              Appeal Resolution
            </Button>
          )}

          {query.status !== 'closed' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => closeMutation.mutate()}
              isLoading={closeMutation.isPending}
              icon={CheckCircle}
            >
              Close Query
            </Button>
          )}
        </div>
      </div>

      {/* Assignment / Routing summary card */}
      {query.current_route && (
        <div className="p-4 glass-panel rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Current Assignee</span>
            <span className="text-slate-200 font-bold text-sm">{query.current_route.assigned_name || 'Department Staff'}</span>
            <span className="block text-[11px] text-slate-400 mt-0.5">{query.current_route.reason}</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-400">
            <Clock className="w-4 h-4" />
            <span>Target SLA: 24 Hours</span>
          </div>
        </div>
      )}

      {/* Query thread */}
      <QueryThread query={query} replies={query.replies} />

      {/* Appeal Modal */}
      <Modal
        isOpen={appealModalOpen}
        onClose={() => setAppealModalOpen(false)}
        title="Appeal Query Resolution"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-400">
            If you are not satisfied with the staff resolution, you can appeal. This will escalate your query directly to the Head of Department (HOD) for administrative review.
          </p>
          <Textarea
            label="Reason for Appeal *"
            placeholder="Explain what was unresolved or why you are appealing..."
            value={appealReason}
            onChange={(e) => setAppealReason(e.target.value)}
            rows={4}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAppealModalOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={!appealReason.trim()}
              isLoading={appealMutation.isPending}
              onClick={() => appealMutation.mutate()}
            >
              Submit Appeal to HOD
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
