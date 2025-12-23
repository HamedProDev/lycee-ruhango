
-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('school-reports', 'school-reports', false);

-- Storage policies for news-images bucket (public read, admin write)
CREATE POLICY "Anyone can view news images"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-images');

CREATE POLICY "Admins can upload news images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update news images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete news images"
ON storage.objects FOR DELETE
USING (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for school-reports bucket (admin access only)
CREATE POLICY "Admins can view school reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-reports' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can upload school reports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'school-reports');

CREATE POLICY "Admins can delete school reports"
ON storage.objects FOR DELETE
USING (bucket_id = 'school-reports' AND public.has_role(auth.uid(), 'admin'));

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  address TEXT,
  previous_school TEXT,
  program TEXT NOT NULL,
  level TEXT NOT NULL,
  parent_name TEXT,
  parent_phone TEXT,
  statement TEXT,
  school_report_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "Anyone can submit applications"
ON public.applications FOR INSERT
WITH CHECK (true);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.applications FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update applications
CREATE POLICY "Admins can update applications"
ON public.applications FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete applications
CREATE POLICY "Admins can delete applications"
ON public.applications FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updating updated_at
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create programs table
CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  levels TEXT NOT NULL,
  careers TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active programs
CREATE POLICY "Anyone can view active programs"
ON public.programs FOR SELECT
USING (is_active = true);

-- Admins can view all programs
CREATE POLICY "Admins can view all programs"
ON public.programs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert programs
CREATE POLICY "Admins can insert programs"
ON public.programs FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update programs
CREATE POLICY "Admins can update programs"
ON public.programs FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete programs
CREATE POLICY "Admins can delete programs"
ON public.programs FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_programs_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create settings table
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view settings
CREATE POLICY "Anyone can view settings"
ON public.settings FOR SELECT
USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can insert settings"
ON public.settings FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
ON public.settings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete settings"
ON public.settings FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES 
('school_info', '{"name": "Lycée de Ruhango Ikirezi TSS", "phone": "+250 788 123 456", "email": "info@ikirezi.rw", "address": "Ruhango District, Southern Province, Rwanda"}'::jsonb),
('social_links', '{"facebook": "", "twitter": "", "instagram": "", "youtube": ""}'::jsonb),
('admissions', '{"is_open": true, "deadline": null, "requirements": []}'::jsonb);
