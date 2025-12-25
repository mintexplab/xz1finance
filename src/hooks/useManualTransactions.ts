import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ManualTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'adjustment' | 'royalty' | 'transfer';
  category: string;
  description: string | null;
  transaction_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'adjustment' | 'royalty' | 'transfer';
  category: string;
  description?: string;
  transaction_date: string;
  notes?: string;
}

export function useManualTransactions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (dateRange?: { start: Date; end: Date }) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('manual_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (dateRange) {
        query = query
          .gte('transaction_date', dateRange.start.toISOString().split('T')[0])
          .lte('transaction_date', dateRange.end.toISOString().split('T')[0]);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      return data as ManualTransaction[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (input: CreateTransactionInput) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('manual_transactions')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data as ManualTransaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('manual_transactions')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
  };
}
