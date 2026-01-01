import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, FileText, Shield, Clock, Pencil } from 'lucide-react';
import { BusinessEntity } from '@/hooks/useCorporateVault';

interface EntityCardsProps {
  entity: BusinessEntity | null;
  onEdit: () => void;
}

export function EntityCards({ entity, onEdit }: EntityCardsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Entity Identifiers</h2>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
      
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
            {entity?.hawaii_business_id ? (
              <div className="space-y-2">
                <p className="text-2xl font-mono font-bold text-primary">
                  {entity.hawaii_business_id}
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
            {entity?.irs_ein ? (
              <div className="space-y-2">
                <p className="text-2xl font-mono font-bold text-primary">
                  {entity.irs_ein}
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
            {entity?.registered_agent_name ? (
              <div className="space-y-2">
                <p className="font-semibold text-foreground">{entity.registered_agent_name}</p>
                {entity.registered_agent_address && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {entity.registered_agent_address}
                  </p>
                )}
                {entity.registered_agent_phone && (
                  <p className="text-sm font-mono text-muted-foreground">
                    {entity.registered_agent_phone}
                  </p>
                )}
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  Active Service
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg text-muted-foreground">Not configured</p>
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Click Edit to add
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
