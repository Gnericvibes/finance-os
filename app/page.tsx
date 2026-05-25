import { EntryForm } from "@/features/pfos/components/entry-form";

export default function HomePage() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        PFOS Dashboard
      </h1>

      <EntryForm />
    </main>
  );
}