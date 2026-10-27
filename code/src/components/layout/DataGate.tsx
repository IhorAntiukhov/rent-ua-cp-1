"use client";

import type { ReactNode } from "react";
import { PageSkeleton } from "@/components/layout/PageSkeleton.tsx";
import { useSyncState } from "@/hooks/useSyncState.ts";

interface DataGateProps {
  // true для захищених сторінок: чекати ще й на заявки та вподобання користувача
  requireUserData?: boolean;
  children: ReactNode;
}

// Показує дітей, коли потрібні дані завантажені; до того – скелетон, при помилці – повідомлення
export function DataGate({ requireUserData = false, children }: DataGateProps) {
  const { listingsReady, userDataReady, error } = useSyncState();

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      </div>
    );
  }
  if (!listingsReady || (requireUserData && !userDataReady)) return <PageSkeleton />;

  return <>{children}</>;
}
