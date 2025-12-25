import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { StripeCharge } from '@/hooks/useStripeData';
import { ManualTransaction } from '@/hooks/useManualTransactions';
import { formatCurrency } from '@/lib/formatters';

interface CategoryBreakdownProps {
  stripeCharges: StripeCharge[];
  manualTransactions: ManualTransaction[];
}

const COLORS = [
  'hsl(330, 100%, 50%)',
  'hsl(280, 100%, 60%)',
  'hsl(200, 100%, 50%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(260, 80%, 60%)',
  'hsl(180, 70%, 50%)',
];

export function CategoryBreakdown({ stripeCharges, manualTransactions }: CategoryBreakdownProps) {
  const data = useMemo(() => {
    const categoryMap = new Map<string, number>();

    // Add Stripe revenue
    const stripeRevenue = stripeCharges
      .filter(c => c.status === 'succeeded')
      .reduce((sum, c) => sum + c.amount, 0);
    
    if (stripeRevenue > 0) {
      categoryMap.set('Stripe Payments', stripeRevenue / 100);
    }

    // Add manual transactions by category
    manualTransactions.forEach(tx => {
      const amount = Number(tx.amount) / 100;
      const current = categoryMap.get(tx.category) || 0;
      categoryMap.set(tx.category, current + amount);
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [stripeCharges, manualTransactions]);

  if (data.length === 0) {
    return (
      <div className="glass-card p-6 h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No category data available</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 4%)',
                border: '1px solid hsl(0, 0%, 16%)',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatCurrency(value * 100, 'CAD')}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.slice(0, 6).map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }} 
            />
            <span className="truncate text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
