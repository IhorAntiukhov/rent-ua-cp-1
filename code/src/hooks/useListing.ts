"use client";

import { useMemo } from "react";
import { useServices } from "@/container/ServicesProvider.tsx";
import type { Listing } from "@/domain/Listing.ts";
import { useDataVersion } from "./useDataVersion.ts";

// Оголошення за id; undefined, якщо його немає (наприклад, видалене)
export function useListing(listingId: string): Listing | undefined {
  // Дані лежать у змінних репозиторіях: без цього React Compiler відкидає залежність від version
  "use no memo";

  const { listings } = useServices();
  const version = useDataVersion();

  return useMemo(() => {
    void version;

    return listings.get(listingId);
  }, [listings, listingId, version]);
}
