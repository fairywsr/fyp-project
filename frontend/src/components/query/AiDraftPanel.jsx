import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export function AiDraftPanel({ draft, onApplyDraft }) {
  if (!draft) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/30 via-slate-900/80 to-purple-950/20 relative overflow-hidden shadow-lg shadow-indigo-950/30 text-left">
      {/* Ambient background light */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between pb-3.5 border-b border-indigo-500/20 mb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
            <Sparkles className="w-4 h-4 animate-pulse-glow" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-300 tracking-wide uppercase block flex items-center gap-1.5">
              AI Suggested Response Draft
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              Model: {draft.model || 'Gemini 1.5 Pro'}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => onApplyDraft(draft.body, draft.id)}
          icon={ArrowRight}
        >
          Insert Draft
        </Button>
      </div>

      <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-500/20 leading-relaxed font-mono text-xs text-indigo-100/90 whitespace-pre-wrap shadow-inner relative z-10">
        "{draft.body}"
      </div>
    </div>
  );
}
