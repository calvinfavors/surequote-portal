import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Calculator, Copy, ExternalLink, Trash2, Check } from 'lucide-react';
import type { Quoter, Industry } from '../../lib/types';
import { INDUSTRY_META } from '../../lib/types';

export default function QuotersList() {
  const { user } = useAuth();
  const [quoters, setQuoters] = useState<Quoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadQuoters();
  }, [user]);

  const loadQuoters = async () => {
    const { data } = await supabase
      .from('quoters')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setQuoters((data || []) as Quoter[]);
    setLoading(false);
  };

  const deleteQuoter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quoter? This cannot be undone.')) return;
    await supabase.from('quoters').delete().eq('id', id);
    setQuoters(quoters.filter((q) => q.id !== id));
  };

  const toggleStatus = async (quoter: Quoter) => {
    const newStatus = quoter.status === 'active' ? 'inactive' : 'active';
    await supabase.from('quoters').update({ status: newStatus }).eq('id', quoter.id);
    setQuoters(quoters.map((q) => q.id === quoter.id ? { ...q, status: newStatus } : q));
  };

  const copyEmbedCode = (quoter: Quoter) => {
    const code = `<iframe src="${window.location.origin}/embed/${quoter.slug}" style="width:100%;height:700px;border:none;border-radius:12px;" title="${quoter.name}"></iframe>`;
    navigator.clipboard.writeText(code);
    setCopiedId(quoter.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quoters</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your embeddable quoting tools.</p>
        </div>
        <Link
          to="/dashboard/quoters/new"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-600/25"
        >
          <Plus size={16} /> New Quoter
        </Link>
      </div>

      {quoters.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-12 text-center">
          <Calculator size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No quoters yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first quoter to start generating instant quotes on your website.</p>
          <Link
            to="/dashboard/quoters/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
          >
            <Plus size={16} /> Create Quoter
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quoters.map((quoter) => (
            <div key={quoter.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-5 hover:border-brand-500/20 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white">{quoter.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${INDUSTRY_META[(quoter.industry as Industry) || 'gutters']?.color || 'bg-gray-700 text-gray-400'}`}>
                      {INDUSTRY_META[(quoter.industry as Industry) || 'gutters']?.label || 'Gutters'}
                    </span>
                    <span className="text-xs text-gray-500">/{quoter.slug}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleStatus(quoter)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                    quoter.status === 'active'
                      ? 'bg-brand-500/10 text-brand-400 hover:bg-brand-500/20'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {quoter.status}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <span>{(quoter.config.materials || []).length} materials</span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span>{(quoter.config.add_ons || []).length} add-ons</span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <Link
                  to={`/dashboard/quoters/${quoter.id}`}
                  className="flex-1 text-center text-xs font-medium text-gray-400 hover:text-white py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  Edit
                </Link>
                <button
                  onClick={() => copyEmbedCode(quoter)}
                  className="flex items-center justify-center gap-1.5 flex-1 text-xs font-medium text-gray-400 hover:text-brand-400 py-2 rounded-lg hover:bg-brand-500/5 transition-all"
                >
                  {copiedId === quoter.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Embed</>}
                </button>
                <a
                  href={`/embed/${quoter.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center flex-1 text-xs font-medium text-gray-400 hover:text-white py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  <ExternalLink size={12} className="mr-1" /> Preview
                </a>
                <button
                  onClick={() => deleteQuoter(quoter.id)}
                  className="flex items-center justify-center text-xs text-gray-500 hover:text-red-400 py-2 px-2 rounded-lg hover:bg-red-500/5 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
