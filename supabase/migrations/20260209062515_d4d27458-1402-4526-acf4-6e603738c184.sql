
-- Create a helper function to get a user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.user_roles WHERE user_id = _user_id ORDER BY 
      CASE role::text
        WHEN 'admin' THEN 1 
        WHEN 'teacher' THEN 2 
        WHEN 'user' THEN 3 
      END
    LIMIT 1),
    'user'
  );
$$;
