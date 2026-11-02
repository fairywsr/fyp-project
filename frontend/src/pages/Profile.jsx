import React, { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Shield, Phone, Check } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedMsg, setSavedMsg] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () => usersApi.updateProfile({ full_name: fullName.trim(), phone: phone.trim() }),
    onSuccess: (updatedUser) => {
      // update session storage
      sessionStorage.setItem('sqr_user', JSON.stringify(updatedUser));
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-100">User Profile & Contact Information</h2>
        <p className="text-xs text-slate-400 mt-1">Manage your university account name and contact number</p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4" /> Profile updated successfully!
        </div>
      )}

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">{user?.full_name}</h3>
            <span className="text-xs text-slate-400 block">{user?.email}</span>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {user?.role} Role
            </span>
          </div>
        </div>

        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Phone Number (Used to link WhatsApp queries to your account)"
          placeholder="+923001234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            isLoading={updateMutation.isPending}
            onClick={() => updateMutation.mutate()}
          >
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
