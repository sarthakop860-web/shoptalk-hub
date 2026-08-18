CREATE TABLE public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  roll_number text not null,
  topic text not null,
  file_name text not null,
  file_path text not null,
  submitted_at timestamptz not null default now()
);
GRANT SELECT, INSERT ON public.submissions TO anon;
GRANT SELECT, INSERT ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view submissions" ON public.submissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can submit" ON public.submissions FOR INSERT TO anon, authenticated WITH CHECK (true);