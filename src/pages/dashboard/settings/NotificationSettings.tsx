import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import type { Profile } from '../../../lib/types';
import { Save, Loader2, Bell, Mail, Smartphone } from 'lucide-react';

interface Props {
  profile: Profile | null;
  onSaved: () => void;
}

export default function NotificationSettings({ profile, onSaved }: Props) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [notificationEmail, setNotificationEmail] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  useEffect(() => {
    if (profile) {
      setNotificationEmail(profile.notification_email || '');
      setEmailNotifications(profile.email_notifications ?? true);
      setSmsNotifications(profile.sms_notifications ?? false);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setError('');
    setSaving(true);
    setSuccess(false);

    const { error: err } = await supabase
      .from('profiles')
      .update({
        notification_email: notificationEmail,
        email_notifications: emailNotifications,
        sms_notifications: smsNotifications,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      onSaved();
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  const inputClass = 'w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all';

  const toggleSwitch = (enabled: boolean, onChange: (val: boolean) => void) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-brand-600' : 'bg-gray-700'}`}
    >
      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Bell size={18} className="text-brand-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Notification Preferences</h3>
            <p className="text-xs text-gray-500">Choose how you'd like to be notified about new leads and activity.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start justify-between p-4 bg-gray-800/30 rounded-xl border border-white/5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mt-0.5">
                <Mail size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Email Notifications</p>
                <p className="text-xs text-gray-500 mt-0.5">Receive an email when a new lead is captured or a quote is generated.</p>
              </div>
            </div>
            {toggleSwitch(emailNotifications, setEmailNotifications)}
          </div>

          <div className="flex items-start justify-between p-4 bg-gray-800/30 rounded-xl border border-white/5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mt-0.5">
                <Smartphone size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">SMS Notifications</p>
                <p className="text-xs text-gray-500 mt-0.5">Get text messages for high-priority leads. Standard carrier rates may apply.</p>
              </div>
            </div>
            {toggleSwitch(smsNotifications, setSmsNotifications)}
          </div>
        </div>
      </div>

      {emailNotifications && (
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Mail size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Notification Email</h3>
              <p className="text-xs text-gray-500">Where to send lead notifications. Leave blank to use your login email.</p>
            </div>
          </div>
          <input
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            className={inputClass}
            placeholder={user?.email || 'notifications@company.com'}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm rounded-lg px-4 py-3">Notification preferences saved.</div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-600/25 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Notifications
        </button>
      </div>
    </div>
  );
}
