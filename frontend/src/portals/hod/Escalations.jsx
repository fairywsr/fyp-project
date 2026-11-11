import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queriesApi } from '../../api/queries.api';
import { departmentsApi } from '../../api/academic.api';
import { useAuth } from '../../features/auth/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/query/Badges';
import { Button } from '../../components/ui/Button';
import { Modal, EmptyState, Spinner } from '../../components/ui/Feedback';
import { Select, Textarea } from '../../components/ui/Input';
import { formatDate } from '../../lib/format';
import { AlertTriangle, UserCheck, ArrowRight, Mail, User, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HodEscalations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [newPriority, setNewPriority] = useState('urgent');
  const [reason, setReason] = useState('');

  const { data: escalations = [], isLoading } = useQuery({
    queryKey: ['escalations'],
    queryFn: () => queriesApi.getAllQueries({ status: 'escalated' }),
    refetchInterval: 20000,
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['dept_instructors', user?.dept_id],
    queryFn: () => departmentsApi.getInstructors(user?.dept_id || 1),
    enabled: !!user?.dept_id,
  });

  const overrideMutation = useMutation({
    mutationFn: (data) => queriesApi.overrideQuery(selectedQuery.id, data),
    onSuccess: () => {
      setOverrideModalOpen(false);
      setSelectedQuery(null);
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      queryClient.invalidateQueries({ queryKey: ['hod_overview'] });
    },
  });

  const handleOpenOverride = (q) => {
    setSelectedQuery(q);
    setNewPriority(q.priority);
    setReason('HOD manual intervention and reassignment');
    setOverrideModalOpen(true);
  };

  const handleSaveOverride = () => {
    if (!reason.trim()) return;
    overrideMutation.mutate({
      assigned_to: newAssigneeId ? parseInt(newAssigneeId) : undefined,
      priority: newPriority,
      reason: reason.trim(),
    });
  };

  /* ── Loading ───────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Escalations &amp; SLA Breaches
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Queries exceeding the 24-hour SLA or appealed by students — requiring HOD intervention
          </p>
        </div>
        {escalations.length > 0 && (
          <span className="shrink-0 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
            {escalations.length} open
          </span>
        )}
      </div>

      {escalations.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No open escalations"
          description="All queries are within SLA. No pending appeals in your department."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {escalations.map((q) => (
            <EscalationCard
              key={q.id}
              query={q}
              onOverride={handleOpenOverride}
            />
          ))}
        </div>
      )}

      {/* Override Modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title={`Override Query #${selectedQuery?.id}`}
      >
        <div className="space-y-4 text-left">
          {/* Summary strip */}
          {selectedQuery && (
            <div className="px-3.5 py-2.5 rounded-lg bg-rose-500/8 border border-rose-500/20 text-xs text-rose-300">
              <strong>{selectedQuery.subject}</strong>
              <span className="text-rose-400/70 ml-2">— {selectedQuery.student_name}</span>
            </div>
          )}

          <Select
            label="Reassign To"
            value={newAssigneeId}
            onChange={(e) => setNewAssigneeId(e.target.value)}
          >
            <option value="">Keep / Assign to Myself (HOD)</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.full_name} ({inst.availability} · {inst.open_queries_count} open)
              </option>
            ))}
          </Select>

          <Select
            label="Adjust Priority"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
          >
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </Select>

          <Textarea
            label="Override Reason *  (recorded in audit log)"
            rows={3}
            placeholder="Explain why this query is being reassigned or escalated…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={overrideMutation.isPending}
              disabled={!reason.trim()}
              onClick={handleSaveOverride}
            >
              Apply Override
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Escalation card ────────────────────────────────────────── */
function EscalationCard({ query: q, onOverride }) {
  return (
    <div className="relative flex flex-col gap-3 p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 hover:bg-rose-950/15 transition-colors">
      {/* Left rose accent */}
      <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-rose-500" />

      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
            #{q.id}
          </span>
          <StatusBadge status={q.status} />
          <PriorityBadge priority={q.priority} />
          {q.course_code && (
            <span className="text-[11px] bg-indigo-500/10 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-500/20">
              {q.course_code}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-semibold whitespace-nowrap">
          <Clock className="w-3 h-3" />
          SLA overdue · {formatDate(q.created_at)}
        </span>
      </div>

      {/* Subject + body */}
      <div>
        <h3 className="text-sm font-bold text-slate-100 leading-snug">{q.subject}</h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{q.text}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-rose-500/15 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <strong className="text-slate-300">{q.student_name}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            {q.student_email}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/instructor/queries/${q.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            View Thread <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onOverride(q)}
            icon={UserCheck}
          >
            Override
          </Button>
        </div>
      </div>
    </div>
  );
}
