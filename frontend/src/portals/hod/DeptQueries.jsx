import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { queriesApi } from '../../api/queries.api';
import { StatusBadge, PriorityBadge } from '../../components/query/Badges';
import { formatDate } from '../../lib/format';
import { EmptyState, Spinner } from '../../components/ui/Feedback';
import { FileText, ArrowRight, User } from 'lucide-react';

export function HodDeptQueries() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['hod_queries', statusFilter],
    queryFn: () => queriesApi.getAllQueries(statusFilter === 'all' ? {} : { status: statusFilter }),
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
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Department Queries Registry</h2>
          <p className="text-xs text-slate-400 mt-1">Full triage list of all queries within your department scope</p>
        </div>
        <input
          type="text"
          placeholder="Search by student, subject, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {['all', 'pending', 'assigned', 'in_progress', 'resolved', 'closed', 'escalated'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              statusFilter === s
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filteredQueries.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No queries found"
          description="There are no queries matching the selected filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredQueries.map((q) => (
            <Link
              key={q.id}
              to={`/instructor/queries/${q.id}`}
              className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.005] block group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">#{q.id}</span>
                  <StatusBadge status={q.status} />
                  <PriorityBadge priority={q.priority} />
                  {q.course_code && (
                    <span className="text-xs bg-slate-800 text-indigo-300 font-bold px-2 py-0.5 rounded">
                      {q.course_code}
                    </span>
                  )}
                  {q.needs_review && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-1.5 py-0.5 rounded">
                      Needs Review
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">{formatDate(q.created_at)}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                {q.subject || q.text.slice(0, 60)}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 mt-1">{q.text}</p>

              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Student: <strong className="text-slate-300">{q.student_name}</strong>
                  {q.current_route && (
                    <span className="text-slate-500 ml-2">
                      • Assigned: {q.current_route.assigned_name || 'Staff'}
                    </span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  View Detail <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
