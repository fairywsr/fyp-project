import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../lib/constants';

export function StatusBadge({ status }) {
  const meta = STATUS_COLORS[status] || { bg: 'bg-slate-800 text-slate-300 border-slate-700', label: status };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.bg}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const meta = PRIORITY_COLORS[priority] || { bg: 'bg-slate-800 text-slate-300', label: priority };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${meta.bg}`}
    >
      {meta.label}
    </span>
  );
}
