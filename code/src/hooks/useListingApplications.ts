"use client";

import { useMemo } from "react";
import { useServices } from "@/container/ServicesProvider.tsx";
import type { Application } from "@/domain/Application.ts";
import type { ApplicationStatus } from "@/domain/enums.ts";
import { useDataVersion } from "./useDataVersion.ts";

// Заявки на оголошення (нові спершу); без status – у всіх станах
export function useListingApplications(listingId: string, status?: ApplicationStatus): Application[] {
  const { applications } = useServices();
  const version = useDataVersion();

  return useMemo(() => {
    void version;

    return applications.findByListing(listingId, status);
  }, [applications, listingId, status, version]);
}
