import { useState, useCallback } from 'react';
import { toast } from 'sonner';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manual-transactions`;

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

export function useManualTransactions(userId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (dateRange?: { start: Date; end: Date }) => {
    if (!userId) return [];
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list',
          userId,
          startDate: dateRange?.start.toISOString().split('T')[0],
          endDate: dateRange?.end.toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch transactions');
      }

      const data = await response.json();
      return data.transactions as ManualTransaction[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createTransaction = useCallback(async (input: CreateTransactionInput) => {
    if (!userId) {
      toast.error('Not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          userId,
          data: input,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create transaction');
      }

      const data = await response.json();
      return data.transaction as ManualTransaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          userId,
          id,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete transaction');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    loading,
    error,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
  };
}
