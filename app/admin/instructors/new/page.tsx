import { InstructorForm } from "@/app/admin/components/instructor-form";

export default function NewInstructorPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
          New Instructor
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Create a host that videos can be bound to.
        </p>
      </div>
      <InstructorForm mode="create" />
    </div>
  );
}
