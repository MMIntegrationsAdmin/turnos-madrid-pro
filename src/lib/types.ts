export interface Business {
  id: string;
  owner_id: string;
  name: string;
  barrio: string;
  tipo_local: string;
  num_empleados: number;
  plan: 'basic' | 'pro';
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  business_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  hourly_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: string;
  business_id: string;
  staff_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'planned' | 'worked' | 'absent' | 'late';
  absence_reason: string | null;
  created_at: string;
  updated_at: string;
  staff?: Staff;
}

export type ShiftStatus = 'planned' | 'worked' | 'absent' | 'late';

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  planned: 'Planificado',
  worked: 'Trabajado',
  absent: 'Ausente',
  late: 'Tarde',
};

export const BARRIOS_MADRID = [
  'Centro',
  'Arganzuela',
  'Retiro',
  'Salamanca',
  'Chamartín',
  'Tetuán',
  'Chamberí',
  'Fuencarral-El Pardo',
  'Moncloa-Aravaca',
  'Latina',
  'Carabanchel',
  'Usera',
  'Puente de Vallecas',
  'Moratalaz',
  'Ciudad Lineal',
  'Hortaleza',
  'Villaverde',
  'Villa de Vallecas',
  'Vicálvaro',
  'San Blas-Canillejas',
  'Barajas',
];

export const TIPOS_LOCAL = [
  'Bar',
  'Restaurante',
  'Cafetería',
  'Pub',
  'Discoteca',
  'Terraza',
  'Taberna',
  'Gastrobar',
  'Cervecería',
  'Coctelería',
];

export const ROLES_EMPLEADO = [
  'Camarero/a',
  'Cocinero/a',
  'Ayudante de cocina',
  'Barman/Barmaid',
  'Encargado/a',
  'Jefe/a de sala',
  'Hostess',
  'Limpieza',
  'Repartidor/a',
];
