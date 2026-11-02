import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { RequireAuth, RequireRole } from './guards/AuthGuards';
import { LoginPage } from '../features/auth/LoginPage';

// Pages
import { ProfilePage } from '../pages/Profile';
import { NotificationsPage } from '../pages/Notifications';
import { ForbiddenPage, NotFoundPage } from '../pages/ErrorPages';

// Student Portal
import { SubmitQuery } from '../portals/student/SubmitQuery';
import { MyQueries } from '../portals/student/MyQueries';
import { StudentQueryDetail } from '../portals/student/QueryDetail';
import { StudentAnnouncements } from '../portals/student/Announcements';

// Instructor Portal
import { InstructorAssignedQueries } from '../portals/instructor/AssignedQueries';
import { InstructorQueryWorkspace } from '../portals/instructor/QueryWorkspace';
import { InstructorAvailability } from '../portals/instructor/Availability';

// HOD Portal
import { HodOverview } from '../portals/hod/Overview';
import { HodDeptQueries } from '../portals/hod/DeptQueries';
import { HodCourses } from '../portals/hod/Courses';
import { HodInstructors } from '../portals/hod/Instructors';
import { HodEscalations } from '../portals/hod/Escalations';
import { HodReports } from '../portals/hod/Reports';

// Admin Portal
import { AdminOverview } from '../portals/admin/Overview';
import { AdminQueries } from '../portals/admin/Queries';
import { AdminDepartments } from '../portals/admin/Departments';
import { AdminUsers } from '../portals/admin/Users';
import { AdminRoutingRules } from '../portals/admin/RoutingRules';
import { AdminAnnouncements } from '../portals/admin/Announcements';
import { AdminReports } from '../portals/admin/Reports';
import { AdminAuditLogs } from '../portals/admin/AuditLogs';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          // Default redirect
          {
            path: '/',
            element: <Navigate to="/student/queries" replace />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          },
          {
            path: '/notifications',
            element: <NotificationsPage />,
          },

          // Student Portal Routes
          {
            element: <RequireRole allowedRoles={['student', 'admin']} />,
            children: [
              { path: '/student', element: <Navigate to="/student/queries" replace /> },
              { path: '/student/submit', element: <SubmitQuery /> },
              { path: '/student/queries', element: <MyQueries /> },
              { path: '/student/queries/:id', element: <StudentQueryDetail /> },
              { path: '/student/announcements', element: <StudentAnnouncements /> },
            ],
          },

          // Instructor Portal Routes
          {
            element: <RequireRole allowedRoles={['instructor', 'hod', 'admin']} />,
            children: [
              { path: '/instructor', element: <InstructorAssignedQueries /> },
              { path: '/instructor/queries/:id', element: <InstructorQueryWorkspace /> },
              { path: '/instructor/availability', element: <InstructorAvailability /> },
            ],
          },

          // HOD Portal Routes
          {
            element: <RequireRole allowedRoles={['hod', 'admin']} />,
            children: [
              { path: '/hod', element: <HodOverview /> },
              { path: '/hod/queries', element: <HodDeptQueries /> },
              { path: '/hod/courses', element: <HodCourses /> },
              { path: '/hod/instructors', element: <HodInstructors /> },
              { path: '/hod/escalations', element: <HodEscalations /> },
              { path: '/hod/reports', element: <HodReports /> },
            ],
          },

          // Admin Portal Routes
          {
            element: <RequireRole allowedRoles={['admin']} />,
            children: [
              { path: '/admin', element: <AdminOverview /> },
              { path: '/admin/queries', element: <AdminQueries /> },
              { path: '/admin/departments', element: <AdminDepartments /> },
              { path: '/admin/users', element: <AdminUsers /> },
              { path: '/admin/routing-rules', element: <AdminRoutingRules /> },
              { path: '/admin/announcements', element: <AdminAnnouncements /> },
              { path: '/admin/reports', element: <AdminReports /> },
              { path: '/admin/audit-logs', element: <AdminAuditLogs /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
