import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shift, ShiftStatus } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export function useShifts(businessId: string | undefined) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShifts = async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          staff (*)
        `)
        .eq('business_id', businessId)
        .order('date', { ascending: true });

      if (error) throw error;
      
      const mappedShifts = (data || []).map((shift: any) => ({
        ...shift,
        status: shift.status as ShiftStatus,
      }));
      
      setShifts(mappedShifts);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los turnos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [businessId]);

  const createShift = async (shiftData: Omit<Shift, 'id' | 'created_at' | 'updated_at' | 'staff'>) => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert(shiftData)
        .select(`
          *,
          staff (*)
        `)
        .single();

      if (error) throw error;
      
      const mappedShift = {
        ...data,
        status: data.status as ShiftStatus,
      };
      
      setShifts((prev) => [...prev, mappedShift]);
      toast({
        title: 'Éxito',
        description: 'Turno creado correctamente',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el turno',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateShift = async (id: string, updates: Partial<Shift>) => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          staff (*)
        `)
        .single();

      if (error) throw error;
      
      const mappedShift = {
        ...data,
        status: data.status as ShiftStatus,
      };
      
      setShifts((prev) => prev.map((s) => (s.id === id ? mappedShift : s)));
      toast({
        title: 'Éxito',
        description: 'Turno actualizado correctamente',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el turno',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteShift = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setShifts((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: 'Éxito',
        description: 'Turno eliminado correctamente',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el turno',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    shifts,
    loading,
    createShift,
    updateShift,
    deleteShift,
    refetch: fetchShifts,
  };
}
