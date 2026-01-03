import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { differenceInDays, differenceInMonths, addMonths, format } from 'date-fns';
import { Clock, AlertTriangle, CheckCircle, Pencil } from 'lucide-react';
import { EditTaxDeadlineDialog } from './EditTaxDeadlineDialog';

interface TaxClockProps {
  incorporationDate?: string | null;
  onUpdateIncorporationDate?: (date: string) => Promise<void>;
}

export function TaxClock({ incorporationDate, onUpdateIncorporationDate }: TaxClockProps) {
  const [editOpen, setEditOpen] = useState(false);
  
  // Default to a placeholder if no incorporation date is set
  const incDate = incorporationDate ? new Date(incorporationDate) : new Date('2024-12-01');
  const taxDeadline = addMonths(incDate, 15);
  const today = new Date();
  
  const daysRemaining = differenceInDays(taxDeadline, today);
  const monthsRemaining = differenceInMonths(taxDeadline, today);
  
  const isOverdue = daysRemaining < 0;
  const isUrgent = daysRemaining <= 30 && daysRemaining >= 0;
  const isWarning = daysRemaining <= 90 && daysRemaining > 30;
  
  const getStatusColor = () => {
    if (isOverdue) return 'text-destructive';
    if (isUrgent) return 'text-destructive';
    if (isWarning) return 'text-warning';
    return 'text-success';
  };
  
  const getStatusIcon = () => {
    if (isOverdue || isUrgent) return <AlertTriangle className="h-5 w-5" />;
    if (isWarning) return <Clock className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };
  
  const progressPercentage = Math.max(0, Math.min(100, ((450 - daysRemaining) / 450) * 100));

  return (
    <>
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Hawaii Corporate Tax Clock
            </span>
            {onUpdateIncorporationDate && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">First Filing Deadline</p>
            <p className="text-lg font-semibold font-mono">
              {format(taxDeadline, 'MMMM d, yyyy')}
            </p>
          </div>
          <div className={`flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Time Remaining</span>
            <span className={`font-mono font-semibold ${getStatusColor()}`}>
              {isOverdue 
                ? `${Math.abs(daysRemaining)} days overdue`
                : `${monthsRemaining}mo ${daysRemaining % 30}d`
              }
            </span>
          </div>
          
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isOverdue || isUrgent 
                  ? 'bg-destructive' 
                  : isWarning 
                    ? 'bg-warning' 
                    : 'bg-gradient-to-r from-primary to-chart-2'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Incorporation</span>
            <span>15-month deadline</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Note:</span> Hawaii requires corporate tax filing within 15 months of incorporation. 
            Form N-30 must be filed with the Department of Taxation.
          </p>
        </div>
      </CardContent>
    </Card>
    
    {onUpdateIncorporationDate && (
      <EditTaxDeadlineDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        incorporationDate={incorporationDate || null}
        onSave={onUpdateIncorporationDate}
      />
    )}
  </>
  );
}
