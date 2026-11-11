import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/misc.api';
import { formatDate } from '../lib/format';
import { Button } from '../components/ui/Button';
import { EmptyState, CardSkeleton } from '../components/ui/Feedback';
import { Bell, CheckCheck } from 'lucide-react';

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-left">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">All Notifications</h2>
          <p className="text-xs text-slate-400 mt-1">Updates on query acknowledgments, assignments, and resolution replies</p>
        </div>
        <CardSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">All Notifications</h2>
          <p className="text-xs text-slate-400 mt-1">Updates on query acknowledgments, assignments, and resolution replies</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => markAllMutation.mutate()}
            icon={CheckCheck}
          >
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are all caught up with your notifications."
        />
      ) : (
        <div className="glass-panel overflow-hidden rounded-2xl border border-slate-800 shadow-xl divide-y divide-slate-800/60">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                n.is_read ? 'bg-transparent text-slate-400 hover:bg-slate-850/40' : 'bg-indigo-950/25 text-slate-100 hover:bg-indigo-900/30'
              }`}
            >
              <div>
                <p className="text-sm font-medium leading-relaxed">{n.message}</p>
                <span className="text-[11px] text-slate-400 mt-1.5 block font-mono">{formatDate(n.created_at)}</span>
              </div>
              {!n.is_read && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0 mt-1 shadow-sm shadow-indigo-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
