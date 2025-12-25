import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StripeBalance {
  available: Array<{ amount: number; currency: string }>;
  pending: Array<{ amount: number; currency: string }>;
}

export interface StripeCharge {
  id: string;
  amount: number;
  amount_refunded: number;
  currency: string;
  status: string;
  created: number;
  description: string | null;
  customer: { email?: string; name?: string } | string | null;
  balance_transaction: {
    fee: number;
    net: number;
  } | string | null;
  metadata: Record<string, string>;
}

export interface StripePayout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  arrival_date: number;
  description: string | null;
}

export interface StripeBalanceTransaction {
  id: string;
  amount: number;
  fee: number;
  net: number;
  currency: string;
  type: string;
  created: number;
  description: string | null;
  status: string;
}

export interface DashboardSummary {
  balance: StripeBalance;
  charges: StripeCharge[];
  payouts: StripePayout[];
  balanceTransactions: StripeBalanceTransaction[];
}

export function useStripeData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callStripeFunction = useCallback(async <T>(action: string, params?: Record<string, unknown>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('stripe-data', {
        body: { action, params }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as T;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBalance = useCallback(() => 
    callStripeFunction<StripeBalance>('getBalance'), [callStripeFunction]);

  const getCharges = useCallback((params?: { limit?: number; created?: { gte?: number; lte?: number } }) => 
    callStripeFunction<{ data: StripeCharge[] }>('getCharges', params), [callStripeFunction]);

  const getPayouts = useCallback((params?: { limit?: number }) => 
    callStripeFunction<{ data: StripePayout[] }>('getPayouts', params), [callStripeFunction]);

  const getBalanceTransactions = useCallback((params?: { limit?: number; type?: string }) => 
    callStripeFunction<{ data: StripeBalanceTransaction[] }>('getBalanceTransactions', params), [callStripeFunction]);

  const getDashboardSummary = useCallback(() => 
    callStripeFunction<DashboardSummary>('getDashboardSummary'), [callStripeFunction]);

  return {
    loading,
    error,
    getBalance,
    getCharges,
    getPayouts,
    getBalanceTransactions,
    getDashboardSummary,
  };
}
