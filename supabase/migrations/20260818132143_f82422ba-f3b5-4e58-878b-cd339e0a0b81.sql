CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- The very first account created becomes the admin.
CREATE OR REPLACE FUNCTION public.grant_first_user_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_first_user_admin();

-- Submissions: anyone may submit, only admins may read or delete.
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.submissions;

CREATE POLICY "Admins can view submissions"
ON public.submissions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete submissions"
ON public.submissions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

REVOKE SELECT ON public.submissions FROM anon;
GRANT INSERT ON public.submissions TO anon;
GRANT SELECT, INSERT, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;

-- Storage: anyone may upload, only admins may read/delete.
DROP POLICY IF EXISTS "Anyone can read presentations" ON storage.objects;
DROP POLICY IF EXISTS "Public read presentations" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view presentations" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can download presentations" ON storage.objects;

CREATE POLICY "Admins can read presentations"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'presentations' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete presentations"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'presentations' AND public.has_role(auth.uid(), 'admin'));