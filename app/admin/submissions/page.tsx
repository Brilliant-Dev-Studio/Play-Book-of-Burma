import { DateRangeFilter } from "@/app/admin/components/date-range-filter";
import { SubmissionsTable } from "@/app/admin/components/submissions-table";

export default function AdminSubmissionsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
            Membership Submissions
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Payment screenshots from prospective subscribers. Approve to create an account.
          </p>
        </div>
        <DateRangeFilter />
      </div>

      <SubmissionsTable />
    </div>
  );
}
