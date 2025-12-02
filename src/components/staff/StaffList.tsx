import { useState } from 'react';
import { Staff } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, User, Phone, Mail } from 'lucide-react';
import { StaffDialog } from './StaffDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StaffListProps {
  staff: Staff[];
  businessId: string;
  onCreateStaff: (staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  onUpdateStaff: (id: string, updates: Partial<Staff>) => Promise<any>;
  onDeleteStaff: (id: string) => Promise<boolean>;
}

export function StaffList({
  staff,
  businessId,
  onCreateStaff,
  onUpdateStaff,
  onDeleteStaff,
}: StaffListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  const handleEdit = (member: Staff) => {
    setSelectedStaff(member);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedStaff(null);
    setDialogOpen(true);
  };

  const handleDelete = (member: Staff) => {
    setStaffToDelete(member);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (staffToDelete) {
      await onDeleteStaff(staffToDelete.id);
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Personal</h2>
          <p className="text-muted-foreground">
            Gestiona los empleados de tu negocio
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Añadir empleado
        </Button>
      </div>

      {staff.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              No hay empleados
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Añade tu primer empleado para empezar a gestionar turnos
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir empleado
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Card key={member.id} className="group relative overflow-hidden transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {member.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{member.full_name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={member.is_active ? 'default' : 'secondary'}>
                    {member.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2 text-sm">
                  {member.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {member.hourly_rate.toFixed(2)}€/hora
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(member)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StaffDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedStaff(null);
        }}
        businessId={businessId}
        staff={selectedStaff}
        onCreateStaff={onCreateStaff}
        onUpdateStaff={onUpdateStaff}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a {staffToDelete?.full_name} y todos sus turnos
              asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
