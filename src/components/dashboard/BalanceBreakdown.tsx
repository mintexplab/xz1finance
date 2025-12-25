import { StripeBalance } from '@/hooks/useStripeData';
import { formatCurrency } from '@/lib/formatters';
import { Wallet, Clock, TrendingUp } from 'lucide-react';

interface BalanceBreakdownProps {
  balance: StripeBalance | null;
  loading?: boolean;
}

export function BalanceBreakdown({ balance, loading }: BalanceBreakdownProps) {
  if (loading || !balance) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const available = balance.available.reduce((sum, b) => {
    // Convert to CAD for display (simplified)
    return sum + b.amount;
  }, 0);

  const pending = balance.pending.reduce((sum, b) => {
    return sum + b.amount;
  }, 0);

  const total = available + pending;
  const primaryCurrency = balance.available[0]?.currency || 'cad';

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-6">Balance Breakdown</h3>
      
      <div className="space-y-6">
        {/* Total Balance */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground uppercase tracking-wider">Total Balance</span>
          </div>
          <p className="text-3xl font-bold font-mono gradient-text">
            {formatCurrency(total, primaryCurrency)}
          </p>
        </div>

        {/* Available */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-success" />
            <span className="text-sm">Available</span>
          </div>
          <span className="font-mono font-medium text-success">
            {formatCurrency(available, primaryCurrency)}
          </span>
        </div>

        {/* Pending */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-sm">Pending</span>
          </div>
          <span className="font-mono font-medium text-warning">
            {formatCurrency(pending, primaryCurrency)}
          </span>
        </div>

        {/* Currency breakdown */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">By Currency</p>
          <div className="space-y-2">
            {balance.available.map((b, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="uppercase text-muted-foreground">{b.currency}</span>
                <span className="font-mono">{formatCurrency(b.amount, b.currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
