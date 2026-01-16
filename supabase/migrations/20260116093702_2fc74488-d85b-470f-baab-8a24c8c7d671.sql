-- Teachers table
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Teacher',
  description TEXT,
  photo_url TEXT,
  designation TEXT CHECK (designation IN ('Legend', 'Supervisor', 'HOD', 'Teacher')) DEFAULT 'Teacher',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  batch TEXT NOT NULL DEFAULT '2021-2025',
  role TEXT CHECK (role IN ('GR', 'CR', 'Student')) DEFAULT 'Student',
  photo_url TEXT,
  bio TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Student Groups table (enhanced)
CREATE TABLE public.student_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Group Members junction table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.student_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, student_id)
);

-- Messages table with approval
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_email TEXT,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Gallery table
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  photo_url TEXT NOT NULL,
  category TEXT CHECK (category IN ('Class Days', 'Events', 'Trips', 'Farewell', 'Other')) DEFAULT 'Other',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Reunion Info table
CREATE TABLE public.reunion_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reunion_date TIMESTAMPTZ,
  venue TEXT,
  venue_address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  description TEXT,
  countdown_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default reunion info
INSERT INTO public.reunion_info (id, venue, description, countdown_enabled)
VALUES (gen_random_uuid(), 'Government Graduate College Khanpur', 'BSCS Reunion - Batch 2021-2025', true);

-- Enable RLS on all tables
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reunion_info ENABLE ROW LEVEL SECURITY;

-- Teachers policies
CREATE POLICY "Anyone can view teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Admins can insert teachers" ON public.teachers FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update teachers" ON public.teachers FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete teachers" ON public.teachers FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Students policies
CREATE POLICY "Anyone can view students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Admins can insert students" ON public.students FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update students" ON public.students FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete students" ON public.students FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Student Groups policies
CREATE POLICY "Anyone can view student_groups" ON public.student_groups FOR SELECT USING (true);
CREATE POLICY "Admins can insert student_groups" ON public.student_groups FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update student_groups" ON public.student_groups FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete student_groups" ON public.student_groups FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Group Members policies
CREATE POLICY "Anyone can view group_members" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Admins can insert group_members" ON public.group_members FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete group_members" ON public.group_members FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Messages policies
CREATE POLICY "Anyone can view approved messages" ON public.messages FOR SELECT USING (status = 'approved' OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can submit messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update messages" ON public.messages FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete messages" ON public.messages FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Gallery policies
CREATE POLICY "Anyone can view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Admins can insert gallery" ON public.gallery FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update gallery" ON public.gallery FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete gallery" ON public.gallery FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Reunion Info policies
CREATE POLICY "Anyone can view reunion_info" ON public.reunion_info FOR SELECT USING (true);
CREATE POLICY "Admins can update reunion_info" ON public.reunion_info FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Create storage buckets for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('teachers', 'teachers', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('students', 'students', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT DO NOTHING;

-- Storage policies for teachers bucket
CREATE POLICY "Anyone can view teacher photos" ON storage.objects FOR SELECT USING (bucket_id = 'teachers');
CREATE POLICY "Admins can upload teacher photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'teachers' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update teacher photos" ON storage.objects FOR UPDATE USING (bucket_id = 'teachers' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete teacher photos" ON storage.objects FOR DELETE USING (bucket_id = 'teachers' AND has_role(auth.uid(), 'admin'));

-- Storage policies for students bucket
CREATE POLICY "Anyone can view student photos" ON storage.objects FOR SELECT USING (bucket_id = 'students');
CREATE POLICY "Admins can upload student photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'students' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update student photos" ON storage.objects FOR UPDATE USING (bucket_id = 'students' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete student photos" ON storage.objects FOR DELETE USING (bucket_id = 'students' AND has_role(auth.uid(), 'admin'));

-- Storage policies for gallery bucket
CREATE POLICY "Anyone can view gallery photos" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Admins can upload gallery photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update gallery photos" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete gallery photos" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_student_groups_updated_at BEFORE UPDATE ON public.student_groups FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_reunion_info_updated_at BEFORE UPDATE ON public.reunion_info FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();