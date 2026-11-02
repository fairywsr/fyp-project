import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsApi } from '../../api/misc.api';
import { departmentsApi } from '../../api/academic.api';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal, Spinner, EmptyState } from '../../components/ui/Feedback';
import { formatDate } from '../../lib/format';
import { Megaphone, Plus, Calendar, Send } from 'lucide-react';

export function AdminAnnouncements() {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [deptId, setDeptId] = useState('');

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['admin_announcements'],
    queryFn: announcementsApi.list,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      announcementsApi.create({
        title: title.trim(),
        body: body.trim(),
        audience,
        dept_id: audience === 'department' && deptId ? parseInt(deptId) : null,
      }),
    onSuccess: () => {
      setCreateModalOpen(false);
      setTitle('');
      setBody('');
      setDeptId('');
      queryClient.invalidateQueries({ queryKey: ['admin_announcements'] });
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
          <h2 className="text-xl font-bold text-slate-100">Broadcast Announcements</h2>
          <p className="text-xs text-slate-400 mt-1">Publish urgent notifications and academic updates across student and staff portals</p>
        </div>
        <Button variant="primary" onClick={() => setCreateModalOpen(true)} icon={Plus}>
          New Announcement
        </Button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements"
          description="Click New Announcement to compose and broadcast updates."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {announcements.map((a) => (
            <div key={a.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    {a.audience} Target
                  </span>
                  {a.creator_name && (
                    <span className="text-xs text-slate-500">• Posted by {a.creator_name}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(a.created_at)}</span>
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-100">{a.title}</h3>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{a.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Compose Announcement Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Compose Broadcast Announcement">
        <div className="space-y-4 text-left">
          <Input
            label="Announcement Title *"
            placeholder="e.g. Midterm Examination Query Submission Guidelines"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Select
            label="Target Audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            <option value="all">All University Users</option>
            <option value="department">Specific Department</option>
          </Select>

          {audience === 'department' && (
            <Select
              label="Select Department"
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
            >
              <option value="">Choose Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </Select>
          )}

          <Textarea
            label="Announcement Body *"
            rows={5}
            placeholder="Write announcement details..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              isLoading={createMutation.isPending}
              disabled={!title.trim() || !body.trim()}
              onClick={() => createMutation.mutate()}
              icon={Send}
            >
              Broadcast Announcement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
