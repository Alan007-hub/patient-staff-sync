"use client";

type Props = {
  label: string;
  name: string;
  value: string;
  error?: string;
  type?: string;
  options?: string[];
  required?: boolean;
  onChange: (name: string, value: string) => void;
};

export default function FormField({
  label,
  name,
  value,
  error,
  type = "text",
  options,
  required,
  onChange,
}: Props) {
  const className =
    "w-full rounded-lg border px-3 py-3 outline-none transition " +
    "focus:ring-2 focus:ring-green-600 " +
    (error ? "border-red-500" : "border-gray-300");

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      {options ? (
        <select
          id={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className={className}
          aria-invalid={!!error}
        >
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className={className}
          aria-invalid={!!error}
        />
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
