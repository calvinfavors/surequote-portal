import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionStatus: string;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const ACTIVE_STATUSES = ['active', 'trialing'];

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session, loading: authLoading } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const syncFromStripe = useCallback(async () => {
    if (!session) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      );
      const data = await response.json();
      if (data.synced && data.status) {
        setSubscriptionStatus(data.status);
      }
    } catch {
      // Sync failed silently; DB status will be used
    }
  }, [session]);

  const fetchStatus = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus('');
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .maybeSingle();

    const dbStatus = data?.subscription_status || '';
    setSubscriptionStatus(dbStatus);

    if (!ACTIVE_STATUSES.includes(dbStatus)) {
      await syncFromStripe();
    }

    setLoading(false);
  }, [user, syncFromStripe]);

  useEffect(() => {
    if (!authLoading) {
      fetchStatus();
    }
  }, [authLoading, fetchStatus]);

  const isSubscribed = ACTIVE_STATUSES.includes(subscriptionStatus);

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, subscriptionStatus, loading, refresh: fetchStatus }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
  return context;
}
