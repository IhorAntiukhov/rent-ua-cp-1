"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import { useIsFavorite } from "@/hooks/useIsFavorite.ts";
import { loginHref } from "@/lib/navigation.ts";
import { cn } from "@/lib/utils.ts";

// Серце додає оголошення в збережені або прибирає звідти; гостя переспрямовує на вхід
export function FavoriteButton({ listingId, className }: { listingId: string; className?: string }) {
  const { userId } = useAuth();
  const { favoriteService } = useServices();
  const isFavorite = useIsFavorite(listingId);
  const pathname = usePathname();
  const router = useRouter();

  async function handleClick() {
    if (userId === null) {
      router.push(loginHref(pathname + globalThis.location.search));
      return;
    }

    try {
      await favoriteService.toggle(userId, listingId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не вдалося змінити збережені");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isFavorite ? "Прибрати зі збережених" : "Зберегти оголошення"}
      aria-pressed={isFavorite}
      onClick={handleClick}
      className={cn("relative z-10", className)}
    >
      <Heart className={cn(isFavorite && "fill-primary text-primary")} />
    </Button>
  );
}
