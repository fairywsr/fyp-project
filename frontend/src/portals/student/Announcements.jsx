import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { announcementsApi } from '../../api/misc.api';
import { formatDate } from '../../lib/format';
import { EmptyState, Spinner } from '../../components/ui/Feedback';
import { Megaphone, Calendar } from 'lucide-react';

export function StudentAnnouncements() {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: announcementsApi.list,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-100">University & Department Announcements</h2>
        <p className="text-xs text-slate-400 mt-1">Broadcasts and notifications from administration and faculty</p>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements"
          description="There are currently no active announcements for you."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    {a.audience} Announcement
                  </span>
                  {a.creator_name && (
                    <span className="text-xs text-slate-500">• Posted by {a.creator_name}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
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
    </div>
  );
}
