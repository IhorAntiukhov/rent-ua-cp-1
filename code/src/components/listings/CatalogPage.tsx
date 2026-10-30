"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CatalogFilterBar } from "@/components/listings/CatalogFilterBar.tsx";
import { ListingCard } from "@/components/listings/ListingCard.tsx";
import { Button, buttonVariants } from "@/components/ui/button.tsx";
import { useListingSearch } from "@/hooks/useListingSearch.ts";
import {
  buildListingQuery,
  DEFAULT_FILTERS,
  parseCatalogFilters,
  serializeCatalogFilters,
  type CatalogFilters,
} from "@/lib/catalogFilters.ts";
import { formatListingsCount } from "@/lib/format.ts";

const PAGE_SIZE = 12;

// Початковий стан береться з URL; компонент рендериться лише на клієнті (після DataGate)
function readFiltersFromUrl(): CatalogFilters {
  if (typeof location === "undefined") return DEFAULT_FILTERS;

  return parseCatalogFilters(new URLSearchParams(location.search));
}

export function CatalogPage() {
  const [filters, setFilters] = useState<CatalogFilters>(readFiltersFromUrl);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const query = useMemo(() => buildListingQuery(filters), [filters]);
  const results = useListingSearch(query);

  // Адреса сторінки відображає поточні фільтри, щоб ними можна було поділитись
  useEffect(() => {
    const queryString = serializeCatalogFilters(filters);

    globalThis.history.replaceState(null, "", queryString ? `?${queryString}` : globalThis.location.pathname);
  }, [filters]);

  function updateFilters(changes: Partial<CatalogFilters>) {
    setFilters((current) => ({ ...current, ...changes }));
    setVisibleCount(PAGE_SIZE);
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleListings = results.slice(0, visibleCount);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Оголошення про оренду</h1>

        <Link href="/my/listings/new" className={buttonVariants()}>
          Створити оголошення
        </Link>
      </div>

      <CatalogFilterBar filters={filters} onChange={updateFilters} onReset={resetFilters} />

      <p className="text-sm text-muted-foreground">
        {results.length === 0 ? "Нічого не знайдено" : `Знайдено ${formatListingsCount(results.length)}`}
      </p>

      {visibleListings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {results.length > visibleCount && (
        <Button type="button" variant="outline" className="self-center" onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}>
          Показати ще
        </Button>
      )}
    </main>
  );
}
