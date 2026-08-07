import { prisma } from "@/lib/prisma";
import { PlanForm } from "./plan-form";

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h1 className="font-(family-name:--font-rwst-stack) text-3xl font-bold tracking-tight text-white">
          Membership Plans
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Price, name, and perks for the two membership tiers. Changes apply
          immediately to the public /membership page and new submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <PlanForm
            key={plan.key}
            plan={{
              key: plan.key,
              name: plan.name,
              months: plan.months,
              priceMmk: plan.priceMmk,
              perks: plan.perks,
              featured: plan.featured,
              isActive: plan.isActive,
            }}
          />
        ))}
      </div>
    </div>
  );
}
