import React, { useState, useEffect } from 'react';
import { Send, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';

export function ReplyEditor({ onSubmit, isSubmitting = false, initialContent = '', aiDraftId = null }) {
  const [body, setBody] = useState(initialContent);

  useEffect(() => {
    setBody(initialContent);
  }, [initialContent]);

  const handleSend = () => {
    if (!body.trim()) return;
    onSubmit({ body: body.trim(), send: true, ai_draft_id: aiDraftId });
  };

  const handleSaveDraft = () => {
    if (!body.trim()) return;
    onSubmit({ body: body.trim(), send: false, ai_draft_id: aiDraftId });
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-left">
      <Textarea
        label="Your Official Response"
        rows={5}
        placeholder="Type response to student, or insert the Gemini AI draft above..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <span className="text-xs text-slate-400">
          Sending reply marks query <strong className="text-emerald-400 font-semibold">Resolved</strong> and dispatches email notification.
        </span>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSaveDraft}
            isLoading={isSubmitting}
            icon={Save}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSend}
            isLoading={isSubmitting}
            icon={Send}
          >
            Send Reply
          </Button>
        </div>
      </div>
    </div>
  );
}
