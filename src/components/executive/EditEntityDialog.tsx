import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BusinessEntity } from '@/hooks/useCorporateVault';

interface EditEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: BusinessEntity | null;
  onSave: (data: Partial<BusinessEntity>) => Promise<void>;
}

export function EditEntityDialog({ open, onOpenChange, entity, onSave }: EditEntityDialogProps) {
  const [formData, setFormData] = useState<Partial<BusinessEntity>>({
    company_name: 'XZ1 Recording Ventures Inc.',
    entity_type: 'C Corporation',
    state_of_incorporation: 'Hawaii',
    fiscal_year_end: 'December 31',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entity) {
      setFormData(entity);
    }
  }, [entity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit Business Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name || ''}
                onChange={e => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entity_type">Entity Type</Label>
              <Input
                id="entity_type"
                value={formData.entity_type || ''}
                onChange={e => setFormData(prev => ({ ...prev, entity_type: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state_of_incorporation">State</Label>
              <Input
                id="state_of_incorporation"
                value={formData.state_of_incorporation || ''}
                onChange={e => setFormData(prev => ({ ...prev, state_of_incorporation: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incorporation_date">Incorporation Date</Label>
              <Input
                id="incorporation_date"
                type="date"
                value={formData.incorporation_date || ''}
                onChange={e => setFormData(prev => ({ ...prev, incorporation_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscal_year_end">Fiscal Year End</Label>
              <Input
                id="fiscal_year_end"
                value={formData.fiscal_year_end || ''}
                onChange={e => setFormData(prev => ({ ...prev, fiscal_year_end: e.target.value }))}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-medium mb-4">Entity Identifiers</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hawaii_business_id">Hawaii Business ID</Label>
                <Input
                  id="hawaii_business_id"
                  placeholder="Pending..."
                  value={formData.hawaii_business_id || ''}
                  onChange={e => setFormData(prev => ({ ...prev, hawaii_business_id: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="irs_ein">IRS EIN</Label>
                <Input
                  id="irs_ein"
                  placeholder="XX-XXXXXXX"
                  value={formData.irs_ein || ''}
                  onChange={e => setFormData(prev => ({ ...prev, irs_ein: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-medium mb-4">Registered Agent</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registered_agent_name">Agent Name</Label>
                <Input
                  id="registered_agent_name"
                  placeholder="e.g. Northwest Registered Agent"
                  value={formData.registered_agent_name || ''}
                  onChange={e => setFormData(prev => ({ ...prev, registered_agent_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registered_agent_address">Address</Label>
                <Input
                  id="registered_agent_address"
                  placeholder="Full address"
                  value={formData.registered_agent_address || ''}
                  onChange={e => setFormData(prev => ({ ...prev, registered_agent_address: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registered_agent_phone">Phone</Label>
                <Input
                  id="registered_agent_phone"
                  placeholder="(XXX) XXX-XXXX"
                  value={formData.registered_agent_phone || ''}
                  onChange={e => setFormData(prev => ({ ...prev, registered_agent_phone: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
