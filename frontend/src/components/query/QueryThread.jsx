import React from 'react';
import { formatDate } from '../../lib/format';
import { User, Shield, CheckCircle, FileText, CornerDownRight } from 'lucide-react';

export function QueryThread({ query, replies = [] }) {
  if (!query) return null;

  return (
    <div className="space-y-6">
      {/* Original student submission card */}
      <div className="glass-panel p-5 sm:p-6 border border-slate-800 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 via-indigo-600 to-cyan-500" />
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shadow-inner">
              {query.student_name ? query.student_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">{query.student_name || 'Student'}</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {query.student_email} • via <span className="text-indigo-400 capitalize">{query.channel}</span>
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">{formatDate(query.created_at)}</span>
        </div>

        <h3 className="text-base font-bold text-slate-100 mb-2.5">{query.subject || 'No Subject'}</h3>
        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
          {query.text}
        </p>

        {query.attachments && query.attachments.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex flex-wrap gap-2">
            {query.attachments.map((att) => (
              <div
                key={att.id}
                className="inline-flex items-center gap-2 text-xs bg-slate-800/90 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700/80 hover:border-slate-600 transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium">{att.file_name}</span>
                <span className="text-slate-400 font-mono">({Math.round(att.size_bytes / 1024)} KB)</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Replies list */}
      {replies.length > 0 && (
        <div className="space-y-4 pl-3 sm:pl-5 border-l-2 border-indigo-500/30 ml-2 sm:ml-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <CornerDownRight className="w-4 h-4 text-indigo-400" /> Responses ({replies.length})
          </h4>

          {replies.map((reply) => {
            const isStaff = reply.author_role === 'instructor' || reply.author_role === 'hod' || reply.author_role === 'admin';
            return (
              <div
                key={reply.id}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  isStaff
                    ? 'border-emerald-500/30 bg-emerald-950/15 shadow-sm shadow-emerald-950/20'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isStaff
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {isStaff ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-100">{reply.author_name}</span>
                      <span
                        className={`text-[10px] ml-2 uppercase font-bold px-2 py-0.5 rounded-full border ${
                          isStaff
                            ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20'
                        }`}
                      >
                        {reply.author_role}
                      </span>
                      {reply.is_draft && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{formatDate(reply.created_at)}</span>
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{reply.body}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
