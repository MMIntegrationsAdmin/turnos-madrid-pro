import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Staff, Shift, ShiftStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ShiftBlock } from './ShiftBlock';
import { ShiftDialog } from './ShiftDialog';

interface WeeklyCalendarProps {
  staff: Staff[];
  shifts: Shift[];
  businessId: string;
  onCreateShift: (shift: Omit<Shift, 'id' | 'created_at' | 'updated_at' | 'staff'>) => Promise<any>;
  onUpdateShift: (id: string, updates: Partial<Shift>) => Promise<any>;
  onDeleteShift: (id: string) => Promise<boolean>;
}

export function WeeklyCalendar({
  staff,
  shifts,
  businessId,
  onCreateShift,
  onUpdateShift,
  onDeleteShift,
}: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCell, setSelectedCell] = useState<{ staffId: string; date: Date } | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const shiftsByStaffAndDate = useMemo(() => {
    const map: Record<string, Record<string, Shift[]>> = {};
    
    shifts.forEach((shift) => {
      if (!map[shift.staff_id]) {
        map[shift.staff_id] = {};
      }
      const dateKey = shift.date;
      if (!map[shift.staff_id][dateKey]) {
        map[shift.staff_id][dateKey] = [];
      }
      map[shift.staff_id][dateKey].push(shift);
    });
    
    return map;
  }, [shifts]);

  const activeStaff = staff.filter((s) => s.is_active);

  const handlePrevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCellClick = (staffId: string, date: Date) => {
    setSelectedCell({ staffId, date });
    setSelectedShift(null);
    setDialogOpen(true);
  };

  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    setSelectedCell(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCell(null);
    setSelectedShift(null);
  };

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={handleToday}>
            Hoy
          </Button>
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {format(weekStart, "d 'de' MMMM", { locale: es })} -{' '}
          {format(addDays(weekStart, 6), "d 'de' MMMM, yyyy", { locale: es })}
        </h2>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        {/* Header row - days */}
        <div className="grid grid-cols-[180px_repeat(7,1fr)] border-b border-border bg-muted/50">
          <div className="p-3 text-sm font-medium text-muted-foreground border-r border-border">
            Empleado
          </div>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'p-3 text-center border-r border-border last:border-r-0',
                  isToday && 'bg-primary/5'
                )}
              >
                <p className="text-xs text-muted-foreground uppercase">
                  {format(day, 'EEE', { locale: es })}
                </p>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    isToday ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {format(day, 'd')}
                </p>
              </div>
            );
          })}
        </div>

        {/* Staff rows */}
        {activeStaff.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No hay empleados activos.</p>
            <p className="text-sm">Añade empleados desde la sección de Personal.</p>
          </div>
        ) : (
          activeStaff.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-[180px_repeat(7,1fr)] border-b border-border last:border-b-0"
            >
              {/* Staff name */}
              <div className="p-3 border-r border-border flex flex-col justify-center">
                <p className="font-medium text-foreground truncate">{member.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.role}</p>
              </div>

              {/* Day cells */}
              {weekDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayShifts = shiftsByStaffAndDate[member.id]?.[dateKey] || [];
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={`${member.id}-${dateKey}`}
                    className={cn(
                      'min-h-[80px] p-1 border-r border-border last:border-r-0 cursor-pointer transition-colors hover:bg-muted/50',
                      isToday && 'bg-primary/5'
                    )}
                    onClick={() => handleCellClick(member.id, day)}
                  >
                    <div className="space-y-1">
                      {dayShifts.map((shift) => (
                        <ShiftBlock
                          key={shift.id}
                          shift={shift}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShiftClick(shift);
                          }}
                        />
                      ))}
                      {dayShifts.length === 0 && (
                        <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Shift Dialog */}
      <ShiftDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        staff={activeStaff}
        businessId={businessId}
        initialStaffId={selectedCell?.staffId}
        initialDate={selectedCell?.date}
        shift={selectedShift}
        onCreateShift={onCreateShift}
        onUpdateShift={onUpdateShift}
        onDeleteShift={onDeleteShift}
      />
    </div>
  );
}
