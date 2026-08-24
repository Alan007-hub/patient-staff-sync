import { createClient } from "@supabase/supabase-js"; //supabase client builder function

//create shared client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

//Typescript interface for patient data
export interface Patient {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  preferred_language: string;
  nationality: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  religion: string;
  submitted_at: string | null;
  updated_at: string;
}

//Patient count as active if we heard from them in the last 8 seconds.
export function getStatus(p: Patient): "Active" | "Idle" | "Submitted" {
  if (p.submitted_at) return "Submitted";
  const secondsSinceUpdate = (Date.now() - new Date(p.updated_at).getTime()) / 1000;
  return secondsSinceUpdate < 8 ? "Active" : "Idle";
}
