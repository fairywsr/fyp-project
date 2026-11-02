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
  pending: { bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20', label: 'Pending Triage' },
  assigned: { bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'Assigned' },
  in_progress: { bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', label: 'In Progress' },
  resolved: { bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', label: 'Resolved' },
  closed: { bg: 'bg-slate-500/10 text-slate-600 border-slate-500/20', label: 'Closed' },
  escalated: { bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20', label: 'Escalated (SLA)' },
};

export const PRIORITY_COLORS = {
  low: { bg: 'bg-slate-100 text-slate-700', label: 'Low' },
  medium: { bg: 'bg-blue-100 text-blue-700', label: 'Medium' },
  high: { bg: 'bg-amber-100 text-amber-800', label: 'High' },
  urgent: { bg: 'bg-rose-100 text-rose-800', label: 'Urgent' },
};
