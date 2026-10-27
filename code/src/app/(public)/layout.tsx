import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader.tsx";
import { DataGate } from "@/components/layout/DataGate.tsx";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <DataGate>{children}</DataGate>
    </>
  );
}
