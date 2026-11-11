import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queriesApi } from '../../api/queries.api';
import { QueryThread } from '../../components/query/QueryThread';
import { StatusBadge, PriorityBadge } from '../../components/query/Badges';
import { Button } from '../../components/ui/Button';
import { Modal, Skeleton } from '../../components/ui/Feedback';
import { Textarea } from '../../components/ui/Input';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Tag,
  Calendar,
  MessageSquare,
  ShieldAlert,
  XCircle,
  Info,
} from 'lucide-react';

// ─── Utility helpers ────────────────────────────────────────────────────────

function InfoChip({ icon: Icon, label, value, accent = false }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-colors ${
      accent
        ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300'
        : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
    }`}>
      <Icon className={`w-3.5 h-3.5 shrink-0 ${accent ? 'text-indigo-400' : 'text-slate-400'}`} />
      <span className="text-slate-500 font-medium mr-0.5">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
      {children}
    </p>
  );
}

function StatusTimeline({ status }) {
  const steps = [
    { key: 'pending',     label: 'Submitted',   icon: Clock },
    { key: 'assigned',    label: 'Assigned',    icon: User },
    { key: 'in_progress', label: 'In Progress', icon: MessageSquare },
    { key: 'resolved',    label: 'Resolved',    icon: CheckCircle },
    { key: 'closed',      label: 'Closed',      icon: XCircle },
  ];

  const order = steps.map((s) => s.key);
  const currentIdx = order.indexOf(status);

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1 scrollbar-hide">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done   = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1 min-w-[52px]">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                active
                  ? 'bg-indigo-500 border-indigo-400 text-white shadow-md shadow-indigo-500/40'
                  : done
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-600'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[9px] font-semibold tracking-wide text-center leading-tight ${
                active ? 'text-indigo-300' : done ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 min-w-[16px] mb-3.5 transition-colors ${
                i < currentIdx ? 'bg-indigo-500/50' : 'bg-slate-800'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function QueryDetailSkeleton() {
  return (
    <div className="space-y-5 max-w-4xl mx-auto text-left animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="w-40 h-3.5" />
          <Skeleton className="w-72 h-5" />
        </div>
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>

      {/* Meta strip */}
      <div className="flex flex-wrap gap-2">
        {[88, 112, 96, 100].map((w) => (
          <Skeleton key={w} className={`w-${w === 88 ? 24 : w === 112 ? 28 : w === 96 ? 24 : 28} h-8 rounded-xl`} />
        ))}
      </div>

      {/* Timeline */}
      <Skeleton className="w-full h-14 rounded-2xl" />

      {/* Assignment card */}
      <Skeleton className="w-full h-16 rounded-xl" />

      {/* Thread card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
          <Skeleton className="w-20 h-4" />
        </div>
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-full h-16" />
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

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

  if (isLoading) return <QueryDetailSkeleton />;

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
          <Info className="w-7 h-7 text-slate-500" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-200">Query not found</h3>
          <p className="text-sm text-slate-500 mt-1">This query may have been removed or doesn&apos;t exist.</p>
        </div>
        <Button onClick={() => navigate('/student/queries')} icon={ArrowLeft}>
          Back to My Queries
        </Button>
      </div>
    );
  }

  const isClosed   = query.status === 'closed';
  const isResolved = query.status === 'resolved';
  const replyCount = query.replies?.length ?? 0;

  return (
    <div className="space-y-5 max-w-4xl mx-auto text-left animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={() => navigate('/student/queries')}
            className="mt-0.5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            {/* Breadcrumb row */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-500 tracking-wide">
                # {query.id}
              </span>
              <StatusBadge status={query.status} />
              <PriorityBadge priority={query.priority} />
              {isClosed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800/80 border border-slate-700/60 text-slate-500">
                  <XCircle className="w-3 h-3" /> Closed
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-100 leading-snug truncate">
              {query.subject}
            </h1>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isResolved && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAppealModalOpen(true)}
              icon={ShieldAlert}
            >
              Appeal
            </Button>
          )}
          {!isClosed && (
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

      {/* ── Meta info chips ──────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {query.category && (
          <InfoChip icon={Tag} label="Category" value={query.category} />
        )}
        {query.channel && (
          <InfoChip icon={MessageSquare} label="Channel" value={query.channel} accent />
        )}
        {query.created_at && (
          <InfoChip
            icon={Calendar}
            label="Submitted"
            value={new Date(query.created_at).toLocaleDateString('en-US', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          />
        )}
        {replyCount > 0 && (
          <InfoChip icon={MessageSquare} label="Replies" value={String(replyCount)} accent />
        )}
      </div>

      {/* ── Status Timeline ──────────────────────────────────────────── */}
      <div className="glass-panel px-5 py-4 rounded-2xl border border-slate-800/80">
        <SectionLabel>Progress</SectionLabel>
        <StatusTimeline status={query.status} />
      </div>

      {/* ── Assignment / Routing card ────────────────────────────────── */}
      {query.current_route && (
        <div className="relative overflow-hidden glass-panel px-5 py-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/10">
          {/* Accent stripe */}
          <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-l-2xl" />
          <div className="pl-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <SectionLabel>Current Assignee</SectionLabel>
              <p className="text-sm font-bold text-slate-100">
                {query.current_route.assigned_name || 'Department Staff'}
              </p>
              {query.current_route.reason && (
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {query.current_route.reason}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-semibold shrink-0">
              <Clock className="w-3.5 h-3.5" />
              Target SLA: 24 hrs
            </div>
          </div>
        </div>
      )}

      {/* ── Resolved banner ─────────────────────────────────────────── */}
      {isResolved && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-emerald-500/25 bg-emerald-950/15 text-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-300">Query Resolved</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Staff has marked this query as resolved. If you are unsatisfied, you may appeal to the Head of Department.
            </p>
          </div>
        </div>
      )}

      {/* ── Closed banner ───────────────────────────────────────────── */}
      {isClosed && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-slate-700/60 bg-slate-800/30 text-sm">
          <XCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-400">Query Closed</p>
            <p className="text-xs text-slate-500 mt-0.5">
              This query has been closed and is now archived.
            </p>
          </div>
        </div>
      )}

      {/* ── Query Thread ─────────────────────────────────────────────── */}
      <QueryThread query={query} replies={query.replies} />

      {/* ── Appeal Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={appealModalOpen}
        onClose={() => setAppealModalOpen(false)}
        title="Appeal Query Resolution"
      >
        <div className="space-y-4 text-left">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              If you are not satisfied with the staff resolution, you can appeal. This will escalate
              your query directly to the{' '}
              <span className="font-semibold text-amber-300">Head of Department (HOD)</span> for
              administrative review.
            </p>
          </div>

          <Textarea
            label="Reason for Appeal *"
            placeholder="Explain what was unresolved or why you are appealing..."
            value={appealReason}
            onChange={(e) => setAppealReason(e.target.value)}
            rows={4}
            required
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAppealModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!appealReason.trim()}
              isLoading={appealMutation.isPending}
              onClick={() => appealMutation.mutate()}
              icon={ShieldAlert}
            >
              Submit Appeal to HOD
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
