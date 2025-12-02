import { useState } from 'react';
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
import { useBusiness } from '@/hooks/useBusiness';
import { BARRIOS_MADRID, TIPOS_LOCAL } from '@/lib/types';
import { Clock, Building2, MapPin, Users } from 'lucide-react';

export function CreateBusinessForm() {
  const { createBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    barrio: '',
    tipo_local: '',
    num_empleados: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createBusiness({
      ...formData,
      plan: 'basic',
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Clock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            ¡Bienvenido a Turnos Madrid!
          </h1>
          <p className="text-muted-foreground">
            Vamos a configurar tu negocio para empezar
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Datos de tu negocio
            </CardTitle>
            <CardDescription>
              Introduce los datos básicos de tu local
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del local</Label>
                <Input
                  id="name"
                  placeholder="Ej: Bar La Madrileña"
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
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
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
                <Label htmlFor="barrio" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Barrio
                </Label>
                <Select
                  value={formData.barrio}
                  onValueChange={(value) =>
                    setFormData({ ...formData, barrio: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el barrio" />
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
                <Label htmlFor="empleados" className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Número de empleados
                </Label>
                <Input
                  id="empleados"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.num_empleados}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      num_empleados: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !formData.name ||
                  !formData.barrio ||
                  !formData.tipo_local
                }
              >
                {loading ? 'Creando...' : 'Crear negocio'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
