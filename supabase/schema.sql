-- This file handles the backend of the patient setup. 

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table for storing patient session information
CREATE TABLE IF NOT EXISTS public.patient_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text,
    middle_name text, 
    last_name text,
    date_of_birth date,
    gender text, 
    phone text,
    email text, 
    address text, 
    preferred_language text,
    nationality text, 
    emergency_contact_name text,
    emergency_contact_relationship text,
    religion text, 
    submitted_at timestamptz, 
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger function to update the updated_at column on row update
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_updated_at ON public.patient_sessions;
CREATE TRIGGER trg_touch_updated_at
  BEFORE UPDATE ON public.patient_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

-- Enable row-level security and define policies for the patient_sessions table
ALTER TABLE public.patient_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can insert" ON public.patient_sessions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can select" ON public.patient_sessions
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon can update" ON public.patient_sessions
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Broadcast live changes to the patient_sessions table via Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_sessions;