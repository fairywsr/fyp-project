import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { announcementsApi } from '../../api/misc.api';
import { formatDate } from '../../lib/format';
import { EmptyState, CardSkeleton } from '../../components/ui/Feedback';
import { Megaphone, Calendar, User, ChevronDown, ChevronUp, Bell } from 'lucide-react';

// ─── Audience colour map ─────────────────────────────────────────────────────

const AUDIENCE_META = {
  university: {
    label: 'University',
    classes: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-400',
    stripe: 'from-indigo-500 to-indigo-700',
  },
  department: {
    label: 'Department',
    classes: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-400',
    stripe: 'from-cyan-500 to-cyan-700',
  },
  all: {
    label: 'All',
    classes: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    dot: 'bg-violet-400',
    stripe: 'from-violet-500 to-violet-700',
  },
};

function getAudienceMeta(audience = '') {
  const key = (audience || '').toLowerCase();
  return (
    AUDIENCE_META[key] || {
      label: audience || 'General',
      classes: 'bg-slate-700/60 text-slate-300 border-slate-600/60',
      dot: 'bg-slate-400',
      stripe: 'from-slate-600 to-slate-700',
    }
  );
}

// ─── Single announcement card ─────────────────────────────────────────────────

function AnnouncementCard({ announcement: a, index }) {
  const [expanded, setExpanded] = useState(index === 0); // first card open by default
  const meta = getAudienceMeta(a.audience);

  // Truncate body preview at ~160 chars if collapsed
  const isLong = (a.body || '').length > 160;
  const preview = isLong ? a.body.slice(0, 160).trimEnd() + '…' : a.body;

  return (
    <div
      className="glass-panel rounded-2xl border border-slate-800 hover:border-slate-700/70 hover-lift shadow-lg relative overflow-hidden transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Left accent stripe */}
      <div className={`absolute left-0 inset-y-0 w-1 bg-gradient-to-b ${meta.stripe} rounded-l-2xl`} />

      <div className="pl-5 pr-5 pt-5 pb-4 sm:pl-6 sm:pr-6 sm:pt-5">
        {/* ── Card Header ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800/60">
          <div className="flex flex-wrap items-center gap-2">
            {/* Audience badge */}
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${meta.classes}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} animate-pulse shrink-0`} />
              {meta.label}
            </span>

            {/* Posted by */}
            {a.creator_name && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <User className="w-3 h-3 text-slate-500" />
                {a.creator_name}
              </span>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(a.created_at)}</span>
          </div>
        </div>

        {/* ── Title ───────────────────────────────── */}
        <h3 className="text-base font-bold text-slate-100 mt-3 mb-2 leading-snug">
          {a.title}
        </h3>

        {/* ── Body (collapsible) ───────────────────── */}
        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
          {expanded || !isLong ? a.body : preview}
        </p>

        {/* Toggle button */}
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer select-none"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Read more
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page header ─────────────────────────────────────────────────────────────

function PageHeader({ count }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-indigo-500/25 flex items-center justify-center shrink-0 mt-0.5">
        <Megaphone className="w-5 h-5 text-indigo-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          University &amp; Department Announcements
        </h2>
        <p className="text-xs text-slate-400">
          Broadcasts and notifications from administration and faculty
          {count > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/25 text-indigo-300">
              <Bell className="w-2.5 h-2.5" />
              {count} active
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function AnnouncementsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl skeleton-shimmer shrink-0" />
        <div className="space-y-2 flex-1 pt-1">
          <div className="w-64 h-5 skeleton-shimmer rounded-lg" />
          <div className="w-80 h-3.5 skeleton-shimmer rounded-lg" />
        </div>
      </div>
      <CardSkeleton count={3} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StudentAnnouncements() {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: announcementsApi.list,
  });

  if (isLoading) return <AnnouncementsSkeleton />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <PageHeader count={announcements.length} />

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="There are currently no active announcements for you. Check back later."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a, i) => (
            <AnnouncementCard key={a.id} announcement={a} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
