import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { AppLayout } from '@/components/layout/AppLayout';
import { CreateBusinessForm } from '@/components/onboarding/CreateBusinessForm';
import { BusinessProfile } from '@/components/business/BusinessProfile';

export default function Negocio() {
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading, updateBusiness } = useBusiness();

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
      <BusinessProfile business={business} onUpdate={updateBusiness} />
    </AppLayout>
  );
}
