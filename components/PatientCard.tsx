import { Patient, getStatus } from "@/lib/supabase";
import StatusBadge from "@/components/StatusBadge";

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

export default function PatientCard({ patient }: { patient: Patient }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-medium">
          {patient.first_name || "New session"} {patient.last_name}
        </h2>
        <StatusBadge status={getStatus(patient)} />
      </div>

      <dl className="space-y-0.5">
        {FIELD_LABELS.map(([key, label]) => (
          <div key={key} className="text-sm">
            <dt className="inline font-medium text-gray-900">{label}: </dt>
            <dd className="inline text-gray-700">{patient[key] || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
