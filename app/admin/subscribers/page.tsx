import { DateRangeFilter } from "@/app/admin/components/date-range-filter";
import { WatchHrSection } from "@/app/admin/components/watch-hr-section";
import { DemographicProfile } from "@/app/admin/components/demographic-profile";
import { WatchHrOverviewChart } from "@/app/admin/components/watch-hr-overview-chart";

export default function AdminSubscribersPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
            Subscribers Overview
          </h1>
          <p className="mt-1 text-sm text-white/55">Analysis</p>
        </div>
        <DateRangeFilter />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <WatchHrSection />
        <DemographicProfile />
      </div>

      <WatchHrOverviewChart />
    </div>
  );
}
