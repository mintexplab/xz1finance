export function formatCurrency(amount: number, currency: string = 'cad'): string {
  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  });
  // Stripe amounts are in cents
  return formatter.format(amount / 100);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'succeeded':
    case 'paid':
    case 'active':
      return 'text-success';
    case 'pending':
    case 'processing':
      return 'text-warning';
    case 'failed':
    case 'canceled':
    case 'cancelled':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    charge: 'Payment',
    payment: 'Payment',
    payout: 'Payout',
    refund: 'Refund',
    adjustment: 'Adjustment',
    stripe_fee: 'Stripe Fee',
    application_fee: 'App Fee',
    transfer: 'Transfer',
  };
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}
