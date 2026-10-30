"use client";

import Link from "next/link";
import { Brand } from "@/components/layout/Brand.tsx";
import { Button, buttonVariants } from "@/components/ui/button.tsx";

// Межа помилок: непередбачена помилка відображення не залишає порожню сторінку
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <Brand className="text-xl" />

      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">Щось пішло не так</h1>
        <p className="text-muted-foreground">Спробуйте оновити сторінку або повернутися до оголошень.</p>
      </div>

      <div className="flex gap-2">
        <Button type="button" onClick={reset}>
          Спробувати знову
        </Button>

        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          До оголошень
        </Link>
      </div>
    </div>
  );
}
