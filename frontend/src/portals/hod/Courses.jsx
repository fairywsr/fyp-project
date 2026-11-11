import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi, coursesApi } from '../../api/academic.api';
import { useAuth } from '../../features/auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal, Spinner } from '../../components/ui/Feedback';
import { Select } from '../../components/ui/Input';
import { BookOpen, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

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
    mutationFn: () =>
      coursesApi.assignInstructor(
        selectedCourse.id,
        instructorId ? parseInt(instructorId) : null
      ),
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

  /* ── Loading ───────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  const assigned = courses.filter((c) => c.instructor_name).length;
  const unassigned = courses.length - assigned;

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Courses &amp; Instructor Assignments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Queries for a course are routed to its assigned faculty member automatically
          </p>
        </div>
        <div className="flex items-center gap-3 text-right shrink-0">
          <div className="text-right">
            <span className="text-lg font-bold text-emerald-400">{assigned}</span>
            <span className="text-[11px] text-slate-500 block">assigned</span>
          </div>
          {unassigned > 0 && (
            <div className="text-right">
              <span className="text-lg font-bold text-amber-400">{unassigned}</span>
              <span className="text-[11px] text-slate-500 block">unassigned</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90">
              <th className="py-3 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Code
              </th>
              <th className="py-3 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Course Name
              </th>
              <th className="py-3 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Assigned Instructor
              </th>
              <th className="py-3 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {courses.map((c) => (
              <tr
                key={c.id}
                className="bg-slate-900/40 hover:bg-slate-800/50 transition-colors"
              >
                {/* Code */}
                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center font-mono font-bold text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                    {c.code}
                  </span>
                </td>

                {/* Name */}
                <td className="py-3.5 px-5">
                  <span className="text-sm font-semibold text-slate-100">{c.name}</span>
                </td>

                {/* Instructor */}
                <td className="py-3.5 px-5">
                  {c.instructor_name ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {c.instructor_name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-400/80 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Unassigned — routes to HOD
                    </span>
                  )}
                </td>

                {/* Action */}
                <td className="py-3.5 px-5 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenAssign(c)}
                    icon={UserPlus}
                  >
                    {c.instructor_name ? 'Reassign' : 'Assign'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Instructor — ${selectedCourse?.code}`}
      >
        <div className="space-y-5 text-left">
          {selectedCourse && (
            <div className="px-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
              Course:{' '}
              <strong className="text-slate-200">{selectedCourse.name}</strong>
            </div>
          )}

          <Select
            label="Select Instructor"
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
          >
            <option value="">— Unassign (default to HOD) —</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.full_name} ({inst.availability} · {inst.open_queries_count} open)
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
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
