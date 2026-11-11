export const ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  HOD: 'hod',
  ADMIN: 'admin',
};

export const STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ESCALATED: 'escalated',
};

export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const CHANNELS = {
  WEB_FORM: 'web_form',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
};

export const STATUS_COLORS = {
  pending: { bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30', label: 'Pending Triage' },
  assigned: { bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30', label: 'Assigned' },
  in_progress: { bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', label: 'In Progress' },
  resolved: { bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', label: 'Resolved' },
  closed: { bg: 'bg-slate-800 text-slate-400 border-slate-700/60', label: 'Closed' },
  escalated: { bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30', label: 'Escalated (SLA)' },
};

export const PRIORITY_COLORS = {
  low: { bg: 'bg-slate-800 text-slate-300 border-slate-700/60', label: 'Low' },
  medium: { bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30', label: 'Medium' },
  high: { bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30', label: 'High' },
  urgent: { bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30', label: 'Urgent' },
};
