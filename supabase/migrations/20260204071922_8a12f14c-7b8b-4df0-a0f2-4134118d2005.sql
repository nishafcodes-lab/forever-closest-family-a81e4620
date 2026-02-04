-- Add rating column to messages table for star reviews
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS rating integer CHECK (rating >= 1 AND rating <= 5);

-- Create videos table for video gallery
CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uploader_name text NOT NULL,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration_seconds integer,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  view_count integer DEFAULT 0
);

-- Enable RLS on videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved videos
CREATE POLICY "Anyone can view approved videos"
ON public.videos FOR SELECT
USING (status = 'approved' OR has_role(auth.uid(), 'admin'));

-- Authenticated users can upload videos
CREATE POLICY "Authenticated users can upload videos"
ON public.videos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own pending videos
CREATE POLICY "Users can update own pending videos"
ON public.videos FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by AND status = 'pending');

-- Admins can update any video
CREATE POLICY "Admins can update videos"
ON public.videos FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete videos
CREATE POLICY "Admins can delete videos"
ON public.videos FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create profiles table for user display names
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text NOT NULL,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Update messages policy to require authentication for inserts
DROP POLICY IF EXISTS "Anyone can submit messages" ON public.messages;

CREATE POLICY "Authenticated users can submit messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add user_id to messages for linking to authenticated users
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable realtime for videos table
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;