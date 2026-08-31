import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Quoter } from '../lib/types';
import QuoterWidget from '../components/QuoterWidget';

export default function EmbedPreview() {
  const { slug } = useParams();
  const [quoter, setQuoter] = useState<Quoter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    loadQuoter();
  }, [slug]);

  const loadQuoter = async () => {
    const { data, error: err } = await supabase
      .from('quoters')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (err || !data) {
      setError('Quoter not found or inactive.');
    } else {
      setQuoter(data as Quoter);
      trackEvent('view');
    }
    setLoading(false);
  };

  const trackEvent = async (eventType: string, metadata: Record<string, unknown> = {}) => {
    if (!quoter && eventType === 'view') {
      const { data } = await supabase.from('quoters').select('id, user_id').eq('slug', slug).maybeSingle();
      if (data) {
        await supabase.from('quoter_events').insert({
          quoter_id: data.id,
          user_id: data.user_id,
          event_type: eventType,
          metadata,
        });
      }
      return;
    }
    if (!quoter) return;
    await supabase.from('quoter_events').insert({
      quoter_id: quoter.id,
      user_id: quoter.user_id,
      event_type: eventType,
      metadata,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !quoter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">{error || 'Quoter not found.'}</p>
      </div>
    );
  }

  return <QuoterWidget quoter={quoter} onEvent={trackEvent} />;
}
