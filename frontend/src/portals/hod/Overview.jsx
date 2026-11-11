import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/misc.api';
import { KpiSkeleton } from '../../components/ui/Feedback';
import {
  LayoutDashboard,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const KPI_DEFS = (stats) => [
  {
    label: 'Open Queries',
    sublabel: 'Across all courses',
    value: stats?.open_queries ?? 0,
    icon: LayoutDashboard,
    iconBg: 'bg-indigo-500/15 border-indigo-500/25',
    iconColor: 'text-indigo-400',
    valueColor: 'text-indigo-300',
    link: '/hod/queries',
  },
  {
    label: 'Escalations',
    sublabel: 'SLA breaches & appeals',
    value: stats?.escalated_to_me ?? 0,
    icon: AlertTriangle,
    iconBg: 'bg-rose-500/15 border-rose-500/25',
    iconColor: 'text-rose-400',
    valueColor: 'text-rose-300',
    link: '/hod/escalations',
    urgent: true,
  },
  {
    label: 'Dept. Courses',
    sublabel: 'Under HOD supervision',
    value: stats?.courses_count ?? 0,
    icon: BookOpen,
    iconBg: 'bg-cyan-500/15 border-cyan-500/25',
    iconColor: 'text-cyan-400',
    valueColor: 'text-cyan-300',
    link: '/hod/courses',
  },
  {
    label: 'Resolved',
    sublabel: 'Total closed queries',
    value: stats?.resolved_count ?? 0,
    icon: CheckCircle,
    iconBg: 'bg-emerald-500/15 border-emerald-500/25',
    iconColor: 'text-emerald-400',
    valueColor: 'text-emerald-300',
    link: '/hod/queries',
  },
];

export function HodOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['hod_overview'],
    queryFn: adminApi.getHodOverview,
    refetchInterval: 20000,
  });

  /* ── Loading ───────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader />
        <KpiSkeleton count={4} />
      </div>
    );
  }

  const kpis = KPI_DEFS(stats);
  const escalations = stats?.escalated_to_me ?? 0;

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <PageHeader />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              to={kpi.link}
              className={`group relative flex flex-col gap-4 p-5 rounded-2xl border bg-slate-900/60 hover:bg-slate-800/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                kpi.urgent && kpi.value > 0
                  ? 'border-rose-500/40 hover:border-rose-500/60'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${kpi.iconBg}`}>
                  <Icon className={`w-4.5 h-4.5 ${kpi.iconColor}`} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>

              {/* Value */}
              <div>
                <span className={`text-3xl font-black tracking-tight ${kpi.valueColor}`}>
                  {kpi.value}
                </span>
                <span className="block text-xs font-bold text-slate-200 mt-1">{kpi.label}</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">{kpi.sublabel}</span>
              </div>

              {/* Urgent pulse dot */}
              {kpi.urgent && kpi.value > 0 && (
                <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Stats summary banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Avg response time card */}
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Avg. Response Time
            </span>
            <span className="text-lg font-bold text-slate-100">~3.8 hrs</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Faculty resolving within SLA window
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col justify-center gap-2.5 p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Quick Actions
          </span>
          <div className="flex items-center gap-2">
            <Link
              to="/hod/escalations"
              className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-colors"
            >
              Escalations{escalations > 0 ? ` (${escalations})` : ''}
            </Link>
            <Link
              to="/hod/reports"
              className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Export Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 tracking-tight">
        Department Head Overview
      </h2>
      <p className="text-xs text-slate-500 mt-0.5">
        Live triage metrics, SLA tracking, and faculty escalation management
      </p>
    </div>
  );
}
