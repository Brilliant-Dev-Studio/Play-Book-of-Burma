"use client";

export function Repeater<T>({
  title,
  items,
  onAdd,
  onRemove,
  render,
}: {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  render: (item: T, i: number) => React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md border border-coral/40 bg-coral/10 px-3 py-1.5 text-xs font-semibold text-coral transition-colors hover:bg-coral/20"
        >
          + Add
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="relative rounded-lg border border-white/10 bg-black/40 p-4">
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="Remove"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                ×
              </button>
            )}
            {render(item, i)}
          </div>
        ))}
      </div>
    </section>
  );
}
