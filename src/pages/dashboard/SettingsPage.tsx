import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Profile } from '../../lib/types';
import ProfileSettings from './settings/ProfileSettings';
import BrandingSettings from './settings/BrandingSettings';
import NotificationSettings from './settings/NotificationSettings';
import AppearanceSettings from './settings/AppearanceSettings';
import AccountSettings from './settings/AccountSettings';
import { Building2, Image, Bell, Monitor, Shield } from 'lucide-react';

const tabs = [
  { key: 'profile' as const, label: 'Profile', icon: Building2, description: 'Company info & preferences' },
  { key: 'branding' as const, label: 'Branding', icon: Image, description: 'Logo & colors' },
  { key: 'notifications' as const, label: 'Notifications', icon: Bell, description: 'Email & SMS alerts' },
  { key: 'appearance' as const, label: 'Appearance', icon: Monitor, description: 'Theme & layout' },
  { key: 'account' as const, label: 'Account', icon: Shield, description: 'Security & password' },
];

type TabKey = typeof tabs[number]['key'];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    setProfile(data as Profile | null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account, branding, and notification preferences.</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        <nav className="lg:w-64 flex-shrink-0">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-2 lg:sticky lg:top-24">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              {tabs.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left whitespace-nowrap lg:whitespace-normal transition-all w-full ${
                      active
                        ? 'bg-brand-600/10 text-brand-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon size={18} className="flex-shrink-0" />
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium">{tab.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{tab.description}</p>
                    </div>
                    <span className="lg:hidden text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && <ProfileSettings profile={profile} onSaved={loadProfile} />}
          {activeTab === 'branding' && <BrandingSettings profile={profile} onSaved={loadProfile} />}
          {activeTab === 'notifications' && <NotificationSettings profile={profile} onSaved={loadProfile} />}
          {activeTab === 'appearance' && <AppearanceSettings profile={profile} onSaved={loadProfile} />}
          {activeTab === 'account' && <AccountSettings />}
        </div>
      </div>
    </div>
  );
}
