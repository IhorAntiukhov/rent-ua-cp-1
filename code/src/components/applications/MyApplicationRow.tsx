"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import type { Application } from "@/domain/Application.ts";
import { APPLICATION_STATUS_LABELS, ApplicationStatus } from "@/domain/enums.ts";
import { useListing } from "@/hooks/useListing.ts";
import { formatArea, formatDate, formatPrice, formatRooms } from "@/lib/format.ts";

function statusVariant(status: ApplicationStatus): "default" | "outline" | "secondary" {
  if (status === ApplicationStatus.Approved) return "default";
  if (status === ApplicationStatus.Pending) return "outline";

  return "secondary";
}

// Заявка орендаря з даними оголошення; заявку, що очікує, можна видалити
export function MyApplicationRow({ application }: { application: Application }) {
  const { userId } = useAuth();
  const { applicationService } = useServices();
  const listing = useListing(application.listingId);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  async function handleDelete() {
    if (userId === null) return;

    setIsBusy(true);

    try {
      await applicationService.withdraw(userId, application.id);

      toast.success("Заявку видалено");
      setIsConfirmOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не вдалося видалити заявку");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <li className="grid gap-3 rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        {listing ? (
          <Link href={`/listings/${listing.id}`} className="font-medium underline-offset-4 hover:underline">
            {listing.address.format()}
          </Link>
        ) : (
          <span className="text-muted-foreground">Оголошення недоступне</span>
        )}

        <Badge variant={statusVariant(application.status)}>{APPLICATION_STATUS_LABELS[application.status]}</Badge>
      </div>

      {listing && (
        <p className="text-sm text-muted-foreground">
          {formatRooms(listing.rooms)} · {formatArea(listing.area)} · {formatPrice(listing.pricePerMonth)}
        </p>
      )}

      <p className="text-sm text-muted-foreground">Подано {formatDate(application.createdAt)}</p>

      {/* Контакти власника потрібні орендарю, лише коли заявку схвалено */}
      {listing && application.status === ApplicationStatus.Approved && (
        <p className="text-sm">
          Власник: {listing.ownerName} ·{" "}
          <a href={`tel:${listing.ownerPhone}`} className="underline underline-offset-4">
            {listing.ownerPhone}
          </a>
        </p>
      )}

      {application.isPending && (
        <div>
          <Button type="button" variant="destructive" disabled={isBusy} onClick={() => setIsConfirmOpen(true)}>
            Видалити заявку
          </Button>
        </div>
      )}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити заявку?</AlertDialogTitle>
            <AlertDialogDescription>Заявка повністю зникне, власник більше не побачить її.</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Залишити</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isBusy} onClick={handleDelete}>
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
