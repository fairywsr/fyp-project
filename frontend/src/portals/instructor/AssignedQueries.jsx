import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { queriesApi } from '../../api/queries.api';
import { StatusBadge, PriorityBadge } from '../../components/query/Badges';
import { formatDate } from '../../lib/format';
import { EmptyState, Spinner } from '../../components/ui/Feedback';
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
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Assigned Queries Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">Queries routed to your courses requiring triage and reply</p>
        </div>
      </div>

      {/* Priority Filters */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mr-2">Filter Priority:</span>
        {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              priorityFilter === p
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
              className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.005] block group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">#{q.id}</span>
                  <StatusBadge status={q.status} />
                  <PriorityBadge priority={q.priority} />
                  {q.course_code && (
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                      {q.course_code}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">{formatDate(q.created_at)}</span>
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                {q.subject || q.text.slice(0, 70)}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 mt-1">{q.text}</p>

              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Student: <strong className="text-slate-300">{q.student_name}</strong>
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
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
