const STYLES = {
  Active: "bg-green-100 text-green-800",
  Idle: "bg-gray-100 text-gray-700",
  Submitted: "bg-green-800 text-white",
} as const;

export default function StatusBadge({ status }: { status: keyof typeof STYLES }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {status}
    </span>
  );
}
