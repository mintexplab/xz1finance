import { useState } from 'react';
import { format, differenceInDays, isPast, isFuture, addDays } from 'date-fns';
import { Calendar, Plus, Trash2, Edit, AlertTriangle, Clock, CheckCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CorporateEvent } from '@/hooks/useCorporateVault';

interface CorporateCalendarProps {
  events: CorporateEvent[];
  onAdd: (event: Omit<CorporateEvent, 'id'>) => Promise<any>;
  onUpdate: (id: string, data: Partial<CorporateEvent>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

const eventTypes = [
  { value: 'tax_deadline', label: 'Tax Deadline' },
  { value: 'filing', label: 'Filing Due' },
  { value: 'renewal', label: 'Renewal' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'general', label: 'General' },
];

const presetDeadlines = [
  { name: 'Hawaii Corporate Tax (Form N-30)', form: 'N-30', type: 'tax_deadline' },
  { name: 'IRS Form 1120 (Corporate Tax)', form: '1120', type: 'tax_deadline' },
  { name: 'IRS Form 5472 (Foreign Ownership)', form: '5472', type: 'filing' },
  { name: 'IRS Form 8833 (Treaty-Based Return)', form: '8833', type: 'filing' },
];

export function CorporateCalendar({ events, onAdd, onUpdate, onDelete }: CorporateCalendarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<CorporateEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    event_type: 'general',
    is_reminder: true,
    reminder_days: 7,
  });

  const handleOpenAdd = (preset?: typeof presetDeadlines[0]) => {
    if (preset) {
      setFormData({
        title: preset.name,
        description: `Form ${preset.form}`,
        event_date: format(new Date(), 'yyyy-MM-dd'),
        event_type: preset.type,
        is_reminder: true,
        reminder_days: 30,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        event_date: format(new Date(), 'yyyy-MM-dd'),
        event_type: 'general',
        is_reminder: true,
        reminder_days: 7,
      });
    }
    setEditEvent(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (event: CorporateEvent) => {
    setEditEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_type: event.event_type,
      is_reminder: event.is_reminder,
      reminder_days: event.reminder_days,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_date) return;

    if (editEvent?.id) {
      await onUpdate(editEvent.id, formData);
    } else {
      await onAdd(formData);
    }
    setDialogOpen(false);
    setEditEvent(null);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const getEventStatus = (event: CorporateEvent) => {
    const eventDate = new Date(event.event_date);
    const daysUntil = differenceInDays(eventDate, new Date());

    if (isPast(eventDate)) {
      return { status: 'overdue', color: 'text-destructive', icon: AlertTriangle, label: 'Overdue' };
    }
    if (daysUntil <= 7) {
      return { status: 'urgent', color: 'text-destructive', icon: AlertTriangle, label: `${daysUntil}d` };
    }
    if (daysUntil <= 30) {
      return { status: 'warning', color: 'text-warning', icon: Clock, label: `${daysUntil}d` };
    }
    return { status: 'ok', color: 'text-success', icon: CheckCircle, label: `${daysUntil}d` };
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );

  const upcomingEvents = sortedEvents.filter(e => isFuture(new Date(e.event_date)) || differenceInDays(new Date(e.event_date), new Date()) === 0);
  const pastEvents = sortedEvents.filter(e => isPast(new Date(e.event_date)) && differenceInDays(new Date(e.event_date), new Date()) !== 0);

  return (
    <>
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Corporate Calendar
          </CardTitle>
          <Button onClick={() => handleOpenAdd()} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Add Presets */}
          <div className="flex flex-wrap gap-2">
            {presetDeadlines.map((preset) => (
              <Button
                key={preset.form}
                variant="outline"
                size="sm"
                onClick={() => handleOpenAdd(preset)}
                className="gap-1 text-xs"
              >
                <FileText className="h-3 w-3" />
                {preset.form}
              </Button>
            ))}
          </div>

          {/* Upcoming Events */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Upcoming</h4>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No upcoming events</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((event) => {
                  const { color, icon: Icon, label } = getEventStatus(event);
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.event_date), 'MMM d, yyyy')}
                            {event.description && ` • ${event.description}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={color}>{label}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleOpenEdit(event)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setDeleteId(event.id!)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Past</h4>
              <div className="space-y-2 opacity-60">
                {pastEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/30"
                  >
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.event_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteId(event.id!)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(v) => setFormData({ ...formData, event_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editEvent ? 'Save' : 'Add'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event?
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
