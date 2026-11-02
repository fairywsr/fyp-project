import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users.api';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Feedback';
import { Clock, ShieldAlert, Check } from 'lucide-react';

export function InstructorAvailability() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getProfile,
  });

  const [availability, setAvailability] = useState(profile?.availability || 'available');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(profile?.auto_reply_enabled || false);
  const [autoReplyMessage, setAutoReplyMessage] = useState(profile?.auto_reply_message || '');

  // Update local state when profile loads
  React.useEffect(() => {
    if (profile) {
      setAvailability(profile.availability);
      setAutoReplyEnabled(profile.auto_reply_enabled);
      setAutoReplyMessage(profile.auto_reply_message || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: () =>
      usersApi.updateAvailability({
        availability,
        auto_reply_enabled: autoReplyEnabled,
        auto_reply_message: autoReplyMessage,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Faculty Availability & Auto-Reply Settings</h2>
        <p className="text-xs text-slate-400 mt-1">
          When set to <strong>On Leave</strong>, inbound student queries are automatically reassigned to your Department HOD.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4" /> Availability preferences saved successfully!
        </div>
      )}

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        {/* Availability options */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
            Current Status
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'available', label: 'Available', desc: 'Accepting queries normally' },
              { id: 'away', label: 'Away', desc: 'Slower response times' },
              { id: 'on_leave', label: 'On Leave', desc: 'Auto-routes to HOD' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAvailability(opt.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  availability === opt.id
                    ? 'border-indigo-500 bg-indigo-600/15 shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold text-slate-100 block">{opt.label}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Auto reply message */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Automatic Acknowledgment Reply</span>
              <span className="text-[10px] text-slate-500">Sends immediate automated response to student</span>
            </div>
            <input
              type="checkbox"
              checked={autoReplyEnabled}
              onChange={(e) => setAutoReplyEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700 cursor-pointer"
            />
          </div>

          {autoReplyEnabled && (
            <Textarea
              label="Auto-Reply Content"
              rows={3}
              placeholder="e.g. I am currently out of office until Monday. Urgent queries have been routed to the HOD."
              value={autoReplyMessage}
              onChange={(e) => setAutoReplyMessage(e.target.value)}
            />
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            isLoading={updateMutation.isPending}
            onClick={() => updateMutation.mutate()}
          >
            Save Availability
          </Button>
        </div>
      </div>
    </div>
  );
}
