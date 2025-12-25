import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { StripeCharge } from '@/hooks/useStripeData';
import { ManualTransaction } from '@/hooks/useManualTransactions';
import { formatCurrency } from '@/lib/formatters';
import { format, parseISO, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

interface RevenueChartProps {
  stripeCharges: StripeCharge[];
  manualTransactions: ManualTransaction[];
  groupBy: 'day' | 'week' | 'month';
}

export function RevenueChart({ stripeCharges, manualTransactions, groupBy }: RevenueChartProps) {
  const chartData = useMemo(() => {
    const dataMap = new Map<string, { date: string; income: number; expenses: number; fees: number }>();

    const getGroupKey = (date: Date) => {
      switch (groupBy) {
        case 'day':
          return format(startOfDay(date), 'yyyy-MM-dd');
        case 'week':
          return format(startOfWeek(date), 'yyyy-MM-dd');
        case 'month':
          return format(startOfMonth(date), 'yyyy-MM');
      }
    };

    const getDisplayLabel = (key: string) => {
      const date = parseISO(key);
      switch (groupBy) {
        case 'day':
          return format(date, 'MMM d');
        case 'week':
          return `Week of ${format(date, 'MMM d')}`;
        case 'month':
          return format(date, 'MMM yyyy');
      }
    };

    // Process Stripe charges
    stripeCharges
      .filter(c => c.status === 'succeeded')
      .forEach(charge => {
        const date = new Date(charge.created * 1000);
        const key = getGroupKey(date);
        const existing = dataMap.get(key) || { date: key, income: 0, expenses: 0, fees: 0 };
        
        existing.income += charge.amount / 100;
        if (typeof charge.balance_transaction === 'object' && charge.balance_transaction) {
          existing.fees += charge.balance_transaction.fee / 100;
        }
        
        dataMap.set(key, existing);
      });

    // Process manual transactions
    manualTransactions.forEach(tx => {
      const date = parseISO(tx.transaction_date);
      const key = getGroupKey(date);
      const existing = dataMap.get(key) || { date: key, income: 0, expenses: 0, fees: 0 };
      
      const amount = Number(tx.amount) / 100;
      if (tx.type === 'income' || tx.type === 'royalty') {
        existing.income += amount;
      } else if (tx.type === 'expense') {
        existing.expenses += amount;
      }
      
      dataMap.set(key, existing);
    });

    // Sort by date and format for display
    return Array.from(dataMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => ({
        ...data,
        label: getDisplayLabel(key),
        net: data.income - data.expenses - data.fees,
      }));
  }, [stripeCharges, manualTransactions, groupBy]);

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-6 h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No data available for the selected period</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-6">Revenue Trends</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(330, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(330, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" />
            <XAxis 
              dataKey="label" 
              tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(0, 0%, 16%)' }}
              tickLine={{ stroke: 'hsl(0, 0%, 16%)' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(0, 0%, 16%)' }}
              tickLine={{ stroke: 'hsl(0, 0%, 16%)' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 4%)',
                border: '1px solid hsl(0, 0%, 16%)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(0, 0%, 100%)' }}
              formatter={(value: number, name: string) => [
                formatCurrency(value * 100, 'CAD'),
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="hsl(330, 100%, 50%)"
              strokeWidth={2}
              fill="url(#colorIncome)"
            />
            <Area
              type="monotone"
              dataKey="net"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              fill="url(#colorNet)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Gross Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Net Revenue</span>
        </div>
      </div>
    </div>
  );
}
