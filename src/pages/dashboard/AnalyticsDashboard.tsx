import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, MousePointerClick, FileCheck, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { Quoter, QuoterEvent } from '../../lib/types';

type DateRange = '7d' | '30d' | '90d' | 'all';

interface QuoterStats {
  quoter: Quoter;
  views: number;
  clicks: number;
  quotesCompleted: number;
  conversionRate: number;
}

interface DailyCount {
  date: string;
  views: number;
  clicks: number;
  quotes: number;
}

function getRangeStart(range: DateRange): string | null {
  if (range === 'all') return null;
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) {
    return <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">--</span>;
  }
  if (previous === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400">
        <ArrowUpRight size={12} /> New
      </span>
    );
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
        <Minus size={12} /> 0%
      </span>
    );
  }
  return pct > 0 ? (
    <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400">
      <ArrowUpRight size={12} /> {pct}%
    </span>
  ) : (
    <span className="inline-flex items-center gap-0.5 text-xs text-red-400">
      <ArrowDownRight size={12} /> {Math.abs(pct)}%
    </span>
  );
}

function MiniBarChart({ data, maxVal, color }: { data: number[]; maxVal: number; color: string }) {
  return (
    <div className="flex items-end gap-px h-16">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t-sm transition-all ${color} min-h-[2px]`}
          style={{ height: maxVal > 0 ? `${Math.max((v / maxVal) * 100, 3)}%` : '3%' }}
          title={`${v}`}
        />
      ))}
    </div>
  );
}

function FunnelBar({ label, value, max, color, icon: Icon }: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: typeof Eye;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} className={color.replace('bg-', 'text-').replace('/60', '')} />
          <span className="text-sm text-gray-300">{label}</span>
        </div>
        <span className="text-sm font-semibold text-white">{value.toLocaleString()}</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<QuoterEvent[]>([]);
  const [quoters, setQuoters] = useState<Quoter[]>([]);
  const [range, setRange] = useState<DateRange>('30d');
  const [loading, setLoading] = useState(true);
  const [selectedQuoter, setSelectedQuoter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const [quotersRes, eventsRes] = await Promise.all([
      supabase.from('quoters').select('*').eq('user_id', user!.id),
      supabase.from('quoter_events').select('*').eq('user_id', user!.id).order('created_at', { ascending: true }),
    ]);
    setQuoters((quotersRes.data || []) as Quoter[]);
    setEvents((eventsRes.data || []) as QuoterEvent[]);
    setLoading(false);
  };

  const filteredEvents = useMemo(() => {
    const start = getRangeStart(range);
    let filtered = events;
    if (start) {
      filtered = filtered.filter(e => e.created_at >= start);
    }
    if (selectedQuoter !== 'all') {
      filtered = filtered.filter(e => e.quoter_id === selectedQuoter);
    }
    return filtered;
  }, [events, range, selectedQuoter]);

  const previousEvents = useMemo(() => {
    if (range === 'all') return [];
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const now = new Date();
    const rangeStart = new Date(now);
    rangeStart.setDate(rangeStart.getDate() - days);
    const prevStart = new Date(rangeStart);
    prevStart.setDate(prevStart.getDate() - days);
    let filtered = events.filter(e => {
      const d = new Date(e.created_at);
      return d >= prevStart && d < rangeStart;
    });
    if (selectedQuoter !== 'all') {
      filtered = filtered.filter(e => e.quoter_id === selectedQuoter);
    }
    return filtered;
  }, [events, range, selectedQuoter]);

  const totals = useMemo(() => {
    const views = filteredEvents.filter(e => e.event_type === 'view').length;
    const clicks = filteredEvents.filter(e => e.event_type === 'click').length;
    const quotes = filteredEvents.filter(e => e.event_type === 'quote_completed').length;
    return { views, clicks, quotes };
  }, [filteredEvents]);

  const prevTotals = useMemo(() => {
    const views = previousEvents.filter(e => e.event_type === 'view').length;
    const clicks = previousEvents.filter(e => e.event_type === 'click').length;
    const quotes = previousEvents.filter(e => e.event_type === 'quote_completed').length;
    return { views, clicks, quotes };
  }, [previousEvents]);

  const dailyData = useMemo(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 30;
    const buckets: DailyCount[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      buckets.push({ date: key, views: 0, clicks: 0, quotes: 0 });
    }
    const bucketMap = new Map(buckets.map(b => [b.date, b]));
    for (const ev of filteredEvents) {
      const key = ev.created_at.split('T')[0];
      const bucket = bucketMap.get(key);
      if (!bucket) continue;
      if (ev.event_type === 'view') bucket.views++;
      else if (ev.event_type === 'click') bucket.clicks++;
      else if (ev.event_type === 'quote_completed') bucket.quotes++;
    }
    return buckets;
  }, [filteredEvents, range]);

  const quoterStats = useMemo((): QuoterStats[] => {
    const start = getRangeStart(range);
    return quoters.map(q => {
      let qEvents = events.filter(e => e.quoter_id === q.id);
      if (start) qEvents = qEvents.filter(e => e.created_at >= start);
      const views = qEvents.filter(e => e.event_type === 'view').length;
      const clicks = qEvents.filter(e => e.event_type === 'click').length;
      const quotesCompleted = qEvents.filter(e => e.event_type === 'quote_completed').length;
      return {
        quoter: q,
        views,
        clicks,
        quotesCompleted,
        conversionRate: views > 0 ? (quotesCompleted / views) * 100 : 0,
      };
    }).sort((a, b) => b.views - a.views);
  }, [quoters, events, range]);

  const chartMax = useMemo(() => {
    return Math.max(...dailyData.map(d => d.views), ...dailyData.map(d => d.clicks), ...dailyData.map(d => d.quotes), 1);
  }, [dailyData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const conversionRate = totals.views > 0 ? ((totals.quotes / totals.views) * 100).toFixed(1) : '0.0';
  const prevConversionRate = prevTotals.views > 0 ? (prevTotals.quotes / prevTotals.views) * 100 : 0;
  const currentConversionRate = totals.views > 0 ? (totals.quotes / totals.views) * 100 : 0;

  const statCards = [
    { label: 'Total Views', value: totals.views, prev: prevTotals.views, icon: Eye, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Address Clicks', value: totals.clicks, prev: prevTotals.clicks, icon: MousePointerClick, color: 'text-cyan-400 bg-cyan-500/10' },
    { label: 'Quotes Completed', value: totals.quotes, prev: prevTotals.quotes, icon: FileCheck, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Conversion Rate', value: conversionRate + '%', prev: -1, icon: TrendingUp, color: 'text-brand-400 bg-brand-500/10' },
  ];

  const rangeOptions: { value: DateRange; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: 'all', label: 'All time' },
  ];

  const labelInterval = range === '7d' ? 1 : range === '30d' ? 6 : range === '90d' ? 14 : 6;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Track how your quoters are performing.</p>
        </div>
        <div className="flex items-center gap-3">
          {quoters.length > 1 && (
            <select
              value={selectedQuoter}
              onChange={e => setSelectedQuoter(e.target.value)}
              className="bg-gray-800 border border-white/10 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              <option value="all">All Quoters</option>
              {quoters.map(q => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
          )}
          <div className="flex bg-gray-800 rounded-xl border border-white/10 p-0.5">
            {rangeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  range === opt.value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-gray-900/50 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon size={18} />
              </div>
              {card.prev !== -1 && range !== 'all' && (
                <TrendBadge current={card.value as number} previous={card.prev as number} />
              )}
              {card.prev === -1 && range !== 'all' && (
                <TrendBadge current={currentConversionRate} previous={prevConversionRate} />
              )}
            </div>
            <p className="text-2xl font-bold text-white">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Calendar size={16} className="text-gray-500" />
          <h2 className="text-base font-semibold text-white">Activity Over Time</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5">Daily breakdown of widget interactions</p>

        <div className="flex items-center gap-5 mb-4">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/60" /> Views
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/60" /> Clicks
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" /> Quotes
          </span>
        </div>

        <div className="space-y-4">
          <MiniBarChart data={dailyData.map(d => d.views)} maxVal={chartMax} color="bg-amber-500/60" />
          <MiniBarChart data={dailyData.map(d => d.clicks)} maxVal={chartMax} color="bg-cyan-500/60" />
          <MiniBarChart data={dailyData.map(d => d.quotes)} maxVal={chartMax} color="bg-emerald-500/60" />
        </div>

        <div className="flex justify-between mt-3">
          {dailyData.map((d, i) => (
            i % labelInterval === 0 || i === dailyData.length - 1 ? (
              <span key={d.date} className="text-[10px] text-gray-600">{formatDate(d.date)}</span>
            ) : (
              <span key={d.date} />
            )
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900/50 border border-white/5 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-1">Performance by Quoter</h2>
          <p className="text-xs text-gray-500 mb-5">Compare engagement across your quoters</p>

          {quoterStats.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm">No quoters yet. Create one to start tracking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-white/5">
                    <th className="text-left pb-3 font-medium">Quoter</th>
                    <th className="text-right pb-3 font-medium">Views</th>
                    <th className="text-right pb-3 font-medium">Clicks</th>
                    <th className="text-right pb-3 font-medium">Quotes</th>
                    <th className="text-right pb-3 font-medium">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {quoterStats.map(qs => (
                    <tr key={qs.quoter.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-white">{qs.quoter.name}</p>
                            <p className="text-xs text-gray-500">{qs.quoter.slug}</p>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            qs.quoter.status === 'active' ? 'bg-brand-500/10 text-brand-400' : 'bg-gray-700 text-gray-400'
                          }`}>
                            {qs.quoter.status}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3.5 text-gray-300">{qs.views.toLocaleString()}</td>
                      <td className="text-right py-3.5 text-gray-300">{qs.clicks.toLocaleString()}</td>
                      <td className="text-right py-3.5 text-gray-300">{qs.quotesCompleted.toLocaleString()}</td>
                      <td className="text-right py-3.5">
                        <span className={`font-semibold ${
                          qs.conversionRate >= 10 ? 'text-emerald-400' :
                          qs.conversionRate >= 5 ? 'text-amber-400' :
                          qs.conversionRate > 0 ? 'text-orange-400' : 'text-gray-500'
                        }`}>
                          {qs.conversionRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-1">Engagement Funnel</h2>
          <p className="text-xs text-gray-500 mb-5">How visitors progress through your widget</p>
          <div className="space-y-5">
            <FunnelBar label="Views" value={totals.views} max={totals.views} color="bg-amber-500/60" icon={Eye} />
            <FunnelBar label="Address Clicks" value={totals.clicks} max={totals.views} color="bg-cyan-500/60" icon={MousePointerClick} />
            <FunnelBar label="Quotes Completed" value={totals.quotes} max={totals.views} color="bg-emerald-500/60" icon={FileCheck} />
          </div>

          {totals.views > 0 && (
            <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">View to Click</span>
                <span className="text-gray-300 font-medium">
                  {((totals.clicks / totals.views) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Click to Quote</span>
                <span className="text-gray-300 font-medium">
                  {totals.clicks > 0 ? ((totals.quotes / totals.clicks) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Overall Conversion</span>
                <span className="text-brand-400 font-semibold">{conversionRate}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
