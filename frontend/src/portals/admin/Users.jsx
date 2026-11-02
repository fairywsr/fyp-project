import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users.api';
import { departmentsApi } from '../../api/academic.api';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal, Spinner } from '../../components/ui/Feedback';
import { UserCheck, Plus, Shield, UserX } from 'lucide-react';

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [deptId, setDeptId] = useState('');
  const [phone, setPhone] = useState('');

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin_users', roleFilter],
    queryFn: () => usersApi.listUsers(roleFilter ? { role: roleFilter } : {}),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      usersApi.createUser({
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        role,
        dept_id: deptId ? parseInt(deptId) : null,
        phone: phone.trim() || null,
      }),
    onSuccess: () => {
      setCreateModalOpen(false);
      setEmail('');
      setFullName('');
      setPhone('');
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => usersApi.updateUser(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
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
          <h2 className="text-xl font-bold text-slate-100">User & Role Management</h2>
          <p className="text-xs text-slate-400 mt-1">Manage staff roles, department scopes, phone identifiers, and account status</p>
        </div>
        <Button variant="primary" onClick={() => setCreateModalOpen(true)} icon={Plus}>
          Pre-register User
        </Button>
      </div>

      {/* Role filter buttons */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mr-2">Filter Role:</span>
        {['', 'student', 'instructor', 'hod', 'admin'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              roleFilter === r
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {r || 'All Roles'}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="glass-panel overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Phone / WhatsApp</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-100 block">{u.full_name}</span>
                  <span className="text-[10px] text-slate-500">{u.email}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-400 border border-slate-700">
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {departments.find((d) => d.id === u.dept_id)?.name || 'General / None'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-400">{u.phone || '—'}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 font-medium ${u.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    {u.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button
                    size="sm"
                    variant={u.is_active ? 'ghost' : 'outline'}
                    onClick={() => toggleActiveMutation.mutate({ id: u.id, is_active: !u.is_active })}
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pre-register Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Pre-register User">
        <div className="space-y-4 text-left">
          <Input label="Full Name *" placeholder="e.g. Dr. Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="University Email *" type="email" placeholder="jane.doe@university.edu.pk" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Role *" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="hod">HOD</option>
              <option value="admin">Administrator</option>
            </Select>

            <Select label="Department" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
              <option value="">None / General</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </div>
          <Input label="Phone Number (for WhatsApp Identification)" placeholder="+923001234567" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={createMutation.isPending} disabled={!fullName.trim() || !email.trim()} onClick={() => createMutation.mutate()}>Pre-register User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
