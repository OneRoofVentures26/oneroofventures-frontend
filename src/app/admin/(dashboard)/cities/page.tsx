"use client";

import { useState } from "react";
import type { CityResponse, LocalityResponse } from "@/lib/api/types";
import {
  createCity,
  createLocality,
  deleteCity,
  deleteLocality,
  listCities,
  listLocalities,
  updateCity,
  updateLocality,
} from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/http";
import { useAsync } from "@/lib/use-async";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import {
  dangerLinkButton,
  ErrorBanner,
  inputClass,
  linkButton,
  orNull,
  PageHeader,
  primaryButton,
  RefreshButton,
  secondaryButton,
} from "@/components/admin/ui";

type Pending = { kind: "city"; item: CityResponse } | { kind: "locality"; item: LocalityResponse };

export default function CitiesPage() {
  const toast = useToast();
  const cities = useAsync(listCities);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = cities.data?.find((c) => c.id === selectedId) ?? cities.data?.[0] ?? null;
  const localities = useAsync(
    () => (selected ? listLocalities(selected.id) : Promise.resolve([])),
    String(selected?.id ?? ""),
  );
  const [pending, setPending] = useState<Pending | null>(null);

  async function handleDelete() {
    if (!pending) return;
    const target = pending;
    setPending(null);
    try {
      if (target.kind === "city") {
        await deleteCity(target.item.id);
        cities.reload();
      } else {
        await deleteLocality(target.item.id);
        localities.reload();
      }
      toast.show(`${target.item.name} deleted`);
    } catch (err) {
      toast.show(
        err instanceof ApiError && err.status === 409
          ? `${target.item.name} is still used by agencies and can't be deleted.`
          : errorMessage(err),
        "error",
      );
    }
  }

  return (
    <div>
      <PageHeader
        title="Cities & localities"
        description="Only active cities appear on the site. Localities show up publicly once an agency is in them."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-mist bg-surface p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg text-ink">Cities</h2>
            <RefreshButton onRefresh={cities.reload} loading={cities.loading} label="cities" />
          </div>
          <div className="mt-4">
            <CityForm
              key="new-city"
              onSubmit={async (body) => {
                const city = await createCity(body);
                toast.show(`${city.name} added`);
                cities.reload();
                setSelectedId(city.id);
              }}
            />
          </div>
          <div className="mt-4">
            <ErrorBanner error={cities.error} onRetry={cities.reload} />
            {!cities.data ? (
              !cities.error && <p className="text-sm text-ink-soft">Loading…</p>
            ) : (
              <ul className="divide-y divide-mist rounded-sm border border-mist">
                {cities.data.length === 0 && <li className="p-4 text-sm text-ink-soft">No cities yet.</li>}
                {cities.data.map((c) => (
                  <CityRow
                    key={c.id}
                    city={c}
                    selected={selected?.id === c.id}
                    onSelect={() => setSelectedId(c.id)}
                    onSave={async (body) => {
                      const updated = await updateCity(c.id, body);
                      cities.setData((prev) => (prev ?? []).map((x) => (x.id === updated.id ? updated : x)));
                      toast.show(`${updated.name} saved`);
                    }}
                    onDelete={() => setPending({ kind: "city", item: c })}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-sm border border-mist bg-surface p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg text-ink">
              Localities {selected ? `in ${selected.name}` : ""}
            </h2>
            {selected && (
              <RefreshButton onRefresh={localities.reload} loading={localities.loading} label="localities" />
            )}
          </div>
          {!selected ? (
            <p className="mt-4 text-sm text-ink-soft">Add a city first.</p>
          ) : (
            <>
              <div className="mt-4">
                <LocalityForm
                  key={`new-loc-${selected.id}`}
                  onSubmit={async (name, slug) => {
                    const loc = await createLocality({ cityId: selected.id, name, slug });
                    toast.show(`${loc.name} added`);
                    localities.reload();
                  }}
                />
              </div>
              <div className="mt-4">
                <ErrorBanner error={localities.error} onRetry={localities.reload} />
                {!localities.data ? (
                  !localities.error && <p className="text-sm text-ink-soft">Loading…</p>
                ) : (
                  <ul className="divide-y divide-mist rounded-sm border border-mist">
                    {localities.data.length === 0 && (
                      <li className="p-4 text-sm text-ink-soft">No localities in {selected.name} yet.</li>
                    )}
                    {localities.data.map((l) => (
                      <LocalityRow
                        key={l.id}
                        locality={l}
                        onSave={async (name, slug) => {
                          const updated = await updateLocality(l.id, { cityId: l.cityId, name, slug });
                          localities.setData((prev) => (prev ?? []).map((x) => (x.id === updated.id ? updated : x)));
                          toast.show(`${updated.name} saved`);
                        }}
                        onDelete={() => setPending({ kind: "locality", item: l })}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={`Delete ${pending?.kind ?? ""}?`}
        description={`“${pending?.item.name}” will be removed. This fails if agencies still use it.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

function CityForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: CityResponse;
  onSubmit: (body: { name: string; slug: string | null; active: boolean }) => Promise<void>;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required");
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), slug: orNull(slug), active });
      if (!initial) {
        setName("");
        setSlug("");
        setActive(true);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder="City name" className={cn(inputClass, "mt-0")} />
        <input value={slug} maxLength={140} onChange={(e) => setSlug(e.target.value)} placeholder="slug (optional)" className={cn(inputClass, "mt-0")} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-harbor" />
          Active (shown on site)
        </label>
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? "Saving…" : initial ? "Save" : "+ Add city"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButton}>
            Cancel
          </button>
        )}
      </div>
      <ErrorBanner error={error} />
    </form>
  );
}

function CityRow({
  city,
  selected,
  onSelect,
  onSave,
  onDelete,
}: {
  city: CityResponse;
  selected: boolean;
  onSelect: () => void;
  onSave: (body: { name: string; slug: string | null; active: boolean }) => Promise<void>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <li className="p-3">
        <CityForm
          initial={city}
          onCancel={() => setEditing(false)}
          onSubmit={async (body) => {
            await onSave(body);
            setEditing(false);
          }}
        />
      </li>
    );
  }
  return (
    <li className={cn("flex items-center justify-between gap-3 px-3 py-2.5", selected && "bg-harbor-light/40")}>
      <button type="button" onClick={onSelect} className="min-w-0 text-left">
        <p className="text-sm font-medium text-ink">
          {city.name}
          {!city.active && <span className="ml-2 text-xs font-normal text-ink-soft">(inactive)</span>}
        </p>
        <p className="text-xs text-ink-soft">/{city.slug}</p>
      </button>
      <div className="flex flex-shrink-0 gap-3">
        <button type="button" onClick={() => setEditing(true)} className={linkButton}>
          Edit
        </button>
        <button type="button" onClick={onDelete} className={dangerLinkButton}>
          Delete
        </button>
      </div>
    </li>
  );
}

function LocalityForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: LocalityResponse;
  onSubmit: (name: string, slug: string | null) => Promise<void>;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required");
    setSaving(true);
    setError(null);
    try {
      await onSubmit(name.trim(), orNull(slug));
      if (!initial) {
        setName("");
        setSlug("");
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Locality name" className={cn(inputClass, "mt-0 min-w-0 flex-1")} />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (optional)" className={cn(inputClass, "mt-0 min-w-0 flex-1")} />
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? "Saving…" : initial ? "Save" : "+ Add"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButton}>
            Cancel
          </button>
        )}
      </div>
      <ErrorBanner error={error} />
    </form>
  );
}

function LocalityRow({
  locality,
  onSave,
  onDelete,
}: {
  locality: LocalityResponse;
  onSave: (name: string, slug: string | null) => Promise<void>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <li className="p-3">
        <LocalityForm
          initial={locality}
          onCancel={() => setEditing(false)}
          onSubmit={async (name, slug) => {
            await onSave(name, slug);
            setEditing(false);
          }}
        />
      </li>
    );
  }
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{locality.name}</p>
        <p className="text-xs text-ink-soft">{locality.slug}</p>
      </div>
      <div className="flex flex-shrink-0 gap-3">
        <button type="button" onClick={() => setEditing(true)} className={linkButton}>
          Edit
        </button>
        <button type="button" onClick={onDelete} className={dangerLinkButton}>
          Delete
        </button>
      </div>
    </li>
  );
}
