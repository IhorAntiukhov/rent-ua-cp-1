"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { PageSkeleton } from "@/components/layout/PageSkeleton.tsx";
import { getReturnPath } from "@/lib/navigation.ts";

// Для сторінок входу й реєстрації: авторизованих повертає на попередню сторінку
export function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "user") router.replace(getReturnPath());
  }, [status, router]);

  if (status !== "guest") return <PageSkeleton />;
  return <>{children}</>;
}
