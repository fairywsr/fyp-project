import React from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';

export function AiDraftPanel({ draft, onApplyDraft }) {
  if (!draft) return null;

  return (
    <div className="glass-panel p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 relative overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-500/30 text-indigo-300 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-xs font-bold text-indigo-300 tracking-wide uppercase">
            AI Suggested Draft ({draft.model})
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onApplyDraft(draft.body, draft.id)}
          icon={ArrowRight}
        >
          Use Draft
        </Button>
      </div>

      <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-lg border border-indigo-500/10 leading-relaxed font-mono">
        "{draft.body}"
      </p>
    </div>
  );
}
