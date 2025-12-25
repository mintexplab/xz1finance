import { StripeCharge } from '@/hooks/useStripeData';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: StripeCharge[];
  loading?: boolean;
}

export function TransactionTable({ transactions, loading }: TransactionTableProps) {
  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Date</th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Description</th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Customer</th>
              <th className="text-right p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Amount</th>
              <th className="text-right p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Fee</th>
              <th className="text-right p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Net</th>
              <th className="text-center p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const customer = typeof tx.customer === 'object' && tx.customer 
                  ? tx.customer.email || tx.customer.name 
                  : null;
                const balanceTx = typeof tx.balance_transaction === 'object' && tx.balance_transaction
                  ? tx.balance_transaction
                  : null;

                return (
                  <tr key={tx.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="p-4 text-sm font-mono text-muted-foreground">
                      {formatDateTime(tx.created)}
                    </td>
                    <td className="p-4 text-sm">
                      {tx.description || tx.metadata?.product_name || 'Payment'}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {customer || '—'}
                    </td>
                    <td className="p-4 text-sm font-mono text-right">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="p-4 text-sm font-mono text-right text-muted-foreground">
                      {balanceTx ? formatCurrency(balanceTx.fee, tx.currency) : '—'}
                    </td>
                    <td className="p-4 text-sm font-mono text-right font-medium">
                      {balanceTx ? formatCurrency(balanceTx.net, tx.currency) : '—'}
                    </td>
                    <td className="p-4 text-center">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'capitalize',
                          getStatusColor(tx.status)
                        )}
                      >
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
