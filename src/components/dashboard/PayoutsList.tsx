import { StripePayout } from '@/hooks/useStripeData';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface PayoutsListProps {
  payouts: StripePayout[];
  loading?: boolean;
}

export function PayoutsList({ payouts, loading }: PayoutsListProps) {
  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Recent Payouts</h3>
      </div>
      <div className="divide-y divide-border/50">
        {payouts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No payouts found
          </div>
        ) : (
          payouts.slice(0, 10).map((payout) => (
            <div key={payout.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'p-2 rounded-lg',
                  payout.status === 'paid' ? 'bg-success/20' : 'bg-warning/20'
                )}>
                  {payout.status === 'paid' ? (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-warning" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-muted-foreground">
                    Arrives {formatDate(payout.arrival_date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-medium">
                  {formatCurrency(payout.amount, payout.currency)}
                </p>
                <Badge 
                  variant="outline" 
                  className={cn('capitalize text-xs', getStatusColor(payout.status))}
                >
                  {payout.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
