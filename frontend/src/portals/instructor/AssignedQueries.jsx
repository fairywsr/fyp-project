import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { queriesApi } from '../../api/queries.api';
import { StatusBadge, PriorityBadge } from '../../components/query/Badges';
import { formatDate } from '../../lib/format';
import { EmptyState, CardSkeleton } from '../../components/ui/Feedback';
import { CheckSquare, ArrowRight, User, Filter } from 'lucide-react';

const PRIORITIES = ['all', 'urgent', 'high', 'medium', 'low'];

const priorityAccent = {
  urgent: 'text-red-400 bg-red-500/10 border-red-500/25',
  high:   'text-orange-400 bg-orange-500/10 border-orange-500/25',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
  low:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  all:    '',
};

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

  /* ── Loading skeleton ───────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <CardSkeleton count={4} />
      </div>
    );
  }

  /* ── Main render ────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <PageHeader count={filteredQueries.length} total={queries.length} />

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-1">
        <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
          Priority
        </span>
        <div className="flex items-center gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 cursor-pointer border ${
                priorityFilter === p
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Query list */}
      {filteredQueries.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="All caught up!"
          description="No queries match the selected filter. Enjoy the quiet!"
        />
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredQueries.map((q) => (
            <QueryCard key={q.id} query={q} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function PageHeader({ count, total }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          Assigned Queries
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Queries routed to your courses — triage and respond below
        </p>
      </div>
      {total !== undefined && (
        <div className="text-right">
          <span className="text-2xl font-bold text-indigo-400">{count}</span>
          <span className="text-xs text-slate-500 block">
            {count === total ? 'total' : `of ${total}`}
          </span>
        </div>
      )}
    </div>
  );
}

function QueryCard({ query: q }) {
  return (
    <Link
      to={`/instructor/queries/${q.id}`}
      className="group relative flex flex-col gap-3 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      {/* Top row: id + badges + date */}
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
        <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
          {formatDate(q.created_at)}
        </span>
      </div>

      {/* Subject */}
      <div>
        <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug">
          {q.subject || q.text.slice(0, 80)}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
          {q.text}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/70 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>
            Student:{' '}
            <strong className="text-slate-300 font-semibold">
              {q.student_name}
            </strong>
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
          Open Workspace <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Hover left accent bar */}
      <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}
