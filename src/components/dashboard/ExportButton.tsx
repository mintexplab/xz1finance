import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText } from 'lucide-react';
import { generatePDFStatement } from '@/lib/pdfExport';
import { StripeCharge } from '@/hooks/useStripeData';
import { ManualTransaction } from '@/hooks/useManualTransactions';
import { DateRange } from './DateRangeFilter';
import { toast } from 'sonner';

interface ExportButtonProps {
  dateRange: DateRange;
  stripeCharges: StripeCharge[];
  manualTransactions: ManualTransaction[];
}

export function ExportButton({ dateRange, stripeCharges, manualTransactions }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (currency: 'CAD' | 'USD') => {
    setExporting(true);
    try {
      generatePDFStatement({
        title: `Financial Statement - ${currency}`,
        dateRange: { start: dateRange.start, end: dateRange.end },
        currency,
        stripeCharges,
        manualTransactions,
      });
      toast.success(`${currency} statement exported successfully`);
    } catch (error) {
      toast.error('Failed to export statement');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={exporting}>
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-border">
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Export Statement
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('CAD')} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Export in CAD
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('USD')} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Export in USD
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
