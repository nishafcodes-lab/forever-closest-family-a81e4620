
-- Add 'teacher' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';

-- Add status column to profiles (pending by default)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Add role column to profiles to store selected role during signup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student';

-- Update existing profiles to approved so current users aren't locked out
UPDATE public.profiles SET status = 'approved' WHERE status = 'pending';
