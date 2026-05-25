import { AdminForm } from "@/app/admin/components/admin-form";

export default function NewAdminPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
          New Admin
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Grant admin access to a new staff account.
        </p>
      </div>
      <AdminForm />
    </div>
  );
}
