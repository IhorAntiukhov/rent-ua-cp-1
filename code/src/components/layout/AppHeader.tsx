"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { Brand } from "@/components/layout/Brand.tsx";
import { buttonVariants } from "@/components/ui/button.tsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import { cn } from "@/lib/utils.ts";

const USER_LINKS = [
  { href: "/favorites", label: "Збережені" },
  { href: "/my/applications", label: "Мої заявки" },
  { href: "/my/listings", label: "Мої оголошення" },
];

export function AppHeader() {
  const { status, profile } = useAuth();
  const { authService } = useServices();
  const pathname = usePathname();
  const router = useRouter();

  const links = [{ href: "/", label: "Оголошення" }, ...(status === "user" ? USER_LINKS : [])];

  async function handleLogout() {
    await authService.logout();

    router.push("/");
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3">
        <Brand />
        <nav className="flex flex-1 flex-wrap items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === link.href && "bg-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {status === "user" && (
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "outline" })}>
              {profile ? profile.fullName : "Акаунт"}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>Вийти</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {status === "guest" && (
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              Увійти
            </Link>
            <Link href="/register" className={buttonVariants()}>
              Зареєструватися
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
