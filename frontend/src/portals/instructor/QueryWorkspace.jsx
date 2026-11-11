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
import { ArrowLeft, User, Mail, Calendar } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto text-left">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-48 h-4" />
            <Skeleton className="w-72 h-6" />
          </div>
        </div>
        <Skeleton className="w-full h-12 rounded-xl" />
        <Skeleton className="w-full h-48 rounded-2xl" />
        <Skeleton className="w-full h-32 rounded-2xl" />
      </div>
    );
  }

  if (!query) {
    return <div className="text-center py-12 text-slate-400">Query not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <button
          onClick={() => navigate('/instructor')}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400">Query #{query.id}</span>
            <StatusBadge status={query.status} />
            <PriorityBadge priority={query.priority} />
            {query.course_code && (
              <span className="text-xs bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                {query.course_code}
              </span>
            )}
          </div>
          <h1 className="text-lg font-bold text-slate-100 mt-1">{query.subject}</h1>
        </div>
      </div>

      {/* Student info strip */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-500" />
          <span>Student: <strong className="text-slate-200">{query.student_name}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-500" />
          <span>{query.student_email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Received: {formatDate(query.created_at)}</span>
        </div>
      </div>

      {/* AI Draft Suggestion Panel */}
      {query.ai_draft && (
        <AiDraftPanel
          draft={query.ai_draft}
          onApplyDraft={handleApplyDraft}
        />
      )}

      {/* Query thread history */}
      <QueryThread query={query} replies={query.replies} />

      {/* Reply editor */}
      <div className="pt-2">
        <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">
          Draft or Send Response
        </h3>
        <ReplyEditor
          key={editorText} // Re-render when draft applied
          initialContent={editorText}
          aiDraftId={appliedDraftId}
          isSubmitting={replyMutation.isPending}
          onSubmit={(data) => replyMutation.mutate(data)}
        />
      </div>
    </div>
  );
}
