-- Create videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('videos', 'videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']);

-- Storage policy: Anyone can view videos
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Storage policy: Authenticated users can upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policy: Users can update their own videos
CREATE POLICY "Users can update own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policy: Admins can delete videos
CREATE POLICY "Admins can delete videos storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND has_role(auth.uid(), 'admin'));

-- Tighten the messages INSERT policy to require user_id
DROP POLICY IF EXISTS "Authenticated users can submit messages" ON public.messages;

CREATE POLICY "Authenticated users can submit messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Tighten profiles INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);