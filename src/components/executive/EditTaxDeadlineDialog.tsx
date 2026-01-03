import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditTaxDeadlineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incorporationDate: string | null;
  onSave: (date: string) => Promise<void>;
}

export function EditTaxDeadlineDialog({ open, onOpenChange, incorporationDate, onSave }: EditTaxDeadlineDialogProps) {
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDate(incorporationDate || '');
  }, [incorporationDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    
    setSaving(true);
    try {
      await onSave(date);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit Incorporation Date</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="incorporation_date">Incorporation Date</Label>
            <Input
              id="incorporation_date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The tax deadline will be calculated as 15 months from this date.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !date}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
