import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Domain {
  name: string;
  registrar: string;
  expirationDate: string;
  autoRenew: boolean;
  status: 'active' | 'expiring' | 'expired';
  primaryUse?: string;
}

interface DomainPortfolioProps {
  domains: Domain[];
}

export function DomainPortfolio({ domains }: DomainPortfolioProps) {
  const getStatusBadge = (domain: Domain) => {
    const daysUntilExpiry = differenceInDays(new Date(domain.expirationDate), new Date());
    
    if (domain.status === 'expired' || daysUntilExpiry < 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }
    
    if (daysUntilExpiry <= 30) {
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expiring Soon
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Domain Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Domain</TableHead>
                <TableHead>Registrar</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Auto-Renew</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Use</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.name} className="border-border/30">
                  <TableCell className="font-mono font-medium">
                    <a 
                      href={`https://${domain.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      {domain.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {domain.registrar}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(domain.expirationDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {domain.autoRenew ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        No
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(domain)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {domain.primaryUse || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
