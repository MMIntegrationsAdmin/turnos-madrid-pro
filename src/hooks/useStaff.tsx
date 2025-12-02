import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Staff } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export function useStaff(businessId: string | undefined) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('business_id', businessId)
        .order('full_name');

      if (error) throw error;
      setStaff(data as Staff[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el personal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [businessId]);

  const createStaff = async (staffData: Omit<Staff, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert(staffData)
        .select()
        .single();

      if (error) throw error;
      setStaff((prev) => [...prev, data as Staff]);
      toast({
        title: 'Éxito',
        description: 'Empleado añadido correctamente',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo añadir el empleado',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateStaff = async (id: string, updates: Partial<Staff>) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setStaff((prev) => prev.map((s) => (s.id === id ? (data as Staff) : s)));
      toast({
        title: 'Éxito',
        description: 'Empleado actualizado correctamente',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el empleado',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setStaff((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: 'Éxito',
        description: 'Empleado eliminado correctamente',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el empleado',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    staff,
    loading,
    createStaff,
    updateStaff,
    deleteStaff,
    refetch: fetchStaff,
  };
}
