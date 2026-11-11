import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { departmentsApi } from '../../api/academic.api';
import { useAuth } from '../../features/auth/AuthContext';
import { Spinner } from '../../components/ui/Feedback';
import { Clock, Wifi, WifiOff, AlertCircle } from 'lucide-react';

const AVAILABILITY_CONFIG = {
  available: {
    label: 'Available',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    icon: Wifi,
    iconColor: 'text-emerald-400',
    cardBorder: 'border-slate-800',
    cardBg: 'bg-slate-900/60',
  },
  away: {
    label: 'Away',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    icon: Clock,
    iconColor: 'text-amber-400',
    cardBorder: 'border-amber-500/20',
    cardBg: 'bg-amber-950/5',
  },
  on_leave: {
    label: 'On Leave',
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
    icon: WifiOff,
    iconColor: 'text-rose-400',
    cardBorder: 'border-rose-500/30',
    cardBg: 'bg-rose-950/10',
  },
};

export function HodInstructors() {
  const { user } = useAuth();
  const deptId = user?.dept_id || 1;

  const { data: instructors = [], isLoading } = useQuery({
    queryKey: ['dept_instructors_workload', deptId],
    queryFn: () => departmentsApi.getInstructors(deptId),
    refetchInterval: 20000,
  });

  /* ── Loading ───────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  const onLeaveCount = instructors.filter((i) => i.availability === 'on_leave').length;
  const totalOpen = instructors.reduce((acc, i) => acc + (i.open_queries_count || 0), 0);

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Faculty Workload Monitor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live availability and open query counts across departmental faculty
          </p>
        </div>
        <div className="flex items-center gap-4 text-right shrink-0">
          <div>
            <span className="text-lg font-bold text-slate-100">{totalOpen}</span>
            <span className="text-[11px] text-slate-500 block">total open</span>
          </div>
          {onLeaveCount > 0 && (
            <div>
              <span className="text-lg font-bold text-rose-400">{onLeaveCount}</span>
              <span className="text-[11px] text-slate-500 block">on leave</span>
            </div>
          )}
        </div>
      </div>

      {/* Faculty grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instructors.map((inst) => (
          <InstructorCard key={inst.id} instructor={inst} />
        ))}
      </div>
    </div>
  );
}

/* ── Instructor card ────────────────────────────────────────── */
function InstructorCard({ instructor: inst }) {
  const cfg = AVAILABILITY_CONFIG[inst.availability] || AVAILABILITY_CONFIG.available;
  const Icon = cfg.icon;
  const initials = inst.full_name
    ? inst.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'IN';

  /* workload bar: scale 0-10 open queries = 0-100% */
  const workloadPct = Math.min((inst.open_queries_count / 10) * 100, 100);
  const workloadColor =
    workloadPct > 70
      ? 'bg-rose-500'
      : workloadPct > 40
      ? 'bg-amber-400'
      : 'bg-emerald-400';

  return (
    <div
      className={`flex flex-col gap-4 p-5 rounded-2xl border transition-colors ${cfg.cardBorder} ${cfg.cardBg}`}
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          {/* Status dot */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${cfg.dot}`}
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-100 truncate">{inst.full_name}</h3>
          <span className="text-[11px] text-slate-500 truncate block">{inst.email}</span>
        </div>
      </div>

      {/* Status badge + icon */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold capitalize px-2.5 py-1 rounded-full border ${cfg.badge}`}
        >
          <Icon className={`w-3 h-3 ${cfg.iconColor}`} />
          {cfg.label}
        </span>
        <div className="text-right">
          <span className="text-lg font-black text-slate-100">{inst.open_queries_count}</span>
          <span className="text-[10px] text-slate-500 block">open queries</span>
        </div>
      </div>

      {/* Workload bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
            Workload
          </span>
          <span className="text-[10px] text-slate-500">{inst.open_queries_count} / 10</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${workloadColor}`}
            style={{ width: `${workloadPct}%` }}
          />
        </div>
      </div>

      {/* On-leave warning */}
      {inst.availability === 'on_leave' && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-300 pt-1 border-t border-rose-500/15">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Course queries are rerouting to HOD
        </div>
      )}
    </div>
  );
}
