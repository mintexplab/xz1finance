import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripeData, DashboardSummary } from '@/hooks/useStripeData';
import { useManualTransactions, ManualTransaction } from '@/hooks/useManualTransactions';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/formatters';
import { Header } from '@/components/dashboard/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { PayoutsList } from '@/components/dashboard/PayoutsList';
import { BalanceBreakdown } from '@/components/dashboard/BalanceBreakdown';
import { AddTransactionDialog } from '@/components/dashboard/AddTransactionDialog';
import { DateRangeFilter, DateRange } from '@/components/dashboard/DateRangeFilter';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { ExportButton } from '@/components/dashboard/ExportButton';
import { ManualTransactionsTable } from '@/components/dashboard/ManualTransactionsTable';
import { Wallet, TrendingUp, ArrowDownRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { startOfYear } from 'date-fns';

export default function Index() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { getDashboardSummary, loading: stripeLoading, error: stripeError } = useStripeData();
  const { fetchTransactions, deleteTransaction, loading: txLoading } = useManualTransactions();
  
  const [stripeData, setStripeData] = useState<DashboardSummary | null>(null);
  const [manualTxs, setManualTxs] = useState<ManualTransaction[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [chartGroupBy, setChartGroupBy] = useState<'day' | 'week' | 'month'>('month');
  
  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfYear(new Date()),
    end: new Date(),
    label: 'This Year',
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loading = stripeLoading || txLoading;

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    const [stripeResult, manualResult] = await Promise.all([
      getDashboardSummary(),
      fetchTransactions(dateRange),
    ]);
    
    if (stripeResult) {
      setStripeData(stripeResult);
    }
    setManualTxs(manualResult);
    setLastUpdated(new Date());
    toast.success('Data refreshed');
  }, [getDashboardSummary, fetchTransactions, dateRange, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (stripeError) {
      toast.error(stripeError);
    }
  }, [stripeError]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    fetchTransactions(range).then(setManualTxs);
  };

  const handleDeleteTx = async (id: string) => {
    const success = await deleteTransaction(id);
    if (success) {
      toast.success('Transaction deleted');
      setManualTxs(manualTxs.filter(tx => tx.id !== id));
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Calculate stats from real data
  const totalRevenue = (stripeData?.charges
    .filter(c => c.status === 'succeeded')
    .reduce((sum, c) => sum + c.amount, 0) || 0) +
    manualTxs
      .filter(tx => tx.type === 'income' || tx.type === 'royalty')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalExpenses = manualTxs
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalFees = stripeData?.charges
    .filter(c => c.status === 'succeeded' && typeof c.balance_transaction === 'object')
    .reduce((sum, c) => {
      const bt = c.balance_transaction;
      return sum + (typeof bt === 'object' && bt ? bt.fee : 0);
    }, 0) || 0;

  const successfulPayments = (stripeData?.charges.filter(c => c.status === 'succeeded').length || 0) +
    manualTxs.filter(tx => tx.type === 'income').length;

  const availableBalance = stripeData?.balance?.available?.reduce((sum, b) => sum + b.amount, 0) || 0;
  const primaryCurrency = stripeData?.balance?.available?.[0]?.currency || 'cad';

  return (
    <div className="min-h-screen bg-background">
      {/* Background glow effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Header onRefresh={fetchData} loading={loading} lastUpdated={lastUpdated} />

      <main className="container mx-auto px-6 py-8 relative">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <DateRangeFilter value={dateRange} onChange={handleDateRangeChange} />
          <div className="flex items-center gap-3">
            <ExportButton 
              dateRange={dateRange} 
              stripeCharges={stripeData?.charges || []} 
              manualTransactions={manualTxs} 
            />
            <AddTransactionDialog onSuccess={fetchData} />
          </div>
        </div>

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
            subtitle="Stripe + Manual"
            icon={TrendingUp}
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses + totalFees, primaryCurrency)}
            subtitle="Expenses + Fees"
            icon={ArrowDownRight}
          />
          <StatCard
            title="Transactions"
            value={successfulPayments.toString()}
            subtitle="Income transactions"
            icon={CreditCard}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <Select value={chartGroupBy} onValueChange={(v) => setChartGroupBy(v as 'day' | 'week' | 'month')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">By Day</SelectItem>
                  <SelectItem value="week">By Week</SelectItem>
                  <SelectItem value="month">By Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <RevenueChart 
              stripeCharges={stripeData?.charges || []} 
              manualTransactions={manualTxs}
              groupBy={chartGroupBy}
            />
          </div>
          <CategoryBreakdown 
            stripeCharges={stripeData?.charges || []} 
            manualTransactions={manualTxs}
          />
        </div>

        {/* Transactions Tabs */}
        <Tabs defaultValue="stripe" className="mb-8">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="stripe">Stripe Transactions</TabsTrigger>
            <TabsTrigger value="manual">Manual Entries</TabsTrigger>
          </TabsList>
          <TabsContent value="stripe" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TransactionTable 
                  transactions={stripeData?.charges.filter(c => c.status === 'succeeded') || []} 
                  loading={loading && !stripeData}
                />
              </div>
              <div className="space-y-6">
                <BalanceBreakdown 
                  balance={stripeData?.balance || null} 
                  loading={loading && !stripeData}
                />
                <PayoutsList 
                  payouts={stripeData?.payouts || []} 
                  loading={loading && !stripeData}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="manual" className="mt-6">
            <ManualTransactionsTable 
              transactions={manualTxs} 
              loading={txLoading}
              onDelete={handleDeleteTx}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
