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
import { Checkbox } from '@/components/ui/checkbox';
import { Staff, Shift, ShiftStatus, SHIFT_STATUS_LABELS } from '@/lib/types';
import { Trash2, Users } from 'lucide-react';

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
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
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
      setSelectedStaffIds([]);
    } else if (initialStaffId && initialDate) {
      setFormData({
        staff_id: initialStaffId,
        date: format(initialDate, 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '17:00',
        status: 'planned',
        absence_reason: '',
      });
      setSelectedStaffIds([initialStaffId]);
    } else if (initialDate) {
      setFormData({
        staff_id: '',
        date: format(initialDate, 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '17:00',
        status: 'planned',
        absence_reason: '',
      });
      setSelectedStaffIds([]);
    }
  }, [shift, initialStaffId, initialDate, open]);

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const selectAllStaff = () => {
    const activeStaff = staff.filter((s) => s.is_active);
    if (selectedStaffIds.length === activeStaff.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(activeStaff.map((s) => s.id));
    }
  };

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
        // Create shifts for all selected staff members
        const promises = selectedStaffIds.map((staffId) =>
          onCreateShift({
            business_id: businessId,
            staff_id: staffId,
            date: formData.date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            status: formData.status,
            absence_reason: formData.absence_reason || null,
          })
        );
        await Promise.all(promises);
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

  const activeStaff = staff.filter((s) => s.is_active);
  const allSelected = activeStaff.length > 0 && selectedStaffIds.length === activeStaff.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar turno' : 'Nuevo turno'}
          </DialogTitle>
          <DialogDescription>
            {initialDate && !isEditing && (
              <>
                {format(initialDate, "EEEE d 'de' MMMM", { locale: es })}
                {selectedStaffIds.length === 1 && (
                  <> - {staff.find((s) => s.id === selectedStaffIds[0])?.full_name}</>
                )}
                {selectedStaffIds.length > 1 && (
                  <> - {selectedStaffIds.length} empleados seleccionados</>
                )}
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
          {isEditing ? (
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
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Empleados
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllStaff}
                  className="h-auto py-1 px-2 text-xs"
                >
                  {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </Button>
              </div>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-muted/30">
                {activeStaff.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No hay empleados activos
                  </p>
                ) : (
                  activeStaff.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selectedStaffIds.includes(member.id)}
                        onCheckedChange={() => toggleStaffSelection(member.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.full_name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
              {selectedStaffIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedStaffIds.length} empleado{selectedStaffIds.length > 1 ? 's' : ''} seleccionado{selectedStaffIds.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

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
            <Button 
              type="submit" 
              disabled={loading || (isEditing ? !formData.staff_id : selectedStaffIds.length === 0)}
            >
              {loading 
                ? 'Guardando...' 
                : isEditing 
                  ? 'Guardar cambios' 
                  : selectedStaffIds.length > 1 
                    ? `Crear ${selectedStaffIds.length} turnos` 
                    : 'Crear turno'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
