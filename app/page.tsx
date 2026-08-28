import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="mb-2 text-2xl font-bold">Patient Intake</h1>
      <p className="mb-6 text-sm text-gray-600">
        Open both views in separate tabs to see them sync.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/patient"
          className="rounded-lg bg-green-700 px-4 py-3 font-medium text-white transition hover:bg-green-800"
        >
          Patient Form
        </Link>
        <Link
          href="/staff"
          className="rounded-lg border border-green-700 px-4 py-3 font-medium text-green-700 transition hover:bg-green-100"
        >
          Staff View
        </Link>
      </div>
    </main>
  );
}
