import { useEffect, useState, useCallback } from 'react';
import { useStripeData, DashboardSummary, StripeBalance } from '@/hooks/useStripeData';
import { formatCurrency } from '@/lib/formatters';
import { Header } from '@/components/dashboard/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { PayoutsList } from '@/components/dashboard/PayoutsList';
import { BalanceBreakdown } from '@/components/dashboard/BalanceBreakdown';
import { Wallet, TrendingUp, ArrowDownRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
  const { getDashboardSummary, loading, error } = useStripeData();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    const result = await getDashboardSummary();
    if (result) {
      setData(result);
      setLastUpdated(new Date());
      toast.success('Data refreshed');
    }
  }, [getDashboardSummary]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Calculate stats from real data
  const totalRevenue = data?.charges
    .filter(c => c.status === 'succeeded')
    .reduce((sum, c) => sum + c.amount, 0) || 0;

  const totalFees = data?.charges
    .filter(c => c.status === 'succeeded' && typeof c.balance_transaction === 'object')
    .reduce((sum, c) => {
      const bt = c.balance_transaction;
      return sum + (typeof bt === 'object' && bt ? bt.fee : 0);
    }, 0) || 0;

  const successfulPayments = data?.charges.filter(c => c.status === 'succeeded').length || 0;

  const availableBalance = data?.balance?.available?.reduce((sum, b) => sum + b.amount, 0) || 0;

  const primaryCurrency = data?.balance?.available?.[0]?.currency || 'cad';

  return (
    <div className="min-h-screen bg-background">
      {/* Background glow effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Header onRefresh={fetchData} loading={loading} lastUpdated={lastUpdated} />

      <main className="container mx-auto px-6 py-8 relative">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Available Balance"
            value={formatCurrency(availableBalance, primaryCurrency)}
            subtitle={primaryCurrency.toUpperCase()}
            icon={Wallet}
            variant="primary"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue, primaryCurrency)}
            subtitle="All time"
            icon={TrendingUp}
          />
          <StatCard
            title="Stripe Fees"
            value={formatCurrency(totalFees, primaryCurrency)}
            subtitle="Processing fees"
            icon={ArrowDownRight}
          />
          <StatCard
            title="Successful Payments"
            value={successfulPayments.toString()}
            subtitle="Last 100 transactions"
            icon={CreditCard}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions Table - Takes 2 columns */}
          <div className="lg:col-span-2">
            <TransactionTable 
              transactions={data?.charges.filter(c => c.status === 'succeeded') || []} 
              loading={loading && !data}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BalanceBreakdown 
              balance={data?.balance || null} 
              loading={loading && !data}
            />
            <PayoutsList 
              payouts={data?.payouts || []} 
              loading={loading && !data}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
