export const navConfig = {
  student: [
    { label: 'Submit Query', path: '/student/submit', icon: 'PlusCircle' },
    { label: 'My Queries', path: '/student/queries', icon: 'Inbox' },
    { label: 'Announcements', path: '/student/announcements', icon: 'Megaphone' },
  ],
  instructor: [
    { label: 'Assigned Queries', path: '/instructor', icon: 'CheckSquare' },
    { label: 'Availability & Auto-Reply', path: '/instructor/availability', icon: 'Clock' },
  ],
  hod: [
    { label: 'Overview & KPIs', path: '/hod', icon: 'LayoutDashboard' },
    { label: 'Department Queries', path: '/hod/queries', icon: 'FileText' },
    { label: 'Escalations', path: '/hod/escalations', icon: 'AlertTriangle' },
    { label: 'Courses & Instructors', path: '/hod/courses', icon: 'BookOpen' },
    { label: 'Workload Monitor', path: '/hod/instructors', icon: 'Users' },
    { label: 'Export Reports', path: '/hod/reports', icon: 'Download' },
  ],
  admin: [
    { label: 'Analytics & KPIs', path: '/admin', icon: 'BarChart2' },
    { label: 'All Queries', path: '/admin/queries', icon: 'FileText' },
    { label: 'Departments & Courses', path: '/admin/departments', icon: 'Layers' },
    { label: 'Users & Roles', path: '/admin/users', icon: 'UserCheck' },
    { label: 'Routing Rules', path: '/admin/routing-rules', icon: 'GitFork' },
    { label: 'Announcements', path: '/admin/announcements', icon: 'Megaphone' },
    { label: 'Reports Export', path: '/admin/reports', icon: 'Download' },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: 'ShieldCheck' },
  ],
};
