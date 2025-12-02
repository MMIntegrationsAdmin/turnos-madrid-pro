-- Create enum for plan types
CREATE TYPE public.plan_type AS ENUM ('basic', 'pro');

-- Create enum for shift status
CREATE TYPE public.shift_status AS ENUM ('planned', 'worked', 'absent', 'late');

-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  barrio TEXT NOT NULL,
  tipo_local TEXT NOT NULL,
  num_empleados INTEGER DEFAULT 0,
  plan plan_type DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staff table
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'camarero',
  hourly_rate NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shifts table
CREATE TABLE public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status shift_status DEFAULT 'planned',
  absence_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "Users can view their own businesses"
  ON public.businesses FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own businesses"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own businesses"
  ON public.businesses FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for staff (through business ownership)
CREATE POLICY "Users can view staff of their businesses"
  ON public.staff FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = staff.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create staff in their businesses"
  ON public.staff FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = staff.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update staff in their businesses"
  ON public.staff FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = staff.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete staff from their businesses"
  ON public.staff FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = staff.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- RLS Policies for shifts (through business ownership)
CREATE POLICY "Users can view shifts of their businesses"
  ON public.shifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = shifts.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shifts in their businesses"
  ON public.shifts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = shifts.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update shifts in their businesses"
  ON public.shifts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = shifts.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shifts from their businesses"
  ON public.shifts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = shifts.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();