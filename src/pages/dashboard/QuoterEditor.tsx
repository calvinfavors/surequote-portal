import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DEFAULT_MATERIALS, DEFAULT_ADDONS, INDUSTRIES } from '../../lib/constants';
import { INDUSTRY_META } from '../../lib/types';
import type { Industry, QuoterConfig, QuoterBranding, MaterialConfig, AddonConfig } from '../../lib/types';
import { Save, Loader2, Plus, Trash2, Copy, Check, ArrowLeft, Droplets, Home, Columns3, Fence, TreePine } from 'lucide-react';

const industryIcons: Record<Industry, typeof Droplets> = {
  gutters: Droplets,
  roofs: Home,
  decks: Columns3,
  fences: Fence,
  landscaping: TreePine,
};

function getDefaultConfig(industry: Industry): QuoterConfig {
  const meta = INDUSTRY_META[industry];
  return {
    materials: DEFAULT_MATERIALS[industry],
    price_per_linear_foot: 0,
    add_ons: DEFAULT_ADDONS[industry],
    minimum_charge: 250,
    measurement_unit: meta.measurementUnit,
    measurement_label: meta.measurementLabel,
    material_label: meta.materialLabel,
    options_description: meta.optionsDescription,
  };
}

const defaultBranding: QuoterBranding = {
  primary_color: '#16a34a',
  secondary_color: '#000000',
  text_color: '#ffffff',
  font_family: 'Inter',
  logo_url: '',
  company_name: '',
  company_phone: '',
  company_email: '',
  button_radius: '8',
  show_powered_by: true,
};

export default function QuoterEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isNew = !id;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [industry, setIndustry] = useState<Industry>('gutters');
  const [config, setConfig] = useState<QuoterConfig>(getDefaultConfig('gutters'));
  const [branding, setBranding] = useState<QuoterBranding>(defaultBranding);
  const [activeTab, setActiveTab] = useState<'pricing' | 'branding' | 'embed'>('pricing');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id && user) loadQuoter();
  }, [id, user]);

  const loadQuoter = async () => {
    const { data } = await supabase.from('quoters').select('*').eq('id', id).maybeSingle();
    if (data) {
      setName(data.name);
      setSlug(data.slug);
      setIndustry((data.industry as Industry) || 'gutters');
      setConfig(data.config as QuoterConfig);
      setBranding(data.branding as QuoterBranding);
    }
    setLoading(false);
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (isNew) setSlug(generateSlug(val));
  };

  const handleIndustryChange = (ind: Industry) => {
    setIndustry(ind);
    if (isNew) {
      setConfig(getDefaultConfig(ind));
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required.');
      return;
    }
    setError('');
    setSaving(true);

    if (isNew) {
      const { data, error: err } = await supabase
        .from('quoters')
        .insert({ user_id: user!.id, name, slug, industry, config, branding })
        .select()
        .single();
      if (err) {
        setError(err.message.includes('duplicate') ? 'A quoter with this slug already exists.' : err.message);
        setSaving(false);
        return;
      }
      navigate(`/dashboard/quoters/${data.id}`, { replace: true });
    } else {
      const { error: err } = await supabase
        .from('quoters')
        .update({ name, slug, industry, config, branding, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (err) {
        setError(err.message);
      }
    }
    setSaving(false);
  };

  const addMaterial = () => {
    setConfig({ ...config, materials: [...config.materials, { name: '', pricePerFoot: 0 }] });
  };

  const updateMaterial = (idx: number, field: keyof MaterialConfig, value: string | number) => {
    const mats = [...config.materials];
    mats[idx] = { ...mats[idx], [field]: value };
    setConfig({ ...config, materials: mats });
  };

  const removeMaterial = (idx: number) => {
    setConfig({ ...config, materials: config.materials.filter((_, i) => i !== idx) });
  };

  const addAddon = () => {
    setConfig({ ...config, add_ons: [...config.add_ons, { name: '', pricePerFoot: 0 }] });
  };

  const updateAddon = (idx: number, field: keyof AddonConfig, value: string | number) => {
    const addons = [...config.add_ons];
    addons[idx] = { ...addons[idx], [field]: value };
    setConfig({ ...config, add_ons: addons });
  };

  const removeAddon = (idx: number) => {
    setConfig({ ...config, add_ons: config.add_ons.filter((_, i) => i !== idx) });
  };

  const embedCode = `<iframe src="${window.location.origin}/embed/${slug}" style="width:100%;height:700px;border:none;border-radius:12px;" title="${name}"></iframe>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const meta = INDUSTRY_META[industry];

  const tabs = [
    { key: 'pricing' as const, label: 'Pricing & Materials' },
    { key: 'branding' as const, label: 'Branding & Style' },
    { key: 'embed' as const, label: 'Embed Code' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard/quoters')} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{isNew ? 'New Quoter' : 'Edit Quoter'}</h1>
          <p className="text-gray-400 text-sm mt-0.5">Configure your quoting tool's pricing, branding, and embed options.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {isNew && (
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-3">Industry</h3>
          <div className="grid grid-cols-5 gap-2">
            {INDUSTRIES.map((ind) => {
              const Icon = industryIcons[ind.value];
              const selected = industry === ind.value;
              return (
                <button
                  key={ind.value}
                  onClick={() => handleIndustryChange(ind.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm transition-all ${
                    selected ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Icon size={22} />
                  <span className="font-medium text-xs">{ind.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isNew && (
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${INDUSTRY_META[industry].color}`}>
            {INDUSTRY_META[industry].label}
          </span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Quoter Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            placeholder={`e.g. My ${meta.label} Quote Tool`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Slug (URL identifier)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(generateSlug(e.target.value))}
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            placeholder={`my-${industry}-quote`}
          />
        </div>
      </div>

      <div className="flex gap-1 bg-gray-900/50 border border-white/5 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-all ${
              activeTab === tab.key
                ? 'bg-brand-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">{meta.materialLabel}s</h3>
              <button onClick={addMaterial} className="flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors">
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-3">
              {config.materials.map((mat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={mat.name}
                    onChange={(e) => updateMaterial(idx, 'name', e.target.value)}
                    className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    placeholder={`${meta.materialLabel} name`}
                  />
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      value={mat.pricePerFoot}
                      onChange={(e) => updateMaterial(idx, 'pricePerFoot', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-800 border border-white/10 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">/ft</span>
                  <button onClick={() => removeMaterial(idx)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Add-Ons</h3>
              <button onClick={addAddon} className="flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors">
                <Plus size={14} /> Add Add-On
              </button>
            </div>
            <div className="space-y-3">
              {config.add_ons.map((addon, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={addon.name}
                    onChange={(e) => updateAddon(idx, 'name', e.target.value)}
                    className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    placeholder="Add-on name"
                  />
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      value={addon.pricePerFoot || 0}
                      onChange={(e) => updateAddon(idx, 'pricePerFoot', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-800 border border-white/10 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">/ft</span>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      value={addon.priceEach || 0}
                      onChange={(e) => updateAddon(idx, 'priceEach', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-800 border border-white/10 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">each</span>
                  <button onClick={() => removeAddon(idx)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">General Settings</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Minimum Charge ($)</label>
                <input
                  type="number"
                  value={config.minimum_charge}
                  onChange={(e) => setConfig({ ...config, minimum_charge: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Colors</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'primary_color' as const, label: 'Primary Color' },
                { key: 'secondary_color' as const, label: 'Secondary Color' },
                { key: 'text_color' as const, label: 'Text Color' },
              ].map((c) => (
                <div key={c.key}>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">{c.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding[c.key]}
                      onChange={(e) => setBranding({ ...branding, [c.key]: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding[c.key]}
                      onChange={(e) => setBranding({ ...branding, [c.key]: e.target.value })}
                      className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Company Info</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={branding.company_name}
                  onChange={(e) => setBranding({ ...branding, company_name: e.target.value })}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone</label>
                <input
                  type="text"
                  value={branding.company_phone}
                  onChange={(e) => setBranding({ ...branding, company_phone: e.target.value })}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                <input
                  type="text"
                  value={branding.company_email}
                  onChange={(e) => setBranding({ ...branding, company_email: e.target.value })}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  placeholder="info@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Logo URL</label>
                <input
                  type="text"
                  value={branding.logo_url}
                  onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Style Options</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Font Family</label>
                <select
                  value={branding.font_family}
                  onChange={(e) => setBranding({ ...branding, font_family: e.target.value })}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                >
                  {['Inter', 'Arial', 'Georgia', 'Verdana', 'Helvetica', 'Times New Roman'].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Button Radius (px)</label>
                <input
                  type="number"
                  value={branding.button_radius}
                  onChange={(e) => setBranding({ ...branding, button_radius: e.target.value })}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={branding.show_powered_by}
                  onChange={(e) => setBranding({ ...branding, show_powered_by: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 text-brand-500 focus:ring-brand-500 bg-gray-800"
                />
                <label className="text-sm text-gray-300">Show "Powered by SureQuote AI"</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'embed' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-2">Embed Code</h3>
            <p className="text-sm text-gray-400 mb-4">Copy this code and paste it into your website's HTML where you want the quoter to appear.</p>
            <div className="relative">
              <pre className="bg-gray-800 border border-white/10 rounded-xl p-4 text-sm text-brand-400 overflow-x-auto">
                {embedCode}
              </pre>
              <button
                onClick={copyEmbed}
                className="absolute top-3 right-3 flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
              >
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          </div>

          {slug && (
            <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-2">Live Preview</h3>
              <p className="text-sm text-gray-400 mb-4">This is how your quoter will look when embedded.</p>
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <iframe
                  src={`/embed/${slug}`}
                  className="w-full h-[700px] border-0"
                  title="Quoter Preview"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        <button
          onClick={() => navigate('/dashboard/quoters')}
          className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-600/25 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isNew ? 'Create Quoter' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
