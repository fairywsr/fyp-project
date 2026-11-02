import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/misc.api';
import { departmentsApi, coursesApi } from '../../api/academic.api';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal, Spinner, EmptyState } from '../../components/ui/Feedback';
import { PriorityBadge } from '../../components/query/Badges';
import { GitFork, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export function AdminRoutingRules() {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states
  const [keyword, setKeyword] = useState('');
  const [deptId, setDeptId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['routing_rules'],
    queryFn: adminApi.listRoutingRules,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', deptId],
    queryFn: () => coursesApi.list(deptId ? { dept_id: deptId } : {}),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.createRoutingRule({
        keyword: keyword.trim(),
        dept_id: parseInt(deptId),
        course_id: courseId ? parseInt(courseId) : null,
        priority,
      }),
    onSuccess: () => {
      setCreateModalOpen(false);
      setKeyword('');
      setDeptId('');
      setCourseId('');
      setErrorMsg('');
      queryClient.invalidateQueries({ queryKey: ['routing_rules'] });
    },
    onError: (err) => {
      setErrorMsg(err?.response?.data?.detail || err.message || 'Error saving rule');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteRoutingRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing_rules'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => adminApi.updateRoutingRule(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing_rules'] });
    },
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
          <h2 className="text-xl font-bold text-slate-100">Keyword Routing Rules Engine</h2>
          <p className="text-xs text-slate-400 mt-1">
            Rules provide prompt hints for AI classification and act as an instant fallback mechanism
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateModalOpen(true)} icon={Plus}>
          Add Routing Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <EmptyState
          icon={GitFork}
          title="No routing rules defined"
          description="Create keyword rules to direct specific terms directly to departments or courses."
        />
      ) : (
        <div className="glass-panel overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Keyword Match</th>
                <th className="py-3 px-4">Department Target</th>
                <th className="py-3 px-4">Course Target</th>
                <th className="py-3 px-4">Assigned Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-300">"{r.keyword}"</td>
                  <td className="py-3 px-4 font-semibold text-slate-100">{r.dept_name || '—'}</td>
                  <td className="py-3 px-4">
                    {r.course_code ? (
                      <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-cyan-400 font-bold">
                        {r.course_code}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">None / General</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleActiveMutation.mutate({ id: r.id, is_active: !r.is_active })}
                      className={`inline-flex items-center gap-1 font-semibold text-xs cursor-pointer ${
                        r.is_active ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${r.is_active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      {r.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(r.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Rule Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Routing Rule">
        <div className="space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <Input
            label="Keyword / Trigger Phrase *"
            placeholder="e.g. fee challan, CS619, grade appeal"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            required
          />

          <Select
            label="Target Department *"
            value={deptId}
            onChange={(e) => { setDeptId(e.target.value); setCourseId(''); }}
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </Select>

          <Select
            label="Target Course (Optional)"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">None / General Departmental</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </Select>

          <Select
            label="Default Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              isLoading={createMutation.isPending}
              disabled={!keyword.trim() || !deptId}
              onClick={() => createMutation.mutate()}
            >
              Save Rule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
