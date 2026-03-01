
ALTER TABLE public.students ADD COLUMN roll_number text;
ALTER TABLE public.students ADD CONSTRAINT students_roll_number_unique UNIQUE (roll_number);
