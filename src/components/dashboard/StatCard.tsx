import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'border-border/50',
    primary: 'border-primary/30 glow-pink',
    success: 'border-success/30',
    warning: 'border-warning/30',
  };

  return (
    <div className={cn('stat-card', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className={cn(
            'text-3xl font-bold font-mono tracking-tight',
            variant === 'primary' && 'gradient-text'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg',
          variant === 'primary' ? 'bg-primary/20' : 'bg-secondary'
        )}>
          <Icon className={cn(
            'h-5 w-5',
            variant === 'primary' ? 'text-primary' : 'text-muted-foreground'
          )} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={cn(
            'text-sm font-medium',
            trend.value >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {trend.value >= 0 ? '+' : ''}{trend.value.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
