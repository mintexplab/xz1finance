import { useState } from 'react';
import { format } from 'date-fns';
import { Repeat, Trash2, Pause, Play, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { RecurringTransaction } from '@/hooks/useRecurringTransactions';
import { formatCurrency } from '@/lib/formatters';
import { AddRecurringTransactionDialog } from './AddRecurringTransactionDialog';

interface RecurringTransactionsListProps {
  transactions: RecurringTransaction[];
  loading: boolean;
  onAdd: (data: any) => Promise<any>;
  onToggle: (id: string, isActive: boolean) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export function RecurringTransactionsList({
  transactions,
  loading,
  onAdd,
  onToggle,
  onDelete,
}: RecurringTransactionsListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            Recurring Transactions
          </CardTitle>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Repeat className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recurring transactions yet</p>
              <p className="text-sm">Add recurring income or expenses to track them automatically</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} className={!tx.is_active ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{tx.name}</TableCell>
                      <TableCell className={tx.type === 'income' ? 'text-green-400' : 'text-red-400'}>
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, tx.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'income' ? 'default' : 'destructive'}>
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{frequencyLabels[tx.frequency]}</TableCell>
                      <TableCell>{format(new Date(tx.start_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Switch
                          checked={tx.is_active}
                          onCheckedChange={(checked) => onToggle(tx.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(tx.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddRecurringTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={onAdd}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recurring transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
