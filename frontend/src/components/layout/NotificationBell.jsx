import React, { useState } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/misc.api';
import { formatRelativeTime } from '../../lib/format';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Polling every 20 seconds as specified in Section 11.2
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
    refetchInterval: 20000,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const readMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const readAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel-elevated bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => readAllMutation.mutate()}
                className="text-xs text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No notifications yet</div>
            ) : (
              notifications.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.is_read && readMutation.mutate(item.id)}
                  className={`p-3 text-left transition-colors cursor-pointer ${
                    item.is_read ? 'bg-transparent text-slate-400' : 'bg-indigo-950/20 text-slate-200'
                  } hover:bg-slate-800/50`}
                >
                  <p className="text-xs font-medium leading-snug">{item.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-slate-800 text-center bg-slate-950/40">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
