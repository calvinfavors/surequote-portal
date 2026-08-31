import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Loader2, Zap, ArrowRight, LogOut, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const included = [
  'All 5 industries included',
  'Unlimited quoters',
  'Satellite-powered measurements',
  'Auto-detect for gutters & roofing',
  'Full brand customization',
  'Embeddable on any website',
  'Built-in lead CRM',
  'Real-time analytics dashboard',
  'Unlimited leads',
  'Priority support',
];

export default function SubscribePage() {
  const { user, session, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const canceled = searchParams.get('canceled') === 'true';

  const handleCheckout = async () => {
    if (!session) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <img src="/image.png" alt="SureQuote AI" className="h-10 w-auto" />
            <span className="text-xl font-bold text-white">SureQuote<span className="text-brand-500">AI</span></span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Activate Your Account
          </h1>
          <p className="mt-3 text-gray-400 text-base max-w-md mx-auto">
            Get full access to SureQuote AI and start generating instant quotes for your customers.
          </p>
        </div>

        {canceled && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm rounded-xl px-4 py-3 mb-6">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>Checkout was canceled. You can try again whenever you're ready.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600/20 to-brand-500/5 border-b border-white/5 px-6 sm:px-8 py-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-brand-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">SureQuote AI Pro</h2>
                <p className="text-xs text-gray-400">Full access to all features</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-white">$99</span>
              <span className="text-gray-400 text-sm">/month</span>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Everything included</p>
            <ul className="space-y-3 mb-8">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={16} className="text-brand-500 flex-shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="group w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 hover:shadow-lg hover:shadow-brand-600/25"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Subscribe Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-3">
              Secure checkout powered by Stripe. Cancel anytime.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-xs text-gray-600">
            Signed in as <span className="text-gray-400">{user?.email}</span>
          </p>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
