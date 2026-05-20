import { SectionBlock } from "@/app/admin/components/section-block";
import { StatCard } from "@/app/admin/components/stat-card";
import { SubscribersOverviewChart } from "@/app/admin/components/subscribers-overview-chart";
import { RecentSubscribersTable } from "@/app/admin/components/recent-subscribers-table";
import { DateRangeFilter } from "@/app/admin/components/date-range-filter";

const DASHBOARD_DATA = {
  actionRequired: [
    { label: "New Subscribers", value: "10", delta: "10 %", direction: "up" as const },
    { label: "Approval Pending", value: "7", delta: "2 %", direction: "down" as const },
    { label: "Approval Time / Subscriber", value: "1.4", unit: "days", delta: "12 %", direction: "down" as const },
  ],
  traffic: [
    { label: "All Unique Visitors", value: "24,318", delta: "14 %", direction: "up" as const },
    { label: "Visitors on Membership Page", value: "3,420", delta: "6 %", direction: "up" as const },
    { label: "Conversion to Subscribers", value: "3.7", unit: "%", delta: "0.8 %", direction: "up" as const },
  ],
  revenue: [
    { label: "Total Revenue", value: "12,840,000", unit: "MMK", delta: "18 %", direction: "up" as const },
    { label: "No. of Subscribers", value: "256", delta: "9 %", direction: "up" as const },
    { label: "Revenue / Customer", value: "50,156", unit: "MMK", delta: "1 %", direction: "up" as const },
  ],
};

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/55">Overview of Platform Activity</p>
        </div>
        <DateRangeFilter />
      </div>

      <SectionBlock title="Action Required">
        {DASHBOARD_DATA.actionRequired.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            unit={s.unit}
            delta={s.delta}
            deltaDirection={s.direction}
          />
        ))}
      </SectionBlock>

      <SectionBlock title="Website Traffic">
        {DASHBOARD_DATA.traffic.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            unit={s.unit}
            delta={s.delta}
            deltaDirection={s.direction}
          />
        ))}
      </SectionBlock>

      <SectionBlock title="Revenue Overview">
        {DASHBOARD_DATA.revenue.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            unit={s.unit}
            delta={s.delta}
            deltaDirection={s.direction}
          />
        ))}
      </SectionBlock>

      <SubscribersOverviewChart />

      <RecentSubscribersTable />
    </div>
  );
}
