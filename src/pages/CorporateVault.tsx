import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCorporateVault } from '@/hooks/useCorporateVault';
import { EntityCards } from '@/components/executive/EntityCards';
import { DomainPortfolio } from '@/components/executive/DomainPortfolio';
import { EditEntityDialog } from '@/components/executive/EditEntityDialog';
import { CorporateCalendar } from '@/components/executive/CorporateCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function CorporateVault() {
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [editEntityOpen, setEditEntityOpen] = useState(false);

  const {
    entity,
    domains,
    events,
    loading,
    saveEntity,
    addDomain,
    updateDomain,
    deleteDomain,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useCorporateVault(user?.sub);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const companyName = entity?.company_name || 'XZ1 Recording Ventures Inc.';
  const entityType = entity?.entity_type || 'C Corporation';
  const state = entity?.state_of_incorporation || 'Hawaii';
  const incorporationDate = entity?.incorporation_date;
  const fiscalYearEnd = entity?.fiscal_year_end || 'December 31';

  return (
    <div className="bg-background">
      {/* Background glow effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <main className="container mx-auto px-6 py-6 relative">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Corporate Vault</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {companyName} entity information and assets
          </p>
        </div>

        {/* Company Overview Card */}
        <Card className="glass-card mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              {companyName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Entity Type</p>
                <p className="font-medium text-sm">{entityType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">State of Incorporation</p>
                <p className="font-medium text-sm">{state}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Incorporation Date</p>
                <p className="font-medium text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {incorporationDate 
                    ? format(new Date(incorporationDate), 'MMM d, yyyy')
                    : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fiscal Year End</p>
                <p className="font-medium text-sm">{fiscalYearEnd}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entity Cards & Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <EntityCards 
              entity={entity} 
              onEdit={() => setEditEntityOpen(true)} 
            />
          </div>
          <CorporateCalendar
            events={events}
            onAdd={addEvent}
            onUpdate={updateEvent}
            onDelete={deleteEvent}
          />
        </div>

        {/* Domain Portfolio */}
        <DomainPortfolio 
          domains={domains}
          onAdd={addDomain}
          onUpdate={updateDomain}
          onDelete={deleteDomain}
        />

        {/* Edit Entity Dialog */}
        <EditEntityDialog
          open={editEntityOpen}
          onOpenChange={setEditEntityOpen}
          entity={entity}
          onSave={saveEntity}
        />
      </main>
    </div>
  );
}
