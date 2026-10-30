"use client";

import Link from "next/link";
import { ListingCard } from "@/components/listings/ListingCard.tsx";
import { buttonVariants } from "@/components/ui/button.tsx";
import { useFavoriteListings } from "@/hooks/useFavoriteListings.ts";

// Збережені оголошення: нещодавно додані спершу
export function FavoritesPage() {
  const listings = useFavoriteListings();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Збережені</h1>

      {listings.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-muted-foreground">Ви ще нічого не зберегли. Натисніть серце на оголошенні.</p>

          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            До оголошень
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}
