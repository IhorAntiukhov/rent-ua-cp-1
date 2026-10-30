import Link from "next/link";
import { Brand } from "@/components/layout/Brand.tsx";
import { buttonVariants } from "@/components/ui/button.tsx";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <Brand className="text-xl" />

      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">Сторінку не знайдено</h1>
        <p className="text-muted-foreground">Можливо, адресу введено з помилкою або сторінку вже видалено.</p>
      </div>

      <Link href="/" className={buttonVariants()}>
        До оголошень
      </Link>
    </div>
  );
}
