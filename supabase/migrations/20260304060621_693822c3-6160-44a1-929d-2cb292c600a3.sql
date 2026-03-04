CREATE TABLE public.student_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status_type TEXT NOT NULL DEFAULT 'Not Updated',
  company TEXT,
  job_title TEXT,
  location TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

ALTER TABLE public.student_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view student status"
ON public.student_status FOR SELECT USING (true);

CREATE POLICY "Users can insert own status"
ON public.student_status FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own status or admin"
ON public.student_status FOR UPDATE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete status"
ON public.student_status FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));