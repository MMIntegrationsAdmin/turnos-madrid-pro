import { useState } from 'react';
import { Business, BARRIOS_MADRID, TIPOS_LOCAL } from '@/lib/types';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, CreditCard, Check } from 'lucide-react';

interface BusinessProfileProps {
  business: Business;
  onUpdate: (updates: Partial<Business>) => Promise<any>;
}

export function BusinessProfile({ business, onUpdate }: BusinessProfileProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: business.name,
    barrio: business.barrio,
    tipo_local: business.tipo_local,
    num_empleados: business.num_empleados,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onUpdate(formData);
    setLoading(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: business.name,
      barrio: business.barrio,
      tipo_local: business.tipo_local,
      num_empleados: business.num_empleados,
    });
    setEditing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mi Negocio</h2>
        <p className="text-muted-foreground">
          Gestiona la información de tu establecimiento
        </p>
      </div>

      {/* Business info card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>{business.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {business.barrio}
                </CardDescription>
              </div>
            </div>
            {!editing && (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del local</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de local</Label>
                <Select
                  value={formData.tipo_local}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo_local: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_LOCAL.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barrio">Barrio</Label>
                <Select
                  value={formData.barrio}
                  onValueChange={(value) =>
                    setFormData({ ...formData, barrio: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BARRIOS_MADRID.map((barrio) => (
                      <SelectItem key={barrio} value={barrio}>
                        {barrio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="empleados">Número de empleados</Label>
                <Input
                  id="empleados"
                  type="number"
                  min={1}
                  value={formData.num_empleados}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      num_empleados: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tipo de local</p>
                <p className="font-medium text-foreground">{business.tipo_local}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Barrio</p>
                <p className="font-medium text-foreground">{business.barrio}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Empleados</p>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  {business.num_empleados}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan card - prepared for Stripe integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Plan actual</CardTitle>
              <CardDescription>Gestiona tu suscripción</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant={business.plan === 'pro' ? 'default' : 'secondary'} className="mb-2">
                  {business.plan === 'pro' ? 'Pro' : 'Basic'}
                </Badge>
                <h3 className="font-semibold text-foreground">
                  Plan {business.plan === 'pro' ? 'Profesional' : 'Básico'}
                </h3>
              </div>
              {business.plan === 'pro' && (
                <span className="text-2xl font-bold text-foreground">29€<span className="text-sm font-normal text-muted-foreground">/mes</span></span>
              )}
            </div>

            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                Gestión de turnos ilimitada
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                Calendario semanal visual
              </li>
              {business.plan === 'pro' ? (
                <>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    Exportación de informes
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    Soporte prioritario
                  </li>
                </>
              ) : (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  Hasta 10 empleados
                </li>
              )}
            </ul>

            {business.plan === 'basic' && (
              <Button className="w-full" variant="outline">
                Actualizar a Pro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
