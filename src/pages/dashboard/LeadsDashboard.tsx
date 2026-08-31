import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LEAD_STATUSES } from '../../lib/constants';
import type { Lead, Quoter } from '../../lib/types';
import { Users, Search, Filter, X, ChevronDown, Eye, MousePointerClick, TrendingUp, Calendar } from 'lucide-react';

export default function LeadsDashboard() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quoters, setQuoters] = useState<Quoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [quoterFilter, setQuoterFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');
  const [analytics, setAnalytics] = useState({ views: 0, clicks: 0, quotes: 0 });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const [leadsRes, quotersRes, eventsRes] = await Promise.all([
      supabase.from('leads').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('quoters').select('*').eq('user_id', user!.id),
      supabase.from('quoter_events').select('event_type').eq('user_id', user!.id),
    ]);

    setLeads((leadsRes.data || []) as Lead[]);
    setQuoters((quotersRes.data || []) as Quoter[]);

    const events = eventsRes.data || [];
    setAnalytics({
      views: events.filter((e) => e.event_type === 'view').length,
      clicks: events.filter((e) => e.event_type === 'click').length,
      quotes: events.filter((e) => e.event_type === 'quote_completed').length,
    });
    setLoading(false);
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', leadId);
    setLeads(leads.map((l) => l.id === leadId ? { ...l, status } : l));
    if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, status });
  };

  const updateLeadNotes = async (leadId: string) => {
    await supabase.from('leads').update({ notes, updated_at: new Date().toISOString() }).eq('id', leadId);
    setLeads(leads.map((l) => l.id === leadId ? { ...l, notes } : l));
  };

  const filteredLeads = leads.filter((lead) => {
    const matchSearch = !searchQuery ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    const matchStatus = !statusFilter || lead.status === statusFilter;
    const matchQuoter = !quoterFilter || lead.quoter_id === quoterFilter;
    return matchSearch && matchStatus && matchQuoter;
  });

  const getStatusStyle = (status: string) => {
    return LEAD_STATUSES.find((s) => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getQuoterName = (quoterId: string) => {
    return quoters.find((q) => q.id === quoterId)?.name || 'Unknown';
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
      <div>
        <h1 className="text-2xl font-bold text-white">Leads</h1>
        <p className="text-gray-400 text-sm mt-1">Track and manage your gutter quote leads.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Widget Views', value: analytics.views, icon: Eye, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Address Clicks', value: analytics.clicks, icon: MousePointerClick, color: 'text-cyan-400 bg-cyan-500/10' },
          { label: 'Quotes Completed', value: analytics.quotes, icon: TrendingUp, color: 'text-brand-400 bg-brand-500/10' },
          { label: 'Total Leads', value: leads.length, icon: Users, color: 'text-blue-400 bg-blue-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900/50 border border-white/5 rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
              <stat.icon size={16} />
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            placeholder="Search leads..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={quoterFilter}
          onChange={(e) => setQuoterFilter(e.target.value)}
          className="bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
        >
          <option value="">All Quoters</option>
          {quoters.map((q) => (
            <option key={q.id} value={q.id}>{q.name}</option>
          ))}
        </select>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-12 text-center">
          <Users size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {leads.length === 0 ? 'No leads yet' : 'No matching leads'}
          </h3>
          <p className="text-gray-500 text-sm">
            {leads.length === 0
              ? 'Leads will appear here when visitors use your embedded quoters.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Lead</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Address</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Quoter</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Quote</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => { setSelectedLead(lead); setNotes(lead.notes); }}
                    className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-white">{lead.name || 'No name'}</p>
                      <p className="text-xs text-gray-500">{lead.email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400 max-w-[200px] truncate">{lead.address}</td>
                    <td className="px-5 py-3 text-sm text-gray-400">{getQuoterName(lead.quoter_id)}</td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-brand-400">${lead.quoted_price.toLocaleString()}</span>
                      <span className="block text-xs text-gray-500">{lead.estimated_linear_feet} ft</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyle(lead.status)}`}>
                        {LEAD_STATUSES.find((s) => s.value === lead.status)?.label || lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedLead(null)} />
          <div className="relative w-full max-w-md h-full bg-gray-900 border-l border-white/10 overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-white/5 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Lead Details</h3>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Contact</h4>
                <p className="text-base font-semibold text-white">{selectedLead.name || 'No name'}</p>
                <p className="text-sm text-gray-400">{selectedLead.email}</p>
                {selectedLead.phone && <p className="text-sm text-gray-400">{selectedLead.phone}</p>}
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Property</h4>
                <p className="text-sm text-gray-300">{selectedLead.address}</p>
                <p className="text-sm text-gray-500 mt-1">{selectedLead.estimated_linear_feet} linear feet measured</p>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Quote Details</h4>
                <p className="text-2xl font-bold text-brand-400">${selectedLead.quoted_price.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-1">{selectedLead.selected_material}</p>
                {selectedLead.selected_addons?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedLead.selected_addons.map((addon) => (
                      <span key={addon} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">{addon}</span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {LEAD_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => updateLeadStatus(selectedLead.id, s.value)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                        selectedLead.status === s.value
                          ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                          : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Notes</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => updateLeadNotes(selectedLead.id)}
                  rows={4}
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-none"
                  placeholder="Add notes about this lead..."
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} />
                <span>Created {new Date(selectedLead.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
