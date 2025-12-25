import { ManualTransaction } from '@/hooks/useManualTransactions';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManualTransactionsTableProps {
  transactions: ManualTransaction[];
  loading?: boolean;
  onDelete: (id: string) => void;
}

export function ManualTransactionsTable({ transactions, loading, onDelete }: ManualTransactionsTableProps) {
  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-success border-success/30 bg-success/10';
      case 'expense':
        return 'text-destructive border-destructive/30 bg-destructive/10';
      case 'royalty':
        return 'text-primary border-primary/30 bg-primary/10';
      case 'adjustment':
        return 'text-warning border-warning/30 bg-warning/10';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Manual Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Date</th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Category</th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Type</th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Description</th>
              <th className="text-right p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Amount</th>
              <th className="text-center p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No manual transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="p-4 text-sm font-mono text-muted-foreground">
                    {formatDate(new Date(tx.transaction_date).getTime() / 1000)}
                  </td>
                  <td className="p-4 text-sm">{tx.category}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={cn('capitalize', getTypeColor(tx.type))}>
                      {tx.type}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {tx.description || '—'}
                  </td>
                  <td className="p-4 text-sm font-mono text-right font-medium">
                    {formatCurrency(Number(tx.amount), tx.currency)}
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(tx.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
