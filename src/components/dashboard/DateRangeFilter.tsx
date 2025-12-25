import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears } from 'date-fns';
import { cn } from '@/lib/utils';

export type DateRange = {
  start: Date;
  end: Date;
  label: string;
};

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets = [
  { label: 'Today', getValue: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }) },
  { label: 'This Week', getValue: () => ({ start: startOfWeek(new Date()), end: endOfWeek(new Date()) }) },
  { label: 'This Month', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: 'This Year', getValue: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()) }) },
  { label: 'Last 7 Days', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: 'Last 30 Days', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: 'Last 3 Months', getValue: () => ({ start: subMonths(new Date(), 3), end: new Date() }) },
  { label: 'Last Year', getValue: () => ({ start: subYears(new Date(), 1), end: new Date() }) },
  { label: 'All Time', getValue: () => ({ start: new Date(2020, 0, 1), end: new Date() }) },
];

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState<Date | undefined>(value.start);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(value.end);

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    onChange({ ...range, label: preset.label });
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange({
        start: customStart,
        end: customEnd,
        label: `${format(customStart, 'MMM d, yyyy')} - ${format(customEnd, 'MMM d, yyyy')}`,
      });
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[200px] justify-start">
          <CalendarIcon className="h-4 w-4" />
          <span className="truncate">{value.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 glass-card border-border" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="border-r border-border p-3 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-2">Quick Select</p>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full justify-start',
                  value.label === preset.label && 'bg-primary/20 text-primary'
                )}
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          {/* Custom Range */}
          <div className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Custom Range</p>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Start</p>
                <Calendar
                  mode="single"
                  selected={customStart}
                  onSelect={setCustomStart}
                  initialFocus
                  className="rounded-md border-0"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">End</p>
                <Calendar
                  mode="single"
                  selected={customEnd}
                  onSelect={setCustomEnd}
                  className="rounded-md border-0"
                />
              </div>
            </div>
            <Button 
              className="w-full mt-3" 
              onClick={handleCustomApply}
              disabled={!customStart || !customEnd}
            >
              Apply Custom Range
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
