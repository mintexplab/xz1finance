import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { EntityCards } from '@/components/executive/EntityCards';
import { DomainPortfolio } from '@/components/executive/DomainPortfolio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

// Static entity data - can be moved to a config or database later
const ENTITY_DATA = {
  entityType: 'C Corporation',
  state: 'Hawaii',
  incorporationDate: '2024-12-01',
  hawaiiBusinessId: undefined, // Will be filled when received
  irsEin: undefined, // Will be filled when received
  registeredAgent: {
    name: 'Northwest Registered Agent',
    address: '1003 Bishop St, Pauahi Tower Suite 1440, Honolulu, HI 96813',
    phone: '(808) 123-4567',
  },
};

// Domain portfolio data
const DOMAINS = [
  {
    name: 'xz1.ca',
    registrar: 'CIRA',
    expirationDate: '2025-12-15',
    autoRenew: true,
    status: 'active' as const,
    primaryUse: 'Brand Shortlink',
  },
  {
    name: 'jackpotmusik.de',
    registrar: 'DENIC',
    expirationDate: '2025-08-20',
    autoRenew: true,
    status: 'active' as const,
    primaryUse: 'Artist Project',
  },
  {
    name: 'xz1recordings.ca',
    registrar: 'CIRA',
    expirationDate: '2025-11-10',
    autoRenew: true,
    status: 'active' as const,
    primaryUse: 'Label Website',
  },
  {
    name: 'xz1recordingventures.com',
    registrar: 'Cloudflare',
    expirationDate: '2025-12-01',
    autoRenew: true,
    status: 'active' as const,
    primaryUse: 'Corporate HQ',
  },
  {
    name: 'trackball.cc',
    registrar: 'Cloudflare',
    expirationDate: '2026-01-15',
    autoRenew: true,
    status: 'active' as const,
    primaryUse: 'Distribution Platform',
  },
];

export default function CorporateVault() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background glow effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <main className="container mx-auto px-6 py-8 relative">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Corporate Vault</h1>
          <p className="text-muted-foreground mt-1">
            XZ1 Recording Ventures Inc. entity information and assets
          </p>
        </div>

        {/* Company Overview Card */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              XZ1 Recording Ventures Inc.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Entity Type</p>
                <p className="font-semibold">{ENTITY_DATA.entityType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">State of Incorporation</p>
                <p className="font-semibold">{ENTITY_DATA.state}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Incorporation Date</p>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(ENTITY_DATA.incorporationDate), 'MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fiscal Year End</p>
                <p className="font-semibold">December 31</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entity ID Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Entity Identifiers</h2>
          <EntityCards data={ENTITY_DATA} />
        </div>

        {/* Domain Portfolio */}
        <DomainPortfolio domains={DOMAINS} />
      </main>
    </div>
  );
}
