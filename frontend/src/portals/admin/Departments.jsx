import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi, coursesApi } from '../../api/academic.api';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal, Spinner } from '../../components/ui/Feedback';
import { Layers, Plus, BookOpen } from 'lucide-react';

export function AdminDepartments() {
  const queryClient = useQueryClient();
  const [createDeptModal, setCreateDeptModal] = useState(false);
  const [createCourseModal, setCreateCourseModal] = useState(false);

  // New dept form state
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptEmail, setDeptEmail] = useState('');

  // New course form state
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDeptId, setCourseDeptId] = useState('');

  const { data: departments = [], isLoading: loadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['all_courses'],
    queryFn: () => coursesApi.list(),
  });

  const addDeptMutation = useMutation({
    mutationFn: () =>
      departmentsApi.create({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        contact_email: deptEmail.trim() || undefined,
      }),
    onSuccess: () => {
      setCreateDeptModal(false);
      setDeptName('');
      setDeptCode('');
      setDeptEmail('');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  const addCourseMutation = useMutation({
    mutationFn: () =>
      coursesApi.create({
        code: courseCode.trim().toUpperCase(),
        name: courseName.trim(),
        dept_id: parseInt(courseDeptId),
      }),
    onSuccess: () => {
      setCreateCourseModal(false);
      setCourseCode('');
      setCourseName('');
      setCourseDeptId('');
      queryClient.invalidateQueries({ queryKey: ['all_courses'] });
    },
  });

  if (loadingDepts || loadingCourses) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Academic Structure: Departments & Courses</h2>
          <p className="text-xs text-slate-400 mt-1">Configure academic divisions and courses utilized by the routing engine</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setCreateCourseModal(true)} icon={Plus}>
            Add Course
          </Button>
          <Button variant="primary" onClick={() => setCreateDeptModal(true)} icon={Plus}>
            Add Department
          </Button>
        </div>
      </div>

      {/* Departments Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" /> Active Departments ({departments.length})
        </h3>
        <div className="glass-panel overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Contact Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {departments.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">{d.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-100">{d.name}</td>
                  <td className="py-3 px-4 text-slate-400">{d.contact_email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Courses Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" /> Registered Courses ({courses.length})
        </h3>
        <div className="glass-panel overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4">Instructor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">{c.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-100">{c.name}</td>
                  <td className="py-3 px-4">
                    {c.instructor_name ? (
                      <span className="text-emerald-400 font-medium">{c.instructor_name}</span>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dept Modal */}
      <Modal isOpen={createDeptModal} onClose={() => setCreateDeptModal(false)} title="Create New Department">
        <div className="space-y-4 text-left">
          <Input label="Department Name *" placeholder="e.g. Mechanical Engineering" value={deptName} onChange={(e) => setDeptName(e.target.value)} required />
          <Input label="Department Code *" placeholder="e.g. ME" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} required />
          <Input label="Contact / Helpdesk Email" type="email" placeholder="me.helpdesk@university.edu.pk" value={deptEmail} onChange={(e) => setDeptEmail(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreateDeptModal(false)}>Cancel</Button>
            <Button variant="primary" isLoading={addDeptMutation.isPending} disabled={!deptName.trim() || !deptCode.trim()} onClick={() => addDeptMutation.mutate()}>Create Department</Button>
          </div>
        </div>
      </Modal>

      {/* Create Course Modal */}
      <Modal isOpen={createCourseModal} onClose={() => setCreateCourseModal(false)} title="Register New Course">
        <div className="space-y-4 text-left">
          <Input label="Course Code *" placeholder="e.g. CS619" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} required />
          <Input label="Course Title *" placeholder="e.g. Final Year Project" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
          <Select label="Department *" value={courseDeptId} onChange={(e) => setCourseDeptId(e.target.value)}>
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreateCourseModal(false)}>Cancel</Button>
            <Button variant="primary" isLoading={addCourseMutation.isPending} disabled={!courseCode.trim() || !courseName.trim() || !courseDeptId} onClick={() => addCourseMutation.mutate()}>Register Course</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
