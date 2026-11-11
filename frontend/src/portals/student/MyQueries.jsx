import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { queriesApi } from '../../api/queries.api';
import { StatusBadge, PriorityBadge } from '../../components/query/Badges';
import { formatDate } from '../../lib/format';
import { EmptyState, CardSkeleton } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/Button';
import { Inbox, PlusCircle, ArrowRight, MessageSquare } from 'lucide-react';

export function MyQueries() {
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['my_queries'],
    queryFn: queriesApi.getMyQueries,
    refetchInterval: 20000, // Near-real-time refetching per doc 11.2
  });

  const filteredQueries = queries.filter((q) => {
    if (statusFilter === 'all') return true;
    return q.status === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100">My Submitted Queries</h2>
            <p className="text-xs text-slate-400 mt-1">Track live progress, department assignments, and instructor replies</p>
          </div>
        </div>
        <CardSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">My Submitted Queries</h2>
          <p className="text-xs text-slate-400 mt-1">Track live progress, department assignments, and instructor replies</p>
        </div>
        <Link to="/student/submit">
          <Button variant="primary" icon={PlusCircle}>New Query</Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-950/70 rounded-xl border border-slate-800/80">
        {['all', 'pending', 'assigned', 'in_progress', 'resolved', 'closed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all duration-150 cursor-pointer ${
              statusFilter === s
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xs shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filteredQueries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No queries found"
          description={statusFilter === 'all' ? "You haven't submitted any queries yet." : `No queries currently with status '${statusFilter}'.`}
          action={
            <Link to="/student/submit">
              <Button size="sm">Submit Query</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredQueries.map((q) => (
            <Link
              key={q.id}
              to={`/student/queries/${q.id}`}
              className="glass-panel p-4 sm:p-5 rounded-xl border border-slate-800/90 hover:border-slate-700 hover-lift block text-left group focus-ring"
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

              <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                {q.subject || q.text.slice(0, 60)}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mt-1 leading-relaxed">{q.text}</p>

              <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  {q.replies.length} {q.replies.length === 1 ? 'response' : 'responses'}
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                  View Thread <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
