import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth.tsx";
import { AppHeader } from "@/components/layout/AppHeader.tsx";
import { DataGate } from "@/components/layout/DataGate.tsx";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <RequireAuth>
        <DataGate requireUserData>{children}</DataGate>
      </RequireAuth>
    </>
  );
}
