"use client";

import { useRouter } from "next/navigation";
import type { AgencyRequest } from "@/lib/api/types";
import { createAgency, listCities, listServices } from "@/lib/api/admin";
import { useAsync } from "@/lib/use-async";
import { useToast } from "@/components/admin/Toast";
import AgencyForm from "@/components/admin/AgencyForm";
import { ErrorBanner, Loading, PageHeader } from "@/components/admin/ui";

export default function NewAgencyPage() {
  const router = useRouter();
  const toast = useToast();
  const options = useAsync(() => Promise.all([listCities(), listServices()]));

  async function handleSubmit(input: AgencyRequest) {
    const agency = await createAgency(input);
    toast.show(`${agency.name} created — now add its packages`);
    router.push(`/admin/agencies/${agency.id}/edit`);
  }

  return (
    <div>
      <PageHeader title="Add Agency" description="New agencies start as drafts unless you choose another status." />
      <div className="mt-6 max-w-3xl">
        <ErrorBanner error={options.error} onRetry={options.reload} />
        {!options.data ? (
          !options.error && <Loading />
        ) : (
          <AgencyForm
            cities={options.data[0]}
            services={options.data[1]}
            onSubmit={handleSubmit}
            submitLabel="Create Agency"
          />
        )}
      </div>
    </div>
  );
}
