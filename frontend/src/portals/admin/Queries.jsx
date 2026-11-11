import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { queriesApi } from '../../api/queries.api';
import { departmentsApi } from '../../api/academic.api';
import { StatusBadge, PriorityBadge } from '../../components/query/Badges';
import { formatDate } from '../../lib/format';
import { EmptyState, CardSkeleton } from '../../components/ui/Feedback';
import { Select } from '../../components/ui/Input';
import { FileText, ArrowRight, User, Search } from 'lucide-react';

export function AdminQueries() {
  const [status, setStatus] = useState('');
  const [deptId, setDeptId] = useState('');
  const [search, setSearch] = useState('');

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['admin_all_queries', status, deptId],
    queryFn: () =>
      queriesApi.getAllQueries({
        ...(status ? { status } : {}),
        ...(deptId ? { dept_id: deptId } : {}),
      }),
    refetchInterval: 20000,
  });

  const filteredQueries = queries.filter((q) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (q.subject && q.subject.toLowerCase().includes(term)) ||
      (q.text && q.text.toLowerCase().includes(term)) ||
      (q.student_name && q.student_name.toLowerCase().includes(term))
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">All System Queries</h2>
          <p className="text-xs text-slate-400 mt-1">Cross-portal audit and triage of all student, email, and WhatsApp queries</p>
        </div>
        <CardSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">All System Queries</h2>
          <p className="text-xs text-slate-400 mt-1">Cross-portal audit and triage of all student, email, and WhatsApp queries</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by keyword or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 w-full transition-all"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-48">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
            <option value="closed">Closed</option>
          </Select>
        </div>

        <div className="w-56">
          <Select value={deptId} onChange={(e) => setDeptId(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {filteredQueries.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No queries found"
          description="No queries match the selected filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredQueries.map((q) => (
            <Link
              key={q.id}
              to={`/instructor/queries/${q.id}`}
              className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-slate-700 hover-lift block group focus-ring text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-700/50">
                    #{q.id}
                  </span>
                  <StatusBadge status={q.status} />
                  <PriorityBadge priority={q.priority} />
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase font-semibold border border-slate-700/50">
                    via {q.channel}
                  </span>
                  {q.course_code && (
                    <span className="text-xs bg-indigo-500/10 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                      {q.course_code}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono">{formatDate(q.created_at)}</span>
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                {q.subject || q.text.slice(0, 60)}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mt-1 leading-relaxed">{q.text}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Student: <strong className="text-slate-200">{q.student_name}</strong>
                  {q.current_route && (
                    <span className="text-slate-400 ml-2 font-mono">
                      • Routed to: {q.current_route.assigned_name || 'Staff'} ({q.current_route.method})
                    </span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Inspect Query <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
