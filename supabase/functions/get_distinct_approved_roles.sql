CREATE OR REPLACE FUNCTION public.get_distinct_approved_roles()
RETURNS TABLE (role app_role)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT role
  FROM user_roles
  WHERE approved = true
  ORDER BY role;
$$;