"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { Button, buttonVariants } from "@/components/ui/button.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import { ApplicationStatus } from "@/domain/enums.ts";
import type { Listing } from "@/domain/Listing.ts";
import { useListingApplications } from "@/hooks/useListingApplications.ts";

// Керування власним оголошенням: заявки, редагування, поновлення та скасування
export function OwnerActions({ listing, userId }: { listing: Listing; userId: string }) {
  const { listingService } = useServices();
  const router = useRouter();

  const pendingCount = useListingApplications(listing.id, ApplicationStatus.Pending).length;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  async function handleReopen() {
    setIsBusy(true);

    try {
      await listingService.reopen(userId, listing.id);
      toast.success("Оголошення поновлено");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не вдалося поновити оголошення");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCancel() {
    setIsBusy(true);

    try {
      await listingService.cancel(userId, listing.id);

      toast.success("Оголошення скасовано");
      setIsConfirmOpen(false);
      router.push("/my/listings");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не вдалося скасувати оголошення");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link href={`/my/listings/${listing.id}/applications`} className={buttonVariants({ size: "lg" })}>
          Заявки
          {pendingCount > 0 && <Badge variant="secondary">{pendingCount}</Badge>}
        </Link>

        {listing.isOpen && (
          <Link href={`/my/listings/${listing.id}/edit`} className={buttonVariants({ variant: "outline", size: "lg" })}>
            Редагувати
          </Link>
        )}

        {!listing.isOpen && (
          <Button variant="outline" size="lg" disabled={isBusy} onClick={handleReopen}>
            Поновити
          </Button>
        )}

        <Button variant="destructive" size="lg" disabled={isBusy} onClick={() => setIsConfirmOpen(true)}>
          Скасувати оголошення
        </Button>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Скасувати оголошення?</AlertDialogTitle>
            <AlertDialogDescription>
              Оголошення, усі заявки на нього та збереження користувачів буде видалено остаточно.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Залишити</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isBusy} onClick={handleCancel}>
              Скасувати оголошення
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
