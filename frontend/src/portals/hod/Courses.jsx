import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi, coursesApi } from '../../api/academic.api';
import { useAuth } from '../../features/auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal, Spinner } from '../../components/ui/Feedback';
import { Select } from '../../components/ui/Input';
import { BookOpen, UserPlus, Check } from 'lucide-react';

export function HodCourses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const deptId = user?.dept_id || 1;

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [instructorId, setInstructorId] = useState('');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['dept_courses', deptId],
    queryFn: () => departmentsApi.getCourses(deptId),
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['dept_instructors', deptId],
    queryFn: () => departmentsApi.getInstructors(deptId),
  });

  const assignMutation = useMutation({
    mutationFn: () => coursesApi.assignInstructor(selectedCourse.id, instructorId ? parseInt(instructorId) : null),
    onSuccess: () => {
      setAssignModalOpen(false);
      setSelectedCourse(null);
      queryClient.invalidateQueries({ queryKey: ['dept_courses', deptId] });
    },
  });

  const handleOpenAssign = (c) => {
    setSelectedCourse(c);
    setInstructorId(c.instructor_id ? String(c.instructor_id) : '');
    setAssignModalOpen(true);
  };

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
        <h2 className="text-xl font-bold text-slate-100">Department Courses & Instructor Assignments</h2>
        <p className="text-xs text-slate-400 mt-1">
          Inbound student queries classified for a course are automatically routed to its assigned faculty member
        </p>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Course Name</th>
              <th className="py-3 px-4">Assigned Instructor</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-indigo-400">{c.code}</td>
                <td className="py-3 px-4 font-semibold text-slate-100">{c.name}</td>
                <td className="py-3 px-4">
                  {c.instructor_name ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {c.instructor_name}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">Unassigned (routes to HOD)</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <Button size="sm" variant="outline" onClick={() => handleOpenAssign(c)} icon={UserPlus}>
                    Assign
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Instructor Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Instructor to ${selectedCourse?.code}`}
      >
        <div className="space-y-4 text-left">
          <Select
            label="Select Course Instructor"
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
          >
            <option value="">None / Unassign (Default to HOD)</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.full_name} ({inst.availability} • {inst.open_queries_count} open)
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              isLoading={assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              Save Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
