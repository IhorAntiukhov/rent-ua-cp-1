"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import { useDataVersion } from "./useDataVersion.ts";

// Чи подав поточний користувач заявку на це оголошення, що ще очікує; для гостя false
export function useHasPendingApplication(listingId: string): boolean {
  const { applications } = useServices();
  const { userId } = useAuth();
  const version = useDataVersion();

  return useMemo(() => {
    void version;

    return userId !== null && applications.hasPendingApplication(userId, listingId);
  }, [applications, userId, listingId, version]);
}
