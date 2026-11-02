import React, { useState } from 'react';
import { Send, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';

export function ReplyEditor({ onSubmit, isSubmitting = false, initialContent = '', aiDraftId = null }) {
  const [body, setBody] = useState(initialContent);

  const handleSend = () => {
    if (!body.trim()) return;
    onSubmit({ body: body.trim(), send: true, ai_draft_id: aiDraftId });
  };

  const handleSaveDraft = () => {
    if (!body.trim()) return;
    onSubmit({ body: body.trim(), send: false, ai_draft_id: aiDraftId });
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
      <Textarea
        label="Your Response"
        rows={4}
        placeholder="Type response to student, or apply the AI draft above..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500">
          Sending reply moves status to <strong className="text-emerald-400">Resolved</strong> and emails the student.
        </span>
        <div className="flex items-center gap-2">
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
