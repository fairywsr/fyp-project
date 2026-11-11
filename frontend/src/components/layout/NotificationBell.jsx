import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/misc.api';
import { formatRelativeTime } from '../../lib/format';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const queryClient = useQueryClient();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

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
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all focus-ring cursor-pointer"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500 shadow-sm shadow-indigo-500" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 glass-panel-elevated bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-modal-pop">
          <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => readAllMutation.mutate()}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No notifications yet</div>
            ) : (
              notifications.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.is_read && readMutation.mutate(item.id)}
                  className={`p-3.5 text-left transition-colors cursor-pointer flex gap-2.5 ${
                    item.is_read
                      ? 'bg-transparent text-slate-400 hover:bg-slate-800/40'
                      : 'bg-indigo-950/25 text-slate-200 hover:bg-indigo-900/30'
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        item.is_read ? 'bg-transparent' : 'bg-indigo-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium leading-snug">{item.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 border-t border-slate-800 text-center bg-slate-950/60">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
