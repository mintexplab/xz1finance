import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string | null;
  category: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecurringTransactionInput {
  name: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string | null;
  category: string;
  currency?: string;
  is_active?: boolean;
}

export function useRecurringTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const callEdgeFunction = async (action: string, data?: any, id?: string) => {
    const { data: result, error } = await supabase.functions.invoke('recurring-transactions', {
      body: { action, userId, data, id },
    });

    if (error) throw error;
    return result;
  };

  const fetchTransactions = async () => {
    if (!userId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await callEdgeFunction('list');
      setTransactions(result.transactions || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching recurring transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch recurring transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (input: RecurringTransactionInput) => {
    if (!userId) return { error: new Error('Not authenticated') };

    try {
      const result = await callEdgeFunction('create', {
        ...input,
        currency: input.currency || 'CAD',
        is_active: input.is_active ?? true,
      });

      setTransactions(prev => [result.transaction, ...prev]);
      toast({
        title: 'Success',
        description: 'Recurring transaction added',
      });
      return { data: result.transaction };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error adding recurring transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add recurring transaction',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const updateTransaction = async (id: string, updates: Partial<RecurringTransactionInput>) => {
    try {
      const result = await callEdgeFunction('update', updates, id);

      setTransactions(prev =>
        prev.map(t => (t.id === id ? result.transaction : t))
      );
      toast({
        title: 'Success',
        description: 'Recurring transaction updated',
      });
      return { data: result.transaction };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating recurring transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to update recurring transaction',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await callEdgeFunction('delete', undefined, id);

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: 'Success',
        description: 'Recurring transaction deleted',
      });
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting recurring transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete recurring transaction',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateTransaction(id, { is_active: isActive });
  };

  // Calculate total recurring impact for a given period
  const calculateRecurringTotal = (startDate: Date, endDate: Date) => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.filter(t => t.is_active).forEach(transaction => {
      const occurrences = countOccurrences(transaction, startDate, endDate);
      const amount = transaction.amount * occurrences;

      if (transaction.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }
    });

    return { totalIncome, totalExpense, net: totalIncome - totalExpense };
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleActive,
    calculateRecurringTotal,
    refetch: fetchTransactions,
  };
}

// Helper function to count occurrences of a recurring transaction in a date range
function countOccurrences(
  transaction: RecurringTransaction,
  rangeStart: Date,
  rangeEnd: Date
): number {
  const txStart = new Date(transaction.start_date);
  const txEnd = transaction.end_date ? new Date(transaction.end_date) : null;

  // Adjust effective range
  const effectiveStart = txStart > rangeStart ? txStart : rangeStart;
  const effectiveEnd = txEnd && txEnd < rangeEnd ? txEnd : rangeEnd;

  if (effectiveStart > effectiveEnd) return 0;

  let count = 0;
  let currentDate = new Date(txStart);

  while (currentDate <= effectiveEnd) {
    if (currentDate >= effectiveStart) {
      count++;
    }

    switch (transaction.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'biweekly':
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
  }

  return count;
}
