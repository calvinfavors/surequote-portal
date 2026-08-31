import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import type { Profile } from '../../../lib/types';
import { Save, Loader2, Upload, Trash2, Image, Palette } from 'lucide-react';

interface Props {
  profile: Profile | null;
  onSaved: () => void;
}

export default function BrandingSettings({ profile, onSaved }: Props) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#22c55e');

  useEffect(() => {
    if (profile) {
      setLogoUrl(profile.logo_url || '');
      setAccentColor(profile.accent_color || '#22c55e');
    }
  }, [profile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, SVG, etc.).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2MB.');
      return;
    }

    setError('');
    setUploading(true);

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/logo-${Date.now()}.${ext}`;

    if (logoUrl) {
      const oldPath = logoUrl.split('/logos/')[1];
      if (oldPath) {
        await supabase.storage.from('logos').remove([oldPath]);
      }
    }

    const { error: uploadErr } = await supabase.storage
      .from('logos')
      .upload(filePath, file, { upsert: true });

    if (uploadErr) {
      setError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(filePath);
    setLogoUrl(urlData.publicUrl);
    setUploading(false);
  };

  const removeLogo = async () => {
    if (!logoUrl || !user) return;
    const oldPath = logoUrl.split('/logos/')[1];
    if (oldPath) {
      await supabase.storage.from('logos').remove([oldPath]);
    }
    setLogoUrl('');
  };

  const handleSave = async () => {
    if (!user) return;
    setError('');
    setSaving(true);
    setSuccess(false);

    const { error: err } = await supabase
      .from('profiles')
      .update({
        logo_url: logoUrl,
        accent_color: accentColor,
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

  const presetColors = [
    { name: 'Green', hex: '#22c55e' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Sky', hex: '#0ea5e9' },
    { name: 'Teal', hex: '#14b8a6' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Cyan', hex: '#06b6d4' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Image size={18} className="text-brand-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Company Logo</h3>
            <p className="text-xs text-gray-500">Upload your logo. This appears on all your quoter widgets.</p>
          </div>
        </div>

        <div className="flex items-start gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-white/10 bg-gray-800/50 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-500/30">
              {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center">
                  <Image size={28} className="text-gray-600 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-600">No logo</span>
                </div>
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-gray-900/80 rounded-2xl flex items-center justify-center">
                <Loader2 size={20} className="text-brand-500 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <p className="text-sm text-gray-400">
              Recommended: Square image, at least 256x256px. PNG or SVG with transparent background works best.
            </p>
            <p className="text-xs text-gray-500">Maximum file size: 2MB</p>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/10 transition-all disabled:opacity-50"
              >
                <Upload size={14} />
                {logoUrl ? 'Replace Logo' : 'Upload Logo'}
              </button>
              {logoUrl && (
                <button
                  onClick={removeLogo}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/5 text-sm font-medium px-4 py-2 rounded-xl border border-white/10 transition-all"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Palette size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Accent Color</h3>
            <p className="text-xs text-gray-500">This color is used as the default for new quoters you create.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {presetColors.map((color) => (
              <button
                key={color.hex}
                onClick={() => setAccentColor(color.hex)}
                className={`group relative w-12 h-12 rounded-xl border-2 transition-all ${
                  accentColor === color.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:border-white/20 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {accentColor === color.hex && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="text-sm text-gray-400">Custom:</label>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-28 bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
            <div className="h-10 flex-1 rounded-xl" style={{ backgroundColor: accentColor }} />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm rounded-lg px-4 py-3">Branding saved successfully.</div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-600/25 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Branding
        </button>
      </div>
    </div>
  );
}
