import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/misc.api';
import { Spinner } from '../../components/ui/Feedback';
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
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">System Audit Trail & Security Logs</h2>
          <p className="text-xs text-slate-400 mt-1">Immutable log of queries ingested, routing events, HOD overrides, and staff responses</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl border border-slate-800">
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
              <tr key={log.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(log.created_at)}</td>
                <td className="py-3 px-4 font-semibold text-slate-200">{log.user_name}</td>
                <td className="py-3 px-4">
                  <span className="font-mono text-[10px] font-bold bg-slate-800 text-indigo-400 px-2 py-0.5 rounded border border-slate-700">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {log.entity_type} #{log.entity_id || '—'}
                </td>
                <td className="py-3 px-4 text-slate-300 max-w-md truncate">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
