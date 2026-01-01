import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';

interface RevenueEntry {
  id: string;
  date: string;
  partner: string;
  grossRevenue: number;
  artistSplit: number;
  labelSplit: number;
  publisherSplit: number;
  adminSplit: number;
  currency: string;
}

interface RevenueLedgerProps {
  entries: RevenueEntry[];
  onAddEntry: (entry: Omit<RevenueEntry, 'id' | 'artistSplit' | 'labelSplit' | 'publisherSplit' | 'adminSplit'>) => void;
  onDeleteEntry: (id: string) => void;
  onGenerateStatement: (artistName: string, entries: RevenueEntry[]) => void;
}

const PARTNERS = ['Trackball', 'DistroKid', 'TuneCore', 'CD Baby', 'LANDR', 'Other'];

export function RevenueLedger({ entries, onAddEntry, onDeleteEntry, onGenerateStatement }: RevenueLedgerProps) {
  const [open, setOpen] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);
  const [artistName, setArtistName] = useState('');
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    partner: 'Trackball',
    grossRevenue: '',
    currency: 'CAD',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEntry({
      date: formData.date,
      partner: formData.partner,
      grossRevenue: Number(formData.grossRevenue),
      currency: formData.currency,
    });
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      partner: 'Trackball',
      grossRevenue: '',
      currency: 'CAD',
    });
    setOpen(false);
  };

  const handleGenerateStatement = () => {
    if (artistName.trim()) {
      onGenerateStatement(artistName, entries);
      setStatementOpen(false);
      setArtistName('');
    }
  };

  const totals = entries.reduce(
    (acc, entry) => ({
      gross: acc.gross + entry.grossRevenue,
      artistSplit: acc.artistSplit + entry.artistSplit,
      labelSplit: acc.labelSplit + entry.labelSplit,
      publisherSplit: acc.publisherSplit + entry.publisherSplit,
      adminSplit: acc.adminSplit + entry.adminSplit,
    }),
    { gross: 0, artistSplit: 0, labelSplit: 0, publisherSplit: 0, adminSplit: 0 }
  );

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Revenue Ledger</CardTitle>
        <div className="flex gap-2">
          <Dialog open={statementOpen} onOpenChange={setStatementOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={entries.length === 0}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Statement
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border">
              <DialogHeader>
                <DialogTitle>Generate Artist Statement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Artist Name</Label>
                  <Input
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Enter artist name"
                  />
                </div>
                <Button onClick={handleGenerateStatement} className="w-full">
                  Generate PDF Statement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Revenue
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border">
              <DialogHeader>
                <DialogTitle>Add Revenue Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Distribution Partner</Label>
                    <Select
                      value={formData.partner}
                      onValueChange={(v) => setFormData({ ...formData, partner: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PARTNERS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Net Revenue</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.grossRevenue}
                      onChange={(e) => setFormData({ ...formData, grossRevenue: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(v) => setFormData({ ...formData, currency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                  <p className="text-muted-foreground">Automatic Split Calculations:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <span>Label Split (70%):</span>
                    <span className="text-primary font-mono">
                      {formatCurrency((Number(formData.grossRevenue) || 0) * 0.7 * 100, formData.currency)}
                    </span>
                    <span>Artist Split (30%):</span>
                    <span className="font-mono">
                      {formatCurrency((Number(formData.grossRevenue) || 0) * 0.3 * 100, formData.currency)}
                    </span>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Add Entry
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No revenue entries yet. Add your first distribution partner revenue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead className="text-right">Net Revenue</TableHead>
                  <TableHead className="text-right">Label (70%)</TableHead>
                  <TableHead className="text-right">Artist (30%)</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className="border-border/30">
                    <TableCell className="font-mono text-sm">
                      {format(new Date(entry.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{entry.partner}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(entry.grossRevenue * 100, entry.currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-primary">
                      {formatCurrency(entry.labelSplit * 100, entry.currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(entry.artistSplit * 100, entry.currency)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 border-border bg-muted/30">
                  <TableCell colSpan={2} className="font-semibold">
                    Totals
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(totals.gross * 100, 'CAD')}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-primary">
                    {formatCurrency(totals.labelSplit * 100, 'CAD')}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(totals.artistSplit * 100, 'CAD')}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
