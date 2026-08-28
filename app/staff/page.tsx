"use client";

import { useEffect, useState } from "react";
import { supabase, Patient, getStatus } from "@/lib/supabase";

// Config array
const FIELD_LABELS: [keyof Patient, string][] = [
  ["middle_name", "Middle Name"],
  ["date_of_birth", "Date of Birth"],
  ["gender", "Gender"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["address", "Address"],
  ["preferred_language", "Preferred Language"],
  ["nationality", "Nationality"],
  ["emergency_contact_name", "Emergency Contact"],
  ["emergency_contact_relationship", "Relationship"],
  ["religion", "Religion"],
];

// hold collection of patients keyed by id
export default function StaffPage() {
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [, setTick] = useState(0);

  const [loading, setLoading] = useState(true);

  // fetches all patients from supabase
  useEffect(() => {
    supabase
      .from("patient_sessions")
      .select("*")
      .then(({ data, error }) => {
        if (error) {
          console.error("Supabase error:", error);
          setLoading(false);
          return;
        }

        if (!data) {
          setLoading(false);
          return;
        }

        const map: Record<string, Patient> = {};
        for (const row of data as Patient[]) {
          map[row.id] = row;
        }
        setPatients(map);
        setLoading(false);
      });
  }, []);

  // subscribe to realtime changes on patient_sessions
  useEffect(() => {
    const channel = supabase
      .channel("staff")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patient_sessions" },
        (payload) => {
          const row = payload.new as Patient;
          setPatients((prev) => ({ ...prev, [row.id]: row }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // re-render every 2s so "Active" flips to "Idle" without a new event
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(timer);
  }, []);

  // an array of just the patients values and sorted by the most recent
  const list = Object.values(patients).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Staff View — Live</h1>

      {loading && <p>Loading patients…</p>}
      {!loading && list.length === 0 && <p>No patients yet.</p>}
      {/* {list.length === 0 && <p>No patients yet.</p>} */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p) => {
          const status = getStatus(p);
          const color =
            status === "Active"
              ? "text-green-700"
              : status === "Idle"
              ? "text-black"
              : "text-green-900";
          return (
            <div key={p.id} className="border border-black bg-white p-4">
              <div className="flex justify-between items-baseline mb-2">
                <h2 className="font-bold">
                  {p.first_name || "New"} {p.last_name}
                </h2>
                <span className={`text-sm font-bold ${color}`}>{status}</span>
              </div>
              {FIELD_LABELS.map(([key, label]) => (
                <p key={key} className="text-sm">
                  <span className="font-bold">{label}:</span> {p[key] || "—"}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </main>
  );
}