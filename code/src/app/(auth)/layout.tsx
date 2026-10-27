import type { ReactNode } from "react";
import { GuestOnly } from "@/components/auth/GuestOnly.tsx";
import { Brand } from "@/components/layout/Brand.tsx";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestOnly>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
        <Brand className="text-xl" />
        {children}
      </div>
    </GuestOnly>
  );
}
