import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, Shield, Clock } from 'lucide-react';

interface EntityData {
  hawaiiBusinessId?: string;
  irsEin?: string;
  registeredAgent: {
    name: string;
    address: string;
    phone?: string;
  };
  incorporationDate?: string;
  entityType: string;
  state: string;
}

interface EntityCardsProps {
  data: EntityData;
}

export function EntityCards({ data }: EntityCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Hawaii Business ID */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Hawaii Business ID
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.hawaiiBusinessId ? (
            <div className="space-y-2">
              <p className="text-2xl font-mono font-bold text-primary">
                {data.hawaiiBusinessId}
              </p>
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                Active
              </Badge>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">Pending</p>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                <Clock className="h-3 w-3 mr-1" />
                Awaiting Assignment
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* IRS EIN */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            IRS EIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.irsEin ? (
            <div className="space-y-2">
              <p className="text-2xl font-mono font-bold text-primary">
                {data.irsEin}
              </p>
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                Registered
              </Badge>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">Pending</p>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                <Clock className="h-3 w-3 mr-1" />
                Application Submitted
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registered Agent */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Registered Agent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">{data.registeredAgent.name}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.registeredAgent.address}
            </p>
            {data.registeredAgent.phone && (
              <p className="text-sm font-mono text-muted-foreground">
                {data.registeredAgent.phone}
              </p>
            )}
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              Active Service
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
