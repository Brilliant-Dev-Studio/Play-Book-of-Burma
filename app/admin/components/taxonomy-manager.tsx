"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { inputClass, labelClass } from "@/app/admin/components/form-field-styles";

export type TaxonomyRow = {
  id: string;
  name: string;
  order: number;
  videoCount: number;
};

type SaveFn = (input: {
  id?: string;
  name: string;
  order: number;
}) => Promise<{ ok: true; id: string } | { ok: false; errors: string[] }>;

type DeleteFn = (id: string) => Promise<{ ok: true } | { ok: false; error: string }>;

export function TaxonomyManager({
  title,
  subtitle,
  items,
  save,
  remove,
}: {
  title: string;
  subtitle: string;
  items: TaxonomyRow[];
  save: SaveFn;
  remove: DeleteFn;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState<number>(items.length);
  const [errors, setErrors] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState<number>(0);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  function startEdit(row: TaxonomyRow) {
    setEditingId(row.id);
    setEditName(row.name);
    setEditOrder(row.order);
    setRowError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditOrder(0);
  }

  function onCreate() {
    setErrors([]);
    startTransition(async () => {
      const result = await save({ name: newName, order: Number(newOrder) || 0 });
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setNewName("");
      setNewOrder(items.length + 1);
      router.refresh();
    });
  }

  function onSaveEdit() {
    if (!editingId) return;
    startTransition(async () => {
      const result = await save({
        id: editingId,
        name: editName,
        order: Number(editOrder) || 0,
      });
      if (!result.ok) {
        setRowError({ id: editingId, message: result.errors.join(" ") });
        return;
      }
      cancelEdit();
      router.refresh();
    });
  }

  function onRemove(row: TaxonomyRow) {
    if (row.videoCount > 0) {
      setRowError({
        id: row.id,
        message: `Cannot delete — ${row.videoCount} video(s) still reference it.`,
      });
      return;
    }
    if (!confirm(`Delete "${row.name}"?`)) return;
    startTransition(async () => {
      const result = await remove(row.id);
      if (!result.ok) {
        setRowError({ id: row.id, message: result.error });
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-1 text-sm text-white/55">{subtitle}</p>
      </div>

      {/* Create form */}
      <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <h2 className="mb-4 text-base font-bold tracking-tight text-white">Add new</h2>
        {errors.length > 0 && (
          <div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {errors.join(" ")}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px_auto]">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Education"
            />
          </div>
          <div>
            <label className={labelClass}>Order</label>
            <input
              type="number"
              className={inputClass}
              value={newOrder}
              onChange={(e) => setNewOrder(Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={onCreate}
              disabled={pending || !newName.trim()}
              className="w-full rounded-md bg-coral px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Add"}
            </button>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="overflow-hidden rounded-2xl border border-white/15 bg-black">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-coral text-black">
              <th className="px-4 py-3 text-left font-bold">Name</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Order</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Videos</th>
              <th className="px-4 py-3 text-right font-bold whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-white/55">
                  No entries yet. Add one above.
                </td>
              </tr>
            )}
            {items.map((row) => {
              const isEditing = editingId === row.id;
              const hasErr = rowError?.id === row.id;
              return (
                <tr key={row.id} className="border-t border-white/10 text-white/90">
                  {isEditing ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          className={inputClass}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          className={`${inputClass} w-24`}
                          value={editOrder}
                          onChange={(e) => setEditOrder(Number(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">
                        {row.videoCount}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={onSaveEdit}
                          disabled={pending}
                          className="mr-2 rounded-md bg-coral px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-coral/90 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={pending}
                          className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-semibold text-white">{row.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{row.order}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{row.videoCount}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="mr-2 rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemove(row)}
                          disabled={pending}
                          className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                  {hasErr && (
                    <td colSpan={4} className="border-t border-red-500/30 bg-red-500/5 px-4 py-2 text-xs text-red-300">
                      {rowError!.message}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
