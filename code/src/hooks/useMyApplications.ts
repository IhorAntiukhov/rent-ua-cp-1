"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import type { Application } from "@/domain/Application.ts";
import type { ApplicationStatus } from "@/domain/enums.ts";
import { useDataVersion } from "./useDataVersion.ts";

// Заявки поточного користувача як орендаря (нові спершу); без status – у всіх станах
export function useMyApplications(status?: ApplicationStatus): Application[] {
  // Дані лежать у змінних репозиторіях: без цього React Compiler відкидає залежність від version
  "use no memo";

  const { applications } = useServices();
  const { userId } = useAuth();
  const version = useDataVersion();

  return useMemo(() => {
    void version;

    return userId === null ? [] : applications.findByApplicant(userId, status);
  }, [applications, userId, status, version]);
}
