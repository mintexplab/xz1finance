import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Domain } from '@/hooks/useCorporateVault';

interface EditDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: Domain | null;
  onSave: (data: Partial<Domain>) => Promise<void>;
  isNew?: boolean;
}

export function EditDomainDialog({ open, onOpenChange, domain, onSave, isNew = false }: EditDomainDialogProps) {
  const [formData, setFormData] = useState<Partial<Domain>>({
    domain_name: '',
    registrar: '',
    expiration_date: '',
    auto_renew: true,
    primary_use: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (domain) {
      setFormData(domain);
    } else {
      setFormData({
        domain_name: '',
        registrar: '',
        expiration_date: '',
        auto_renew: true,
        primary_use: '',
        notes: '',
      });
    }
  }, [domain, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.domain_name?.trim()) return;
    
    setSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add Domain' : 'Edit Domain'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain_name">Domain Name</Label>
            <Input
              id="domain_name"
              placeholder="example.com"
              value={formData.domain_name || ''}
              onChange={e => setFormData(prev => ({ ...prev, domain_name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registrar">Registrar</Label>
              <Input
                id="registrar"
                placeholder="e.g. Cloudflare, CIRA"
                value={formData.registrar || ''}
                onChange={e => setFormData(prev => ({ ...prev, registrar: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration_date">Expiration Date</Label>
              <Input
                id="expiration_date"
                type="date"
                value={formData.expiration_date || ''}
                onChange={e => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_use">Primary Use</Label>
            <Input
              id="primary_use"
              placeholder="e.g. Corporate HQ, Artist Project"
              value={formData.primary_use || ''}
              onChange={e => setFormData(prev => ({ ...prev, primary_use: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes || ''}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto_renew">Auto-Renew</Label>
            <Switch
              id="auto_renew"
              checked={formData.auto_renew ?? true}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, auto_renew: checked }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !formData.domain_name?.trim()}>
              {saving ? 'Saving...' : isNew ? 'Add Domain' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
