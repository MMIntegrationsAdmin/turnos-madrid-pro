import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { useStaff } from '@/hooks/useStaff';
import { useShifts } from '@/hooks/useShifts';
import { AppLayout } from '@/components/layout/AppLayout';
import { CreateBusinessForm } from '@/components/onboarding/CreateBusinessForm';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, differenceInMinutes } from 'date-fns';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Calendario() {
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const { staff } = useStaff(business?.id);
  const { shifts, createShift, updateShift, deleteShift } = useShifts(business?.id);

  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!business) {
    return <CreateBusinessForm />;
  }

  // Calculate mini-KPIs for calendar view
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const weekShifts = shifts.filter((shift) => {
    const shiftDate = parseISO(shift.date);
    return isWithinInterval(shiftDate, { start: weekStart, end: weekEnd });
  });

  const plannedHours = weekShifts
    .filter((s) => s.status === 'planned')
    .reduce((total, shift) => {
      const start = new Date(`2000-01-01T${shift.start_time}`);
      const end = new Date(`2000-01-01T${shift.end_time}`);
      return total + differenceInMinutes(end, start) / 60;
    }, 0);

  const workedHours = weekShifts
    .filter((s) => s.status === 'worked')
    .reduce((total, shift) => {
      const start = new Date(`2000-01-01T${shift.start_time}`);
      const end = new Date(`2000-01-01T${shift.end_time}`);
      return total + differenceInMinutes(end, start) / 60;
    }, 0);

  const absentCount = weekShifts.filter((s) => s.status === 'absent').length;
  const absentPercentage = weekShifts.length > 0
    ? ((absentCount / weekShifts.length) * 100).toFixed(1)
    : '0';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendario de turnos</h1>
          <p className="text-muted-foreground">
            Gestiona los turnos de tu equipo
          </p>
        </div>

        {/* Mini KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            title="Horas planificadas"
            value={`${plannedHours.toFixed(1)}h`}
            icon={<Clock className="w-5 h-5" />}
            className="py-4"
          />
          <KpiCard
            title="Horas trabajadas"
            value={`${workedHours.toFixed(1)}h`}
            icon={<CheckCircle className="w-5 h-5" />}
            className="py-4"
          />
          <KpiCard
            title="% Absentismo"
            value={`${absentPercentage}%`}
            icon={<AlertTriangle className="w-5 h-5" />}
            className="py-4"
          />
        </div>

        {/* Calendar */}
        <WeeklyCalendar
          staff={staff}
          shifts={shifts}
          businessId={business.id}
          onCreateShift={createShift}
          onUpdateShift={updateShift}
          onDeleteShift={deleteShift}
        />
      </div>
    </AppLayout>
  );
}
