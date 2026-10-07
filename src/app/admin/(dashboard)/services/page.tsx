"use client";

import { useState } from "react";
import type { ServiceRequest, ServiceResponse } from "@/lib/api/types";
import { createService, deleteService, listServices, updateService } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/http";
import { useAsync } from "@/lib/use-async";
import { cn } from "@/lib/utils";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import {
  dangerLinkButton,
  ErrorBanner,
  Field,
  inputClass,
  linkButton,
  orNull,
  PageHeader,
  primaryButton,
  secondaryButton,
} from "@/components/admin/ui";

const CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

export default function AdminServicesPage() {
  const toast = useToast();
  const services = useAsync(listServices);
  const [editing, setEditing] = useState<ServiceResponse | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ServiceResponse | null>(null);

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteService(target.id);
      toast.show(`“${target.name}” removed`);
      services.reload();
    } catch (err) {
      toast.show(
        err instanceof ApiError && err.status === 409
          ? `“${target.name}” is still used by agencies or packages and can't be deleted.`
          : errorMessage(err),
        "error",
      );
    }
  }

  const columns: DataTableColumn<ServiceResponse>[] = [
    {
      key: "name",
      header: "Service",
      render: (s) => (
        <div>
          <p className="font-medium text-ink">{s.name}</p>
          <p className="text-xs text-ink-soft">
            {s.code} · /{s.slug}
          </p>
        </div>
      ),
      sortValue: (s) => s.name,
    },
    {
      key: "keywords",
      header: "Keywords",
      render: (s) => <span className="text-xs text-ink-soft">{s.keywords.join(", ") || "—"}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Services"
        description="Services power the public filters, quiz, quote form and package editor."
      />

      <div className="mt-5 max-w-2xl">
        <ServiceForm
          key={editing?.id ?? "new"}
          initial={editing ?? undefined}
          onCancel={editing ? () => setEditing(null) : undefined}
          onSubmit={async (body) => {
            if (editing) {
              const updated = await updateService(editing.id, body);
              toast.show(`“${updated.name}” saved`);
              setEditing(null);
            } else {
              const created = await createService(body);
              toast.show(`“${created.name}” added`);
            }
            services.reload();
          }}
        />
      </div>

      <div className="mt-6">
        <ErrorBanner error={services.error} onRetry={services.reload} />
        {!services.data ? (
          !services.error && <p className="text-sm text-ink-soft">Loading…</p>
        ) : (
          <DataTable
            columns={columns}
            data={services.data}
            getRowId={(s) => String(s.id)}
            searchPlaceholder="Search services…"
            onRefresh={services.reload}
            refreshing={services.loading}
            refreshLabel="services"
            searchFn={(s, q) => `${s.name} ${s.code} ${s.slug}`.toLowerCase().includes(q)}
            renderActions={(s) => (
              <>
                <button type="button" onClick={() => setEditing(s)} className={linkButton}>
                  Edit
                </button>
                <button type="button" onClick={() => setPendingDelete(s)} className={dangerLinkButton}>
                  Delete
                </button>
              </>
            )}
          />
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete service?"
        description={`“${pendingDelete?.name}” will be removed from the site. This fails while any agency or package still uses it.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function ServiceForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: ServiceResponse;
  onSubmit: (body: ServiceRequest) => Promise<void>;
  onCancel?: () => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [keywords, setKeywords] = useState((initial?.keywords ?? []).join(", "));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!CODE_PATTERN.test(code)) next.code = "UPPER_SNAKE_CASE, e.g. EMAIL_MARKETING";
    if (!name.trim()) next.name = "Name is required";
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await onSubmit({
        code,
        name: name.trim(),
        slug: orNull(slug),
        keywords: keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      });
      if (!initial) {
        setCode("");
        setName("");
        setSlug("");
        setKeywords("");
      }
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const input = (key: string) => cn(inputClass, errors[key] && "border-danger");

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-sm border border-mist bg-surface p-5" noValidate>
      <h2 className="text-sm font-bold text-ink">{initial ? `Edit ${initial.name}` : "Add a service"}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Code *" error={errors.code} hint={initial ? "Can't be changed" : undefined}>
          <input
            value={code}
            maxLength={30}
            disabled={Boolean(initial)}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
            placeholder="EMAIL_MARKETING"
            className={input("code")}
          />
        </Field>
        <Field label="Name *" error={errors.name}>
          <input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Email Marketing" className={input("name")} />
        </Field>
        <Field label="Slug" error={errors.slug} hint="Blank = generated">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="email-marketing" className={input("slug")} />
        </Field>
      </div>
      <Field label="Keywords" error={errors.keywords} hint="Comma-separated alternative words for this service">
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="email, newsletter, mailchimp"
          className={input("keywords")}
        />
      </Field>
      <ErrorBanner error={formError} />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? "Saving…" : initial ? "Save service" : "+ Add service"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButton}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
