import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/misc.api';
import { TableSkeleton } from '../../components/ui/Feedback';
import { formatDate } from '../../lib/format';
import { ShieldCheck, Search } from 'lucide-react';

export function AdminAuditLogs() {
  const [filterAction, setFilterAction] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit_logs', filterAction],
    queryFn: () => adminApi.getAuditLogs(filterAction ? { action: filterAction } : {}),
    refetchInterval: 20000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">System Audit Trail & Security Logs</h2>
          <p className="text-xs text-slate-400 mt-1">Immutable log of queries ingested, routing events, HOD overrides, and staff responses</p>
        </div>
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">System Audit Trail & Security Logs</h2>
          <p className="text-xs text-slate-400 mt-1">Immutable log of queries ingested, routing events, HOD overrides, and staff responses</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">{log.user_name}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] font-bold bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {log.entity_type} #{log.entity_id || '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-md truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
