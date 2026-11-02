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
import { AlertTriangle, UserCheck, ArrowRight } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Escalated Queries & SLA Breaches</h2>
        <p className="text-xs text-slate-400 mt-1">
          Queries exceeding the 24-hour SLA or appealed by students requiring departmental override or reassignment
        </p>
      </div>

      {escalations.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No open escalations"
          description="Great job! There are currently no SLA breaches or pending appeals in your department."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {escalations.map((q) => (
            <div
              key={q.id}
              className="glass-panel p-5 rounded-xl border border-rose-500/30 bg-rose-950/10 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">Query #{q.id}</span>
                  <StatusBadge status={q.status} />
                  <PriorityBadge priority={q.priority} />
                  {q.course_code && (
                    <span className="text-xs bg-slate-800 text-indigo-300 font-bold px-2 py-0.5 rounded">
                      {q.course_code}
                    </span>
                  )}
                </div>
                <span className="text-xs text-rose-400 font-semibold">SLA Overdue ({formatDate(q.created_at)})</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">{q.subject}</h3>
                <p className="text-xs text-slate-400 mt-1">{q.text}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">
                  Student: <strong className="text-slate-200">{q.student_name}</strong> ({q.student_email})
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/instructor/queries/${q.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors inline-flex items-center gap-1"
                  >
                    View Thread <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenOverride(q)}
                    icon={UserCheck}
                  >
                    Reassign / Override
                  </Button>
                </div>
              </div>
            </div>
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
          <Select
            label="Reassign To Faculty Member"
            value={newAssigneeId}
            onChange={(e) => setNewAssigneeId(e.target.value)}
          >
            <option value="">Keep / Assign to Myself (HOD)</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.full_name} ({inst.availability} • {inst.open_queries_count} open)
              </option>
            ))}
          </Select>

          <Select
            label="Adjust Priority"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>

          <Textarea
            label="Override Reason (Recorded in Audit Log) *"
            rows={3}
            placeholder="Explain why this query is being reassigned or escalated..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOverrideModalOpen(false)}>Cancel</Button>
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
