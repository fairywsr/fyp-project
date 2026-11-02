import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { departmentsApi } from '../../api/academic.api';
import { useAuth } from '../../features/auth/AuthContext';
import { Spinner } from '../../components/ui/Feedback';
import { Users, Mail, Clock } from 'lucide-react';

export function HodInstructors() {
  const { user } = useAuth();
  const deptId = user?.dept_id || 1;

  const { data: instructors = [], isLoading } = useQuery({
    queryKey: ['dept_instructors_workload', deptId],
    queryFn: () => departmentsApi.getInstructors(deptId),
    refetchInterval: 20000,
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
      <div>
        <h2 className="text-xl font-bold text-slate-100">Faculty Workload & Availability Monitor</h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor open queries, leave status, and capacity across your departmental faculty
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instructors.map((inst) => {
          const isLeave = inst.availability === 'on_leave';
          const isAway = inst.availability === 'away';
          return (
            <div
              key={inst.id}
              className={`glass-panel p-5 rounded-2xl border transition-all ${
                isLeave
                  ? 'border-rose-500/30 bg-rose-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {inst.full_name ? inst.full_name.charAt(0) : 'I'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{inst.full_name}</h3>
                    <span className="text-[10px] text-slate-400 block">{inst.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Status:</span>
                  <span
                    className={`font-semibold capitalize px-2 py-0.5 rounded-full text-[10px] ${
                      isLeave
                        ? 'bg-rose-500/20 text-rose-300'
                        : isAway
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {inst.availability.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Open Queries:</span>
                  <span className="font-bold text-slate-100 text-sm">{inst.open_queries_count}</span>
                </div>
              </div>

              {isLeave && (
                <div className="mt-3 pt-2 border-t border-rose-500/20 text-[11px] text-rose-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Course queries are rerouting to HOD
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
