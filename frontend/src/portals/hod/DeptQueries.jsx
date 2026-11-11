import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { queriesApi } from '../../api/queries.api';
import { StatusBadge, PriorityBadge } from '../../components/query/Badges';
import { formatDate } from '../../lib/format';
import { EmptyState, CardSkeleton } from '../../components/ui/Feedback';
import { FileText, ArrowRight, User, Search, SlidersHorizontal } from 'lucide-react';

const STATUS_FILTERS = ['all', 'pending', 'assigned', 'in_progress', 'resolved', 'closed', 'escalated'];

export function HodDeptQueries() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['hod_queries', statusFilter],
    queryFn: () =>
      queriesApi.getAllQueries(statusFilter === 'all' ? {} : { status: statusFilter }),
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

  /* ── Loading skeleton ───────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <CardSkeleton count={5} />
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* Header + search */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader count={filteredQueries.length} total={queries.length} />

        {/* Search input */}
        <div className="relative w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student, subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/70 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400/60 transition-all"
          />
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1.5">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <div className="flex items-center gap-1 overflow-x-auto">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all duration-150 cursor-pointer border ${
                statusFilter === s
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Query list */}
      {filteredQueries.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No queries found"
          description="No queries match the selected filter or search term."
        />
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredQueries.map((q) => (
            <QueryRow key={q.id} query={q} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function PageHeader({ count, total }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 tracking-tight">
        Department Query Registry
      </h2>
      <p className="text-xs text-slate-500 mt-0.5">
        {count !== undefined
          ? `${count}${count !== total ? ` of ${total}` : ''} queries`
          : 'Full triage list across all department courses'}
      </p>
    </div>
  );
}

function QueryRow({ query: q }) {
  return (
    <Link
      to={`/instructor/queries/${q.id}`}
      className="group relative flex flex-col gap-2.5 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
          {q.needs_review && (
            <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full">
              Needs Review
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
          {formatDate(q.created_at)}
        </span>
      </div>

      {/* Subject + excerpt */}
      <div>
        <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug">
          {q.subject || q.text.slice(0, 70)}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{q.text}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/70 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          Student:{' '}
          <strong className="text-slate-300 font-semibold ml-0.5">{q.student_name}</strong>
          {q.current_route?.assigned_name && (
            <span className="text-slate-600 ml-2 font-mono">
              · Staff: {q.current_route.assigned_name}
            </span>
          )}
        </span>
        <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
          View Detail <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Hover accent */}
      <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}
