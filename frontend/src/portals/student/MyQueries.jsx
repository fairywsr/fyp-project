import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { queriesApi } from "../../api/queries.api";
import { StatusBadge, PriorityBadge } from "../../components/query/Badges";
import { formatDate } from "../../lib/format";
import { EmptyState, CardSkeleton } from "../../components/ui/Feedback";
import { Button } from "../../components/ui/Button";
import {
  Inbox,
  PlusCircle,
  ArrowRight,
  MessageSquare,
  Clock3,
  ClipboardList,
  Sparkles,
  Search,
  ChevronRight,
} from "lucide-react";

export function MyQueries() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ["my_queries"],
    queryFn: queriesApi.getMyQueries,
    refetchInterval: 20000,
  });

  const filteredQueries = queries.filter((q) => {
    if (statusFilter === "all") return true;
    return q.status === statusFilter;
  });

  const filters = [
    "all",
    "pending",
    "assigned",
    "in_progress",
    "resolved",
    "closed",
  ];

  const getCount = (status) => {
    if (status === "all") return queries.length;
    return queries.filter((q) => q.status === status).length;
  };

  if (isLoading) {
    return (
      <div className="space-y-7 text-left">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-52 bg-slate-800 rounded-lg" />
          <div className="h-4 w-72 bg-slate-800/70 rounded-lg" />
        </div>
        <CardSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-7 text-left">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 p-5 sm:p-7">
        <div className="absolute -top-20 -right-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-52 h-52 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-indigo-400" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400">
                Student Dashboard
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              My Submitted Queries
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg leading-relaxed">
              Keep track of your academic inquiries, monitor their progress, and
              stay updated with faculty responses.
            </p>
          </div>

          <Link to="/student/submit" className="relative shrink-0">
            <Button variant="primary" icon={PlusCircle}>
              New Query
            </Button>
          </Link>
        </div>

        {/* Overview stats */}
        <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-3 mt-7">
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Total Queries
              </span>
              <ClipboardList className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2 tabular-nums">
              {queries.length}
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Pending
              </span>
              <Clock3 className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2 tabular-nums">
              {getCount("pending")}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl bg-white/[0.04] border border-white/[0.07] p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Resolved
              </span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2 tabular-nums">
              {getCount("resolved")}
            </p>
          </div>
        </div>
      </div>

      {/* Query list section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Your Inquiries
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Monitor and manage your submitted requests
            </p>
          </div>

          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/70 border border-slate-700/70 px-3 py-1.5 rounded-lg">
            {filteredQueries.length} Results
          </span>
        </div>

        {/* Filter tabs */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="inline-flex min-w-full sm:min-w-0 items-center gap-1.5 p-1.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
            {filters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  statusFilter === s
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                }`}
              >
                <span className="capitalize">{s.replace("_", " ")}</span>

                <span
                  className={`text-[10px] min-w-5 h-5 px-1 flex items-center justify-center rounded-md ${
                    statusFilter === s
                      ? "bg-white/15 text-white"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {getCount(s)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Query cards */}
        {filteredQueries.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-slate-800/80 p-8 sm:p-12">
            <EmptyState
              icon={Inbox}
              title="No queries found"
              description={
                statusFilter === "all"
                  ? "You haven't submitted any queries yet."
                  : `No queries currently with status '${statusFilter}'.`
              }
              action={
                <Link to="/student/submit">
                  <Button size="sm" icon={PlusCircle}>
                    Submit Query
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredQueries.map((q) => (
              <Link
                key={q.id}
                to={`/student/queries/${q.id}`}
                className="group relative block overflow-hidden glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800/90 hover:border-indigo-500/40 hover:bg-indigo-500/[0.025] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-950/20 focus-ring"
              >
                {/* Hover accent */}
                <div className="absolute top-0 left-0 w-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-500" />

                {/* Top metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                      <ClipboardList className="w-3 h-3" />#{q.id}
                    </span>

                    <StatusBadge status={q.status} />
                    <PriorityBadge priority={q.priority} />

                    {q.course_code && (
                      <span className="text-[10px] bg-purple-500/10 text-purple-300 font-bold px-2.5 py-1 rounded-lg border border-purple-500/20">
                        {q.course_code}
                      </span>
                    )}
                  </div>

                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Clock3 className="w-3.5 h-3.5" />
                    {formatDate(q.created_at)}
                  </span>
                </div>

                {/* Query content */}
                <div className="mt-4">
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug">
                    {q.subject || q.text.slice(0, 60)}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mt-2 leading-relaxed max-w-4xl">
                    {q.text}
                  </p>
                </div>

                {/* Bottom metadata */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/70 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/70 flex items-center justify-center">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    </span>

                    <span>
                      <span className="font-semibold text-slate-200">
                        {q.replies.length}
                      </span>{" "}
                      {q.replies.length === 1 ? "response" : "responses"}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-2 text-[11px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    View Conversation
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="flex items-center justify-center gap-2 py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-[10px] text-slate-500">
          Query status automatically refreshes every 20 seconds
        </p>
      </div>
    </div>
  );
}
