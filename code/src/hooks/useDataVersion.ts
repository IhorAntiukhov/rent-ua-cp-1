"use client";

import { useSyncExternalStore } from "react";
import { useServices } from "@/container/ServicesProvider.tsx";

// Номер версії даних: змінюється після кожного оновлення репозиторіїв.
// Хуки, що читають репозиторії, мають включати його в залежності useMemo
export function useDataVersion(): number {
  const { sync } = useServices();

  return useSyncExternalStore(sync.subscribe, sync.getVersion, sync.getVersion);
}
