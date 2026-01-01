import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, ExternalLink, CheckCircle, AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Domain } from '@/hooks/useCorporateVault';
import { EditDomainDialog } from './EditDomainDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DomainPortfolioProps {
  domains: Domain[];
  onAdd: (data: Omit<Domain, 'id'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Domain>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DomainPortfolio({ domains, onAdd, onUpdate, onDelete }: DomainPortfolioProps) {
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingDomain, setDeletingDomain] = useState<Domain | null>(null);

  const getStatusBadge = (domain: Domain) => {
    if (!domain.expiration_date) {
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          No expiry set
        </Badge>
      );
    }

    const daysUntilExpiry = differenceInDays(new Date(domain.expiration_date), new Date());
    
    if (daysUntilExpiry < 0) {
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

  const handleAddDomain = async (data: Partial<Domain>) => {
    await onAdd(data as Omit<Domain, 'id'>);
  };

  const handleUpdateDomain = async (data: Partial<Domain>) => {
    if (editingDomain?.id) {
      await onUpdate(editingDomain.id, data);
      setEditingDomain(null);
    }
  };

  const handleDeleteDomain = async () => {
    if (deletingDomain?.id) {
      await onDelete(deletingDomain.id);
      setDeletingDomain(null);
    }
  };

  return (
    <>
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Domain Portfolio
          </CardTitle>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Domain
          </Button>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No domains added yet</p>
              <p className="text-sm">Click "Add Domain" to start tracking your portfolio</p>
            </div>
          ) : (
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
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((domain) => (
                    <TableRow key={domain.id} className="border-border/30">
                      <TableCell className="font-mono font-medium">
                        <a 
                          href={`https://${domain.domain_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {domain.domain_name}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {domain.registrar || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {domain.expiration_date 
                          ? format(new Date(domain.expiration_date), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {domain.auto_renew ? (
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
                        {domain.primary_use || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingDomain(domain)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeletingDomain(domain)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditDomainDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        domain={null}
        onSave={handleAddDomain}
        isNew
      />

      <EditDomainDialog
        open={!!editingDomain}
        onOpenChange={(open) => !open && setEditingDomain(null)}
        domain={editingDomain}
        onSave={handleUpdateDomain}
      />

      <AlertDialog open={!!deletingDomain} onOpenChange={(open) => !open && setDeletingDomain(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Domain</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deletingDomain?.domain_name}</strong> from your portfolio?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDomain} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
