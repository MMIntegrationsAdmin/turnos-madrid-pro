import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Business } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export function useBusiness() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusiness = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setBusiness(data as Business | null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del negocio',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusiness();
  }, [user]);

  const createBusiness = async (businessData: Omit<Business, 'id' | 'owner_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...businessData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setBusiness(data as Business);
      toast({
        title: 'Éxito',
        description: 'Negocio creado correctamente',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el negocio',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateBusiness = async (updates: Partial<Business>) => {
    if (!business) return null;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', business.id)
        .select()
        .single();

      if (error) throw error;
      setBusiness(data as Business);
      toast({
        title: 'Éxito',
        description: 'Negocio actualizado correctamente',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el negocio',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    business,
    loading,
    createBusiness,
    updateBusiness,
    refetch: fetchBusiness,
  };
}
