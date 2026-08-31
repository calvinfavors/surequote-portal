import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calculator, Users, Eye, MousePointerClick, TrendingUp, Plus } from 'lucide-react';
import type { Quoter, Lead } from '../../lib/types';

interface Stats {
  totalQuoters: number;
  activeQuoters: number;
  totalLeads: number;
  totalViews: number;
  totalClicks: number;
  totalQuotesGenerated: number;
  recentLeads: Lead[];
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalQuoters: 0,
    activeQuoters: 0,
    totalLeads: 0,
    totalViews: 0,
    totalClicks: 0,
    totalQuotesGenerated: 0,
    recentLeads: [],
  });
  const [quoters, setQuoters] = useState<Quoter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user]);

  const loadStats = async () => {
    const [quotersRes, leadsRes, eventsRes] = await Promise.all([
      supabase.from('quoters').select('*').eq('user_id', user!.id),
      supabase.from('leads').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('quoter_events').select('event_type').eq('user_id', user!.id),
    ]);

    const quotersList = (quotersRes.data || []) as Quoter[];
    const leadsList = (leadsRes.data || []) as Lead[];
    const events = eventsRes.data || [];

    setQuoters(quotersList);
    setStats({
      totalQuoters: quotersList.length,
      activeQuoters: quotersList.filter((q) => q.status === 'active').length,
      totalLeads: leadsList.length,
      totalViews: events.filter((e) => e.event_type === 'view').length,
      totalClicks: events.filter((e) => e.event_type === 'click').length,
      totalQuotesGenerated: events.filter((e) => e.event_type === 'quote_completed').length,
      recentLeads: leadsList,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Active Quoters', value: stats.activeQuoters, icon: Calculator, color: 'text-brand-500 bg-brand-500/10' },
    { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Widget Views', value: stats.totalViews, icon: Eye, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Widget Clicks', value: stats.totalClicks, icon: MousePointerClick, color: 'text-cyan-400 bg-cyan-500/10' },
    { label: 'Quotes Generated', value: stats.totalQuotesGenerated, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Overview of your SureQuote AI account.</p>
        </div>
        <Link
          to="/dashboard/quoters/new"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-600/25"
        >
          <Plus size={16} /> New Quoter
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-gray-900/50 border border-white/5 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Quoters</h2>
            <Link to="/dashboard/quoters" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              View All
            </Link>
          </div>
          {quoters.length === 0 ? (
            <div className="text-center py-8">
              <Calculator size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No quoters yet.</p>
              <Link to="/dashboard/quoters/new" className="text-brand-400 text-sm hover:text-brand-300 mt-2 inline-block">
                Create your first quoter
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {quoters.slice(0, 5).map((quoter) => (
                <Link
                  key={quoter.id}
                  to={`/dashboard/quoters/${quoter.id}`}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-white/5 hover:border-brand-500/20 transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{quoter.name}</p>
                    <p className="text-xs text-gray-500">{quoter.slug}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${quoter.status === 'active' ? 'bg-brand-500/10 text-brand-400' : 'bg-gray-700 text-gray-400'}`}>
                    {quoter.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
            <Link to="/dashboard/leads" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              View All
            </Link>
          </div>
          {stats.recentLeads.length === 0 ? (
            <div className="text-center py-8">
              <Users size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No leads yet.</p>
              <p className="text-gray-600 text-xs mt-1">Leads will appear here when visitors use your quoters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{lead.name || lead.email}</p>
                    <p className="text-xs text-gray-500">{lead.address}</p>
                  </div>
                  <span className="text-sm font-bold text-brand-400">${lead.quoted_price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
