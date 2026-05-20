export function StatCard({
  label,
  value,
  unit,
  delta,
  deltaDirection = "up",
  compareLabel = "Vs last 30 days",
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  compareLabel?: string;
}) {
  const isUp = deltaDirection === "up";

  return (
    <div className="rounded-xl border border-white/15 bg-black px-4 py-4 text-center">
      <p className="text-xs text-white/85">{label}</p>

      <div className="mt-3 flex items-baseline justify-center gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {unit && <span className="text-xs font-semibold text-white/55">{unit}</span>}
      </div>

      {delta && (
        <p className="mt-3 text-xs">
          <span className={isUp ? "text-emerald-400" : "text-red-400"}>
            {isUp ? "+" : "-"}
            {delta}
          </span>
          <span className="text-white/70"> {compareLabel}</span>
        </p>
      )}
    </div>
  );
}
