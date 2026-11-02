import React from 'react';
import { formatDate } from '../../lib/format';
import { User, Shield, CheckCircle, FileText, CornerDownRight } from 'lucide-react';

export function QueryThread({ query, replies = [] }) {
  if (!query) return null;

  return (
    <div className="space-y-6">
      {/* Original student submission card */}
      <div className="glass-panel p-5 border border-slate-800 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              {query.student_name ? query.student_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">{query.student_name || 'Student'}</h4>
              <p className="text-xs text-slate-400">{query.student_email} • via {query.channel}</p>
            </div>
          </div>
          <span className="text-xs text-slate-400">{formatDate(query.created_at)}</span>
        </div>

        <h3 className="text-base font-bold text-slate-100 mb-2">{query.subject || 'No Subject'}</h3>
        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{query.text}</p>

        {query.attachments && query.attachments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap gap-2">
            {query.attachments.map((att) => (
              <div
                key={att.id}
                className="inline-flex items-center gap-1.5 text-xs bg-slate-800/90 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/60"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>{att.file_name}</span>
                <span className="text-slate-500">({Math.round(att.size_bytes / 1024)} KB)</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Replies list */}
      {replies.length > 0 && (
        <div className="space-y-4 pl-4 border-l-2 border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CornerDownRight className="w-4 h-4 text-slate-500" /> Responses ({replies.length})
          </h4>

          {replies.map((reply) => {
            const isStaff = reply.author_role === 'instructor' || reply.author_role === 'hod' || reply.author_role === 'admin';
            return (
              <div
                key={reply.id}
                className={`glass-panel p-4 rounded-xl border ${
                  isStaff ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      {isStaff ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200">{reply.author_name}</span>
                      <span className="text-[10px] text-emerald-400 ml-2 uppercase font-semibold">
                        {reply.author_role}
                      </span>
                      {reply.is_draft && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-400 rounded">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(reply.created_at)}</span>
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{reply.body}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
