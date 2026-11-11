import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users.api';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Feedback';
import { Clock, ShieldAlert, Check, Wifi, WifiOff, Info } from 'lucide-react';

const STATUS_OPTIONS = [
  {
    id: 'available',
    label: 'Available',
    desc: 'Accepting queries normally',
    icon: Wifi,
    color: 'emerald',
    activeClass: 'border-emerald-500 bg-emerald-500/10 shadow-sm shadow-emerald-500/10',
    iconClass: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  {
    id: 'away',
    label: 'Away',
    desc: 'Slower response times expected',
    icon: Clock,
    color: 'amber',
    activeClass: 'border-amber-500 bg-amber-500/10 shadow-sm shadow-amber-500/10',
    iconClass: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  {
    id: 'on_leave',
    label: 'On Leave',
    desc: 'Routes new queries to HOD',
    icon: WifiOff,
    color: 'red',
    activeClass: 'border-red-500 bg-red-500/10 shadow-sm shadow-red-500/10',
    iconClass: 'text-red-400',
    dot: 'bg-red-500',
  },
];

export function InstructorAvailability() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getProfile,
  });

  const [availability, setAvailability] = useState(
    profile?.availability || 'available'
  );
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(
    profile?.auto_reply_enabled || false
  );
  const [autoReplyMessage, setAutoReplyMessage] = useState(
    profile?.auto_reply_message || ''
  );

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
      setTimeout(() => setSuccessMsg(false), 3500);
    },
  });

  /* ── Loading ──────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  const activeOption = STATUS_OPTIONS.find((o) => o.id === availability);

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          Availability &amp; Auto-Reply
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Control your status and configure automatic student acknowledgements
        </p>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-medium">
          <Check className="w-4 h-4 shrink-0" />
          Availability preferences saved successfully.
        </div>
      )}

      {/* Status card */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">

        {/* Status selector */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block mb-3">
            Current Status
          </label>
          <div className="grid grid-cols-3 gap-3">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = availability === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAvailability(opt.id)}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer group ${
                    isActive
                      ? opt.activeClass
                      : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-2 h-2 rounded-full ${isActive ? opt.dot : 'bg-slate-700'} transition-colors`}
                    />
                    <Icon
                      className={`w-3.5 h-3.5 ${isActive ? opt.iconClass : 'text-slate-600'} transition-colors`}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-100 block">
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* On-leave info banner */}
          {availability === 'on_leave' && (
            <div className="mt-3 flex items-start gap-2 px-3.5 py-2.5 bg-red-500/8 border border-red-500/20 rounded-lg text-[11px] text-red-400 leading-relaxed">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              New inbound queries will be automatically reassigned to your
              Department HOD while you are on leave.
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800/80" />

        {/* Auto-reply toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                Automatic Acknowledgment
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Send an instant automated response when a student submits a query
              </span>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={autoReplyEnabled}
              onClick={() => setAutoReplyEnabled((v) => !v)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                autoReplyEnabled
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-slate-700 border-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                  autoReplyEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {autoReplyEnabled && (
            <div className="pt-1">
              <Textarea
                label="Auto-Reply Message"
                rows={4}
                placeholder="e.g. Thank you for your query. I am currently out of office until Monday. Urgent matters have been routed to the HOD."
                value={autoReplyMessage}
                onChange={(e) => setAutoReplyMessage(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-600">
            Changes apply immediately after saving
          </span>
          <Button
            variant="primary"
            isLoading={updateMutation.isPending}
            onClick={() => updateMutation.mutate()}
          >
            Save Changes
          </Button>
        </div>
      </section>
    </div>
  );
}
