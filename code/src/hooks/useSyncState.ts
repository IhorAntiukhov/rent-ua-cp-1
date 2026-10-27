"use client";

import { useSyncExternalStore } from "react";
import { useServices } from "@/container/ServicesProvider.tsx";

// Підписує компонент на оновлення даних; повертає стан синхронізації
export function useSyncState() {
  const { sync } = useServices();
  useSyncExternalStore(sync.subscribe, sync.getVersion, sync.getVersion);
  return {
    listingsReady: sync.listingsReady,
    userDataReady: sync.userDataReady,
    error: sync.error,
  };
}
