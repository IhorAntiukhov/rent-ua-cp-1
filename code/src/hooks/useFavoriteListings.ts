"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import type { Listing } from "@/domain/Listing.ts";
import { useDataVersion } from "./useDataVersion.ts";

// Збережені оголошення поточного користувача, нещодавно додані спершу;
// оголошення, яких уже немає, пропускаються
export function useFavoriteListings(): Listing[] {
  // Дані лежать у змінних репозиторіях: без цього React Compiler відкидає залежність від version
  "use no memo";

  const { favorites, listings } = useServices();
  const { userId } = useAuth();
  const version = useDataVersion();

  return useMemo(() => {
    void version;

    if (userId === null) return [];

    const result: Listing[] = [];

    for (const listingId of favorites.findFavoriteListingIds(userId)) {
      const listing = listings.get(listingId);
      if (listing) result.push(listing);
    }

    return result;
  }, [favorites, listings, userId, version]);
}
