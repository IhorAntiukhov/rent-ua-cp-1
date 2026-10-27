"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import { useDataVersion } from "./useDataVersion.ts";

// Чи збережене оголошення поточним користувачем; для гостя завжди false
export function useIsFavorite(listingId: string): boolean {
  const { favorites } = useServices();
  const { userId } = useAuth();
  const version = useDataVersion();

  return useMemo(() => {
    void version;

    return userId !== null && favorites.isFavorite(userId, listingId);
  }, [favorites, userId, listingId, version]);
}
