"use client"

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

//Config array for the input form
const FIELDS: { name: string; label: string; type?: string; options?: string[]; required?: boolean }[] = [
  { name: "first_name", label: "First Name", required: true },
  { name: "middle_name", label: "Middle Name" },
  { name: "last_name", label: "Last Name", required: true },
  { name: "date_of_birth", label: "Date of Birth", type: "date", required: true },
  { name: "gender", label: "Gender", options: ["Female", "Male", "Other"], required: true },
  { name: "phone", label: "Phone Number", type: "tel", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "address", label: "Address", required: true },
  { name: "preferred_language", label: "Preferred Language", required: true },
  { name: "nationality", label: "Nationality", required: true },
  { name: "emergency_contact_name", label: "Emergency Contact Name" },
  { name: "emergency_contact_relationship", label: "Relationship" },
  { name: "religion", label: "Religion" },
];

//Builds a empnty form object
const EMPTY = Object.fromEntries(FIELDS.map((f) => [f.name, ""]));

//Picks only the form's own fields off a saved row, so id/created_at/etc never get sent back on autosave
function formOnly(row: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(FIELDS.map((f) => [f.name, (row[f.name] as string | null) ?? ""]));
}

//Postgres rejects "" for typed columns like date, so swap empty strings for null before saving
function forDatabase(values: Record<string, string>) {
  return Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === "" ? null : v]));
}

export default function PatientPage() {
  const [data, setData] = useState<Record<string, string>>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [id, setId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const started = useRef(false); //stops React Strict Mode from double-firing this in dev and creating two rows

  //resume session
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function createSession() {
      const { data: row, error } = await supabase.from("patient_sessions").insert({}).select("id").single();
      if (error || !row) {
        setSaveError(true);
        return;
      }
      localStorage.setItem("session_id", row.id);
      setId(row.id);
    }

    async function start() {
      const existing = localStorage.getItem("session_id");
      if (!existing) {
        await createSession();
        return;
      }

      const { data: row } = await supabase
        .from("patient_sessions")
        .select("*")
        .eq("id", existing)
        .maybeSingle(); //won't throw if the stored id no longer matches a row

      if (!row) {
        //stale id from a deleted row — drop it and start fresh instead of getting stuck
        localStorage.removeItem("session_id");
        await createSession();
        return;
      }

      setId(row.id);
      setSubmitted(!!row.submitted_at);
      setData(formOnly(row));
    }

    start();
  }, []);

  //save to supabase after 500ms of inactivity
  useEffect(() => {
    if (!id || submitted) return;
    const timer = setTimeout(async () => {
      const { error } = await supabase.from("patient_sessions").update(forDatabase(data)).eq("id", id);
      setSaveError(!!error);
      setSaved(!error);
    }, 500);
    return () => clearTimeout(timer);
  }, [data, id, submitted]);

  //Handles input changes
  function handleChange(name: string, value: string) {
    setData({ ...data, [name]: value });
    setSaved(false);
  }

  //Validates the input data throughtout the form
  function validate() {
     const errs: Record<string, string> = {};
    for (const f of FIELDS) {
      if (f.required && !data[f.name]) errs[f.name] = "Required";
    }
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) errs.email = "Invalid email";
    if (data.phone && !/^[\d\s()+-]{7,20}$/.test(data.phone)) errs.phone = "Invalid phone number";
    return errs;
  }

  //When submitted, validates the form
   async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !id) return;
    const { error } = await supabase
      .from("patient_sessions")
      .update({ ...forDatabase(data), submitted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      setSaveError(true);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return <main className="p-8 text-center">Thank you. Your information has been submitted.</main>;
  }

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">Patient Intake Form</h1>

      <p className={`text-sm mb-6 ${saveError ? "text-red-600" : ""}`}>
        {saveError ? "Could not save — check your connection" : saved ? "Saved" : "Saving..."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {FIELDS.map((f) => (
          <div key={f.name}>
            <label className="block font-bold mb-1">
              {f.label}
              {f.required && " *"}
            </label>
            {f.options ? (
              <select
                value={data[f.name]}
                onChange={(e) => handleChange(f.name, e.target.value)}
                className="border border-black w-full p-2"
              >
                <option value="">Select</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type || "text"}
                value={data[f.name]}
                onChange={(e) => handleChange(f.name, e.target.value)}
                className="border border-black w-full p-2"
              />
            )}
            {errors[f.name] && <p className="text-red-600 text-sm">{errors[f.name]}</p>}
          </div>
        ))}

        <button type="submit" className="bg-green-700 text-white py-2 mt-2">
          Submit
        </button>
      </form>
    </main>
  );
}