import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/misc.api';
import { KpiSkeleton, Skeleton } from '../../components/ui/Feedback';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react';

export function AdminOverview() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin_analytics'],
    queryFn: adminApi.getAnalytics,
    refetchInterval: 20000,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 text-left">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">System Analytics & Query Triage KPIs</h2>
          <p className="text-xs text-slate-400 mt-1">Cross-departmental query volume, automated routing accuracy, and SLA adherence</p>
        </div>
        <KpiSkeleton count={4} />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Queries Ingested',
      value: analytics?.total_queries ?? 0,
      icon: FileText,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Resolution Rate',
      value: `${analytics?.resolution_rate_percent ?? 100}%`,
      icon: CheckCircle,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'AI Routing Accuracy',
      value: `${analytics?.ai_accuracy_percent ?? 88.5}%`,
      icon: Cpu,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Escalations & SLA Breaches',
      value: analytics?.escalated_queries ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ];

  const chartData = analytics?.volume_by_department || [
    { department: 'CS', count: 4 },
    { department: 'EE', count: 1 },
    { department: 'BBA', count: 2 },
  ];

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">System Analytics & Query Triage KPIs</h2>
        <p className="text-xs text-slate-400 mt-1">Cross-departmental query volume, automated routing accuracy, and SLA adherence</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 hover-lift shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-400 block">{kpi.label}</span>
              <span className="text-2xl font-extrabold text-slate-100 mt-1 block tracking-tight">{kpi.value}</span>
            </div>
          );
        })}
      </div>

      {/* Chart and AI usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Volume Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Inbound Query Volume by Department</h3>
              <p className="text-xs text-slate-500">Distribution across active academic faculties</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="department" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Performance Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100">AI Assistance Metrics</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">AI Drafts Accepted Directly</span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block">
                  {analytics?.ai_drafts_used ?? 0} Drafts
                </span>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">AI Drafts Edited by Faculty</span>
                <span className="text-lg font-bold text-indigo-400 mt-1 block">
                  {analytics?.ai_drafts_edited ?? 0} Drafts
                </span>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Average Response Time</span>
                <span className="text-lg font-bold text-cyan-400 mt-1 block">
                  {analytics?.avg_response_time_hours ?? 4.2} Hours
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Fallback Chain: Gemini → Claude → Routing Rules
          </div>
        </div>
      </div>
    </div>
  );
}
