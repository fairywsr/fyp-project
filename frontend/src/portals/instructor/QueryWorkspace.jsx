import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queriesApi } from '../../api/queries.api';
import { repliesApi } from '../../api/replies.api';
import { QueryThread } from '../../components/query/QueryThread';
import { AiDraftPanel } from '../../components/query/AiDraftPanel';
import { ReplyEditor } from '../../components/query/ReplyEditor';
import { StatusBadge, PriorityBadge } from '../../components/query/Badges';
import { Skeleton } from '../../components/ui/Feedback';
import { ArrowLeft, User, Mail, Calendar, Hash } from 'lucide-react';
import { formatDate } from '../../lib/format';

export function InstructorQueryWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editorText, setEditorText] = useState('');
  const [appliedDraftId, setAppliedDraftId] = useState(null);

  const { data: query, isLoading } = useQuery({
    queryKey: ['query_detail', id],
    queryFn: () => queriesApi.getQueryDetail(id),
    refetchInterval: 20000,
  });

  const replyMutation = useMutation({
    mutationFn: (data) => repliesApi.sendOrSaveReply(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['query_detail', id] });
      queryClient.invalidateQueries({ queryKey: ['assigned_queries'] });
    },
  });

  const handleApplyDraft = (draftText, draftId) => {
    setEditorText(draftText);
    setAppliedDraftId(draftId);
  };

  /* ── Loading skeleton ───────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto">
        {/* Back + header skeleton */}
        <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
          <Skeleton className="w-9 h-9 rounded" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-40 h-3.5" />
            <Skeleton className="w-64 h-5" />
          </div>
        </div>
        <Skeleton className="w-full h-14 rounded-xl" />
        <Skeleton className="w-full h-52 rounded-2xl" />
        <Skeleton className="w-full h-36 rounded-2xl" />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
        <span className="text-4xl">🔍</span>
        <p className="text-sm font-medium">Query not found</p>
        <button
          onClick={() => navigate('/instructor')}
          className="mt-2 text-xs text-indigo-400 hover:underline cursor-pointer"
        >
          ← Back to dashboard
        </button>
      </div>
    );
  }

  /* ── Main render ────────────────────────────────────────── */
  return (
    <div className="space-y-5 max-w-4xl mx-auto">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start gap-3 pb-5 border-b border-slate-800/80">
        <button
          onClick={() => navigate('/instructor')}
          className="mt-0.5 p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
              <Hash className="w-2.5 h-2.5" />
              {query.id}
            </span>
            <StatusBadge status={query.status} />
            <PriorityBadge priority={query.priority} />
            {query.course_code && (
              <span className="text-[11px] bg-indigo-500/10 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                {query.course_code}
              </span>
            )}
          </div>
          <h1 className="text-lg font-bold text-slate-100 leading-snug truncate">
            {query.subject}
          </h1>
        </div>
      </div>

      {/* ── Student info strip ─────────────────────────────── */}
      <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-slate-800 bg-slate-800">
        {[
          { icon: User, label: 'Student', value: query.student_name },
          { icon: Mail, label: 'Email', value: query.student_email },
          { icon: Calendar, label: 'Received', value: formatDate(query.created_at) },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-3 bg-slate-900/70"
          >
            <Icon className="w-4 h-4 text-slate-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 block">
                {label}
              </span>
              <span className="text-xs font-semibold text-slate-200 truncate block">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── AI Draft panel ─────────────────────────────────── */}
      {query.ai_draft && (
        <AiDraftPanel
          draft={query.ai_draft}
          onApplyDraft={handleApplyDraft}
        />
      )}

      {/* ── Query thread ───────────────────────────────────── */}
      <QueryThread query={query} replies={query.replies} />

      {/* ── Reply editor ───────────────────────────────────── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Draft / Send Response
          </h3>
        </div>
        <ReplyEditor
          key={editorText}
          initialContent={editorText}
          aiDraftId={appliedDraftId}
          isSubmitting={replyMutation.isPending}
          onSubmit={(data) => replyMutation.mutate(data)}
        />
      </div>
    </div>
  );
}
