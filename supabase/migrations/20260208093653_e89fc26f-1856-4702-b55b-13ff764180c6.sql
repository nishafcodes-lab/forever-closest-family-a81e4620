-- Create a SECURITY DEFINER function to get user's conversation IDs without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_conversation_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT conversation_id FROM chat_participants WHERE user_id = _user_id;
$$;

-- Fix chat_conversations SELECT policy (was self-referencing wrong column)
DROP POLICY IF EXISTS "Users can view their conversations" ON public.chat_conversations;
CREATE POLICY "Users can view their conversations"
ON public.chat_conversations FOR SELECT
USING (
  id IN (SELECT public.get_user_conversation_ids(auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Fix chat_conversations UPDATE policy (same bug)
DROP POLICY IF EXISTS "Participants can update conversations" ON public.chat_conversations;
CREATE POLICY "Participants can update conversations"
ON public.chat_conversations FOR UPDATE
USING (
  id IN (SELECT public.get_user_conversation_ids(auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Fix chat_participants SELECT policy (was causing infinite recursion)
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.chat_participants;
CREATE POLICY "Users can view participants of their conversations"
ON public.chat_participants FOR SELECT
USING (
  conversation_id IN (SELECT public.get_user_conversation_ids(auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);