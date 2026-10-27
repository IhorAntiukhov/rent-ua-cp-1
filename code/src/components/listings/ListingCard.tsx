import Link from "next/link";
import { FavoriteButton } from "@/components/listings/FavoriteButton.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { LISTING_STATUS_LABELS } from "@/domain/enums.ts";
import type { Listing } from "@/domain/Listing.ts";
import { formatArea, formatPrice, formatRooms } from "@/lib/format.ts";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Card className="relative transition-shadow hover:ring-primary/60">
      <CardHeader>
        <CardTitle className="text-base leading-snug">
          {/* Розтягнуте посилання робить клікабельною всю картку, а серце лежить над ним */}
          <Link href={`/listings/${listing.id}`} className="after:absolute after:inset-0">
            {listing.address.format()}
          </Link>
        </CardTitle>

        <CardAction>
          <FavoriteButton listingId={listing.id} />
        </CardAction>
      </CardHeader>

      <CardContent className="grid gap-3">
        <p className="text-sm text-muted-foreground">
          {formatRooms(listing.rooms)} · {formatArea(listing.area)}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-semibold">{formatPrice(listing.pricePerMonth)}</span>
          <Badge variant={listing.isOpen ? "default" : "secondary"}>{LISTING_STATUS_LABELS[listing.status]}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
