"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { PageSkeleton } from "@/components/layout/PageSkeleton.tsx";
import { loginHref } from "@/lib/navigation.ts";

// Пускає лише авторизованих; гостя переспрямовує на вхід із поверненням на цю сторінку
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "guest") router.replace(loginHref(pathname));
  }, [status, pathname, router]);

  if (status !== "user") return <PageSkeleton />;
  return <>{children}</>;
}
