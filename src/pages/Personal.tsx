import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { useStaff } from '@/hooks/useStaff';
import { AppLayout } from '@/components/layout/AppLayout';
import { CreateBusinessForm } from '@/components/onboarding/CreateBusinessForm';
import { StaffList } from '@/components/staff/StaffList';

export default function Personal() {
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const { staff, createStaff, updateStaff, deleteStaff } = useStaff(business?.id);

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

  return (
    <AppLayout>
      <StaffList
        staff={staff}
        businessId={business.id}
        onCreateStaff={createStaff}
        onUpdateStaff={updateStaff}
        onDeleteStaff={deleteStaff}
      />
    </AppLayout>
  );
}
