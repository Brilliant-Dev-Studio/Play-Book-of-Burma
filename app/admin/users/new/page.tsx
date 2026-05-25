import { SubscriberForm } from "@/app/admin/components/subscriber-form";

export default function NewUserPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
          New User
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Create a subscriber account with membership in one step.
        </p>
      </div>
      <SubscriberForm />
    </div>
  );
}
