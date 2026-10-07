// Shared by the client grid and the server-rendered landing pages, so it must not live in a client module.
import type { ListingParams, ListingSort } from "@/lib/api/types";

export const GRID_PAGE_SIZE = 12;

export interface GridFilters {
  service: string;
  locality: string;
  budgetMax: number | null;
  pricesOnly: boolean;
  verifiedOnly: boolean;
  sort: ListingSort;
  page: number;
}

export const DEFAULT_GRID_FILTERS: GridFilters = {
  service: "",
  locality: "",
  budgetMax: null,
  pricesOnly: false,
  verifiedOnly: false,
  sort: "recent",
  page: 0,
};

export function gridParams(partial: Partial<GridFilters> = {}): ListingParams {
  const f = { ...DEFAULT_GRID_FILTERS, ...partial };
  return {
    service: f.service || undefined,
    locality: f.locality || undefined,
    budgetMax: f.budgetMax ?? undefined,
    pricesOnly: f.pricesOnly,
    verifiedOnly: f.verifiedOnly,
    sort: f.sort,
    page: f.page,
    size: GRID_PAGE_SIZE,
  };
}
