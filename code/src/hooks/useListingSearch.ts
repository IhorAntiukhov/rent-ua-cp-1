"use client";

import { useMemo } from "react";
import { useServices } from "@/container/ServicesProvider.tsx";
import type { Listing } from "@/domain/Listing.ts";
import type { ListingQuery } from "@/repositories/ListingQuery.ts";
import { useDataVersion } from "./useDataVersion.ts";

// Результат пошуку за запитом; перераховується при зміні запиту або даних
export function useListingSearch(query: ListingQuery): Listing[] {
  // Дані лежать у змінних репозиторіях: без цього React Compiler відкидає залежність від version
  "use no memo";

  const { listings } = useServices();
  const version = useDataVersion();

  return useMemo(() => {
    void version;

    return listings.search(query);
  }, [listings, query, version]);
}
