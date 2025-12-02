import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Staff, ROLES_EMPLEADO } from '@/lib/types';

interface StaffDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  staff?: Staff | null;
  onCreateStaff: (staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  onUpdateStaff: (id: string, updates: Partial<Staff>) => Promise<any>;
}

export function StaffDialog({
  open,
  onClose,
  businessId,
  staff,
  onCreateStaff,
  onUpdateStaff,
}: StaffDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'Camarero/a',
    hourly_rate: 10,
    is_active: true,
  });

  const isEditing = !!staff;

  useEffect(() => {
    if (staff) {
      setFormData({
        full_name: staff.full_name,
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role,
        hourly_rate: staff.hourly_rate,
        is_active: staff.is_active,
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        role: 'Camarero/a',
        hourly_rate: 10,
        is_active: true,
      });
    }
  }, [staff, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && staff) {
        await onUpdateStaff(staff.id, {
          full_name: formData.full_name,
          email: formData.email || null,
          phone: formData.phone || null,
          role: formData.role,
          hourly_rate: formData.hourly_rate,
          is_active: formData.is_active,
        });
      } else {
        await onCreateStaff({
          business_id: businessId,
          full_name: formData.full_name,
          email: formData.email || null,
          phone: formData.phone || null,
          role: formData.role,
          hourly_rate: formData.hourly_rate,
          is_active: formData.is_active,
        });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar empleado' : 'Nuevo empleado'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del empleado'
              : 'Añade un nuevo miembro a tu equipo'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo *</Label>
            <Input
              id="full_name"
              placeholder="Ej: María García López"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Puesto *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES_EMPLEADO.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="600 000 000"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Tarifa por hora (€)</Label>
            <Input
              id="hourly_rate"
              type="number"
              min={0}
              step={0.5}
              value={formData.hourly_rate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hourly_rate: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="is_active" className="cursor-pointer">
                Empleado activo
              </Label>
              <p className="text-sm text-muted-foreground">
                Los empleados inactivos no aparecen en el calendario
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.full_name}>
              {loading
                ? 'Guardando...'
                : isEditing
                ? 'Guardar cambios'
                : 'Añadir empleado'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
