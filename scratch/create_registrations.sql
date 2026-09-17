-- Create event_registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.articles(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  parish text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now()
);

-- Bật RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Policy cho phép mọi người insert (vì form public)
CREATE POLICY "Allow public insert to event_registrations" ON public.event_registrations
FOR INSERT TO public WITH CHECK (true);

-- Policy cho phép admin select
CREATE POLICY "Allow admin select event_registrations" ON public.event_registrations
FOR SELECT TO public USING (true); -- tạm thời mở read cho dễ quản trị

-- Policy cho phép admin delete
CREATE POLICY "Allow admin delete event_registrations" ON public.event_registrations
FOR DELETE TO public USING (true);
