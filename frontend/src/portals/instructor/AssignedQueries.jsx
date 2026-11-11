import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { queriesApi } from '../../api/queries.api';
import { StatusBadge, PriorityBadge } from '../../components/query/Badges';
import { formatDate } from '../../lib/format';
import { EmptyState, CardSkeleton } from '../../components/ui/Feedback';
import { CheckSquare, ArrowRight, User } from 'lucide-react';

export function InstructorAssignedQueries() {
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['assigned_queries'],
    queryFn: queriesApi.getAssignedQueries,
    refetchInterval: 20000,
  });

  const filteredQueries = queries.filter((q) => {
    if (priorityFilter === 'all') return true;
    return q.priority === priorityFilter;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Assigned Queries Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">Queries routed to your courses requiring triage and reply</p>
        </div>
        <CardSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Assigned Queries Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">Queries routed to your courses requiring triage and reply</p>
        </div>
      </div>

      {/* Priority Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-950/70 rounded-xl border border-slate-800/80">
        <span className="text-xs text-slate-400 font-semibold px-2.5">Priority:</span>
        {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all duration-150 cursor-pointer ${
              priorityFilter === p
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xs shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {filteredQueries.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="All caught up!"
          description="You have no pending or in-progress queries assigned to you."
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
                  {q.course_code && (
                    <span className="text-xs bg-indigo-500/10 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                      {q.course_code}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono">{formatDate(q.created_at)}</span>
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                {q.subject || q.text.slice(0, 70)}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mt-1 leading-relaxed">{q.text}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Student: <strong className="text-slate-200">{q.student_name}</strong>
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
