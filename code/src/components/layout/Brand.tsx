import Link from "next/link";
import { cn } from "@/lib/utils.ts";

// Прапор України: синя смуга зверху, жовта знизу
function UkraineFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 3 2"
      role="img"
      aria-label="Прапор України"
      className={cn("h-4 w-6 shrink-0 rounded-[2px]", className)}
    >
      <rect width="3" height="1" fill="#0057B7" />
      <rect y="1" width="3" height="1" fill="#FFD700" />
    </svg>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-lg font-semibold", className)}>
      <UkraineFlag />
      RentUA
    </Link>
  );
}
