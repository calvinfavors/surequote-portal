import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Shield, Key, Loader2, AlertTriangle } from 'lucide-react';

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordError('');
    setChangingPassword(true);
    setPasswordSuccess(false);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
    setChangingPassword(false);
  };

  const inputClass = 'w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="space-y-8">
      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Shield size={18} className="text-brand-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Account Details</h3>
            <p className="text-xs text-gray-500">Your login information and account status.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email Address</label>
            <div className="flex items-center gap-3">
              <input type="email" value={user?.email || ''} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Account ID</label>
            <input type="text" value={user?.id || ''} disabled className={`${inputClass} opacity-50 cursor-not-allowed font-mono text-xs`} />
          </div>
          <div>
            <label className={labelClass}>Member Since</label>
            <input
              type="text"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
              disabled
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
          </div>
          <div>
            <label className={labelClass}>Last Sign In</label>
            <input
              type="text"
              value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
              disabled
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Key size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Change Password</h3>
            <p className="text-xs text-gray-500">Update your account password. Use a strong, unique password.</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Confirm your new password"
            />
          </div>

          {passwordError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm rounded-lg px-4 py-3">Password updated successfully.</div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-5 py-2.5 rounded-xl text-sm border border-white/10 transition-all disabled:opacity-50"
          >
            {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
            Update Password
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-red-500/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Danger Zone</h3>
            <p className="text-xs text-gray-500">Irreversible account actions.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-white/5">
            <div>
              <p className="text-sm font-medium text-white">Sign Out Everywhere</p>
              <p className="text-xs text-gray-500 mt-0.5">Log out of all active sessions on all devices.</p>
            </div>
            <button
              onClick={signOut}
              className="text-sm font-medium text-red-400 hover:text-red-300 px-4 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/5 transition-all"
            >
              Sign Out
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-red-500/10">
            <div>
              <p className="text-sm font-medium text-white">Delete Account</p>
              <p className="text-xs text-gray-500 mt-0.5">Permanently remove your account and all associated data.</p>
            </div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-sm font-medium text-gray-400 hover:text-white px-3 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <a
                  href="mailto:support@gutterquote.ai?subject=Account%20Deletion%20Request"
                  className="text-sm font-medium text-white bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg transition-all inline-block"
                >
                  Contact Support
                </a>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm font-medium text-red-400 hover:text-red-300 px-4 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/5 transition-all"
              >
                Delete Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
