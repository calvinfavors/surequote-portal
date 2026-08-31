import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import type { Profile } from '../../../lib/types';
import { Save, Loader2, Monitor, Moon, Sun, LayoutGrid, LayoutList } from 'lucide-react';

interface Props {
  profile: Profile | null;
  onSaved: () => void;
}

export default function AppearanceSettings({ profile, onSaved }: Props) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>('dark');
  const [dashboardLayout, setDashboardLayout] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (profile) {
      setThemeMode(profile.theme_mode || 'dark');
      setDashboardLayout(profile.dashboard_layout || 'grid');
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
        theme_mode: themeMode,
        dashboard_layout: dashboardLayout,
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

  const themes = [
    { value: 'dark' as const, label: 'Dark', icon: Moon, description: 'Easy on the eyes, great for night use.', preview: 'bg-gray-900 border-gray-700' },
    { value: 'light' as const, label: 'Light', icon: Sun, description: 'Classic bright interface.', preview: 'bg-gray-100 border-gray-300' },
    { value: 'system' as const, label: 'System', icon: Monitor, description: 'Follows your OS preference.', preview: 'bg-gradient-to-r from-gray-100 to-gray-900 border-gray-500' },
  ];

  const layouts = [
    { value: 'grid' as const, label: 'Grid View', icon: LayoutGrid, description: 'Cards arranged in a grid layout.' },
    { value: 'list' as const, label: 'List View', icon: LayoutList, description: 'Compact list for dense information.' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Monitor size={18} className="text-brand-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Theme</h3>
            <p className="text-xs text-gray-500">Choose how the dashboard looks.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {themes.map((theme) => {
            const selected = themeMode === theme.value;
            return (
              <button
                key={theme.value}
                onClick={() => setThemeMode(theme.value)}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 text-sm transition-all ${
                  selected
                    ? 'border-brand-500 bg-brand-500/5'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <div className={`w-full h-16 rounded-lg border ${theme.preview}`} />
                <div className="flex items-center gap-2">
                  <theme.icon size={16} className={selected ? 'text-brand-400' : 'text-gray-400'} />
                  <span className={`font-medium ${selected ? 'text-white' : 'text-gray-400'}`}>{theme.label}</span>
                </div>
                <p className="text-xs text-gray-500 text-center leading-relaxed">{theme.description}</p>
                {selected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <LayoutGrid size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Dashboard Layout</h3>
            <p className="text-xs text-gray-500">How quoters and leads are displayed in lists.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {layouts.map((layout) => {
            const selected = dashboardLayout === layout.value;
            return (
              <button
                key={layout.value}
                onClick={() => setDashboardLayout(layout.value)}
                className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                  selected
                    ? 'border-brand-500 bg-brand-500/5'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selected ? 'bg-brand-500/10' : 'bg-gray-800'
                }`}>
                  <layout.icon size={22} className={selected ? 'text-brand-400' : 'text-gray-500'} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-400'}`}>{layout.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{layout.description}</p>
                </div>
                {selected && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm rounded-lg px-4 py-3">Appearance settings saved.</div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-600/25 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Appearance
        </button>
      </div>
    </div>
  );
}
