import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/misc.api';
import { KpiSkeleton } from '../../components/ui/Feedback';
import { LayoutDashboard, AlertTriangle, CheckCircle, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HodOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['hod_overview'],
    queryFn: adminApi.getHodOverview,
    refetchInterval: 20000,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 text-left">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Department Head Overview</h2>
          <p className="text-xs text-slate-400 mt-1">Live triage metrics, SLA tracking, and faculty escalation management</p>
        </div>
        <KpiSkeleton count={4} />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Open Department Queries',
      value: stats?.open_queries ?? 0,
      icon: LayoutDashboard,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      link: '/hod/queries',
    },
    {
      label: 'Escalated to Me (SLA / Appeals)',
      value: stats?.escalated_to_me ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      link: '/hod/escalations',
    },
    {
      label: 'Department Courses',
      value: stats?.courses_count ?? 0,
      icon: BookOpen,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      link: '/hod/courses',
    },
    {
      label: 'Resolved Queries',
      value: stats?.resolved_count ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      link: '/hod/queries',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Department Head Overview</h2>
        <p className="text-xs text-slate-400 mt-1">Live triage metrics, SLA tracking, and faculty escalation management</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              to={kpi.link}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 hover-lift block group focus-ring"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="text-xs font-semibold text-slate-400 block">{kpi.label}</span>
              <span className="text-2xl font-extrabold text-slate-100 mt-1 block tracking-tight">{kpi.value}</span>
            </Link>
          );
        })}
      </div>

      {/* Quick Action summary banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/90 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Average Department Response Time</h3>
          <p className="text-xs text-slate-400 mt-0.5">Faculty is resolving queries within ~3.8 hours on average.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/hod/escalations"
            className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer focus-ring"
          >
            Review Escalations ({stats?.escalated_to_me ?? 0})
          </Link>
          <Link
            to="/hod/reports"
            className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer focus-ring"
          >
            Export Report
          </Link>
        </div>
      </div>
    </div>
  );
}
