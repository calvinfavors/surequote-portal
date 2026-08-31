import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { INDUSTRIES } from '../../../lib/constants';
import type { Profile } from '../../../lib/types';
import { Save, Loader2, User, Building2, MapPin } from 'lucide-react';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Honolulu',
  'America/Phoenix',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Australia/Sydney',
  'Pacific/Auckland',
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY',
  'LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
  'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

interface Props {
  profile: Profile | null;
  onSaved: () => void;
}

export default function ProfileSettings({ profile, onSaved }: Props) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [defaultIndustry, setDefaultIndustry] = useState('gutters');

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || '');
      setPhone(profile.phone || '');
      setWebsite(profile.website || '');
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setZip(profile.zip || '');
      setTimezone(profile.timezone || 'America/New_York');
      setDefaultIndustry(profile.default_industry || 'gutters');
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
        company_name: companyName,
        phone,
        website,
        address,
        city,
        state,
        zip,
        timezone,
        default_industry: defaultIndustry,
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
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="space-y-8">
      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Building2 size={18} className="text-brand-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Company Information</h3>
            <p className="text-xs text-gray-500">Your business details used across quoters.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Company Name</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} placeholder="Acme Gutters LLC" />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="(555) 123-4567" />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://www.yourcompany.com" />
          </div>
          <div>
            <label className={labelClass}>Default Industry</label>
            <select value={defaultIndustry} onChange={(e) => setDefaultIndustry(e.target.value)} className={inputClass}>
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>{ind.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <MapPin size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Business Address</h3>
            <p className="text-xs text-gray-500">Your physical location for quotes and invoices.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Street Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="123 Main Street" />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Springfield" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>State</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
                <option value="">--</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>ZIP</label>
              <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} className={inputClass} placeholder="12345" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <User size={18} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Preferences</h3>
            <p className="text-xs text-gray-500">Regional and display preferences.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={user?.email || ''} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
            <p className="text-xs text-gray-500 mt-1">Login email cannot be changed here.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm rounded-lg px-4 py-3">Profile saved successfully.</div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-600/25 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Profile
        </button>
      </div>
    </div>
  );
}
