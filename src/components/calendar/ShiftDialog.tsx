import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Staff, Shift, ShiftStatus, SHIFT_STATUS_LABELS } from '@/lib/types';
import { Trash2 } from 'lucide-react';

interface ShiftDialogProps {
  open: boolean;
  onClose: () => void;
  staff: Staff[];
  businessId: string;
  initialStaffId?: string;
  initialDate?: Date;
  shift?: Shift | null;
  onCreateShift: (shift: Omit<Shift, 'id' | 'created_at' | 'updated_at' | 'staff'>) => Promise<any>;
  onUpdateShift: (id: string, updates: Partial<Shift>) => Promise<any>;
  onDeleteShift: (id: string) => Promise<boolean>;
}

export function ShiftDialog({
  open,
  onClose,
  staff,
  businessId,
  initialStaffId,
  initialDate,
  shift,
  onCreateShift,
  onUpdateShift,
  onDeleteShift,
}: ShiftDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: '',
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    status: 'planned' as ShiftStatus,
    absence_reason: '',
  });

  const isEditing = !!shift;

  useEffect(() => {
    if (shift) {
      setFormData({
        staff_id: shift.staff_id,
        date: shift.date,
        start_time: shift.start_time.slice(0, 5),
        end_time: shift.end_time.slice(0, 5),
        status: shift.status,
        absence_reason: shift.absence_reason || '',
      });
    } else if (initialStaffId && initialDate) {
      setFormData({
        staff_id: initialStaffId,
        date: format(initialDate, 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '17:00',
        status: 'planned',
        absence_reason: '',
      });
    }
  }, [shift, initialStaffId, initialDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && shift) {
        await onUpdateShift(shift.id, {
          staff_id: formData.staff_id,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          status: formData.status,
          absence_reason: formData.absence_reason || null,
        });
      } else {
        await onCreateShift({
          business_id: businessId,
          staff_id: formData.staff_id,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          status: formData.status,
          absence_reason: formData.absence_reason || null,
        });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!shift) return;
    setLoading(true);
    const success = await onDeleteShift(shift.id);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  const selectedStaff = staff.find((s) => s.id === formData.staff_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar turno' : 'Nuevo turno'}
          </DialogTitle>
          <DialogDescription>
            {initialDate && !isEditing && (
              <>
                {format(initialDate, "EEEE d 'de' MMMM", { locale: es })}
                {selectedStaff && ` - ${selectedStaff.full_name}`}
              </>
            )}
            {isEditing && shift?.staff && (
              <>
                {format(new Date(shift.date + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })}
                {' - '}
                {shift.staff.full_name}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staff">Empleado</Label>
            <Select
              value={formData.staff_id}
              onValueChange={(value) =>
                setFormData({ ...formData, staff_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona empleado" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name} - {member.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Hora inicio</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">Hora fin</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value: ShiftStatus) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SHIFT_STATUS_LABELS) as ShiftStatus[]).map(
                  (status) => (
                    <SelectItem key={status} value={status}>
                      {SHIFT_STATUS_LABELS[status]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {formData.status === 'absent' && (
            <div className="space-y-2">
              <Label htmlFor="absence_reason">Motivo de ausencia</Label>
              <Textarea
                id="absence_reason"
                placeholder="Ej: Baja médica, vacaciones..."
                value={formData.absence_reason}
                onChange={(e) =>
                  setFormData({ ...formData, absence_reason: e.target.value })
                }
              />
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.staff_id}>
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear turno'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
