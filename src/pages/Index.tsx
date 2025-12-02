import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { useStaff } from '@/hooks/useStaff';
import { useShifts } from '@/hooks/useShifts';
import { AppLayout } from '@/components/layout/AppLayout';
import { CreateBusinessForm } from '@/components/onboarding/CreateBusinessForm';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInMinutes } from 'date-fns';
import { Clock, Calendar, AlertTriangle, Users } from 'lucide-react';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const { staff } = useStaff(business?.id);
  const { shifts, createShift, updateShift, deleteShift } = useShifts(business?.id);

  // Show loading
  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show onboarding if no business
  if (!business) {
    return <CreateBusinessForm />;
  }

  // Calculate KPIs
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const weekShifts = shifts.filter((shift) => {
    const shiftDate = parseISO(shift.date);
    return isWithinInterval(shiftDate, { start: weekStart, end: weekEnd });
  });

  const monthShifts = shifts.filter((shift) => {
    const shiftDate = parseISO(shift.date);
    return isWithinInterval(shiftDate, { start: monthStart, end: monthEnd });
  });

  const plannedThisWeek = weekShifts.filter((s) => s.status === 'planned').length;
  
  const totalHoursThisWeek = weekShifts.reduce((total, shift) => {
    const start = new Date(`2000-01-01T${shift.start_time}`);
    const end = new Date(`2000-01-01T${shift.end_time}`);
    const minutes = differenceInMinutes(end, start);
    return total + minutes / 60;
  }, 0);

  const absentThisMonth = monthShifts.filter((s) => s.status === 'absent').length;
  const absentPercentage = monthShifts.length > 0 
    ? ((absentThisMonth / monthShifts.length) * 100).toFixed(1)
    : '0';

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de turnos y métricas de {business.name}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Turnos esta semana"
            value={weekShifts.length}
            subtitle={`${plannedThisWeek} planificados`}
            icon={<Calendar className="w-6 h-6" />}
          />
          <KpiCard
            title="Horas totales (semana)"
            value={`${totalHoursThisWeek.toFixed(1)}h`}
            subtitle="De todos los empleados"
            icon={<Clock className="w-6 h-6" />}
          />
          <KpiCard
            title="Ausencias (mes)"
            value={`${absentPercentage}%`}
            subtitle={`${absentThisMonth} de ${monthShifts.length} turnos`}
            icon={<AlertTriangle className="w-6 h-6" />}
          />
          <KpiCard
            title="Empleados activos"
            value={staff.filter((s) => s.is_active).length}
            subtitle={`De ${staff.length} totales`}
            icon={<Users className="w-6 h-6" />}
          />
        </div>

        {/* Weekly Calendar */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Calendario semanal</h2>
          <WeeklyCalendar
            staff={staff}
            shifts={shifts}
            businessId={business.id}
            onCreateShift={createShift}
            onUpdateShift={updateShift}
            onDeleteShift={deleteShift}
          />
        </div>
      </div>
    </AppLayout>
  );
}
