"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { OwnerActions } from "@/components/listings/OwnerActions.tsx";
import { SortControl } from "@/components/listings/SortControl.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { buttonVariants } from "@/components/ui/button.tsx";
import { LISTING_STATUS_LABELS, ApplicationStatus } from "@/domain/enums.ts";
import type { Listing } from "@/domain/Listing.ts";
import { useListingApplications } from "@/hooks/useListingApplications.ts";
import { useListingSearch } from "@/hooks/useListingSearch.ts";
import { formatPrice } from "@/lib/format.ts";
import { ListingQuery, type SortDirection, type SortField } from "@/repositories/ListingQuery.ts";

function MyListingRow({ listing, userId }: { listing: Listing; userId: string }) {
  const applications = useListingApplications(listing.id);
  const pendingCount = applications.filter((application) => application.status === ApplicationStatus.Pending).length;

  return (
    <li className="grid gap-3 rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Link href={`/listings/${listing.id}`} className="font-medium underline-offset-4 hover:underline">
          {listing.address.format()}
        </Link>

        <Badge variant={listing.isOpen ? "default" : "secondary"}>{LISTING_STATUS_LABELS[listing.status]}</Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        {formatPrice(listing.pricePerMonth)} · Заявок: {applications.length}
        {pendingCount > 0 && ` (очікують: ${pendingCount})`}
      </p>

      <OwnerActions listing={listing} userId={userId} size="default" />
    </li>
  );
}

export function MyListingsPage() {
  const { userId } = useAuth();
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const query = useMemo(
    () => ListingQuery.create().withOwner(userId).withSorting(sortField, sortDirection),
    [userId, sortField, sortDirection],
  );
  const listings = useListingSearch(query);

  if (userId === null) return null;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Мої оголошення</h1>

        <Link href="/my/listings/new" className={buttonVariants()}>
          Створити оголошення
        </Link>
      </div>

      <SortControl
        id="my-listings-sort"
        field={sortField}
        direction={sortDirection}
        onChange={(field, direction) => {
          setSortField(field);
          setSortDirection(direction);
        }}
      />

      {listings.length === 0 ? (
        <p className="text-muted-foreground">У вас ще немає оголошень. Створіть перше.</p>
      ) : (
        <ul className="grid gap-4">
          {listings.map((listing) => (
            <MyListingRow key={listing.id} listing={listing} userId={userId} />
          ))}
        </ul>
      )}
    </main>
  );
}
