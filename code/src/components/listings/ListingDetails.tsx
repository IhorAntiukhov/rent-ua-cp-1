"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { ApplyButton } from "@/components/applications/ApplyButton.tsx";
import { FavoriteButton } from "@/components/listings/FavoriteButton.tsx";
import { OwnerActions } from "@/components/listings/OwnerActions.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button, buttonVariants } from "@/components/ui/button.tsx";
import { LISTING_STATUS_LABELS } from "@/domain/enums.ts";
import type { Listing } from "@/domain/Listing.ts";
import { useListing } from "@/hooks/useListing.ts";
import { formatArea, formatDate, formatPrice, formatRoomCount } from "@/lib/format.ts";
import { loginHref } from "@/lib/navigation.ts";

// Дії залежно від ролі: власник керує, гість входить, решта подає заявку
function ListingActions({ listing }: { listing: Listing }) {
  const { status, userId } = useAuth();
  const pathname = usePathname();

  if (status === "user" && userId !== null && listing.isOwnedBy(userId)) {
    return <OwnerActions listing={listing} userId={userId} />;
  }

  if (status === "guest") {
    return (
      <Link href={loginHref(pathname)} className={buttonVariants({ size: "lg" })}>
        Увійдіть, щоб подати заявку
      </Link>
    );
  }

  return <ApplyButton listing={listing} />;
}

export function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const listing = useListing(id);
  const router = useRouter();

  // Повертає на попередню сторінку (каталог із фільтрами), а якщо її немає – на головну
  function goBack() {
    if (globalThis.history.length > 1) router.back();
    else router.push("/");
  }

  if (!listing) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 px-4 py-8">
        <h1 className="text-2xl font-semibold">Оголошення не знайдено</h1>
        <p className="text-muted-foreground">Можливо, його вже скасовано.</p>

        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          До оголошень
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <Button type="button" variant="ghost" onClick={goBack} className="self-start">
        <ArrowLeft />
        Назад
      </Button>

      <header className="flex items-start justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-2xl leading-tight font-semibold">{listing.address.format()}</h1>
          <Badge variant={listing.isOpen ? "default" : "secondary"} className="w-fit">
            {LISTING_STATUS_LABELS[listing.status]}
          </Badge>
        </div>

        <FavoriteButton listingId={listing.id} />
      </header>

      <p className="text-lg">
        {formatRoomCount(listing.rooms)} · {formatArea(listing.area)} ·{" "}
        <span className="font-semibold">{formatPrice(listing.pricePerMonth)}</span>
        <span className="block text-sm text-muted-foreground">Додано {formatDate(listing.createdAt)}</span>
      </p>

      <section className="grid gap-1">
        <h2 className="text-sm font-medium text-muted-foreground">Опис</h2>
        <p className="whitespace-pre-wrap">{listing.description || "Опис не вказано"}</p>
      </section>

      <section className="grid gap-1">
        <h2 className="text-sm font-medium text-muted-foreground">Власник</h2>
        <p>
          {listing.ownerName} ·{" "}
          <a href={`tel:${listing.ownerPhone}`} className="underline underline-offset-4">
            {listing.ownerPhone}
          </a>
        </p>
      </section>

      <ListingActions listing={listing} />
    </main>
  );
}
