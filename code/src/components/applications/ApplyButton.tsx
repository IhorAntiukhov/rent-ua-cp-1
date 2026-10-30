"use client";

import { useState } from "react";
import { ApplicationForm } from "@/components/applications/ApplicationForm.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import type { Listing } from "@/domain/Listing.ts";
import { useHasPendingApplication } from "@/hooks/useHasPendingApplication.ts";

// Кнопка «Подати заявку» з діалогом; неактивна для закритого оголошення або якщо заявку вже подано
export function ApplyButton({ listing }: { listing: Listing }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasPending = useHasPendingApplication(listing.id);

  if (!listing.isOpen) {
    return (
      <Button disabled size="lg">
        Оголошення закрите
      </Button>
    );
  }

  if (hasPending) {
    return (
      <Button disabled size="lg">
        Заявку вже подано
      </Button>
    );
  }

  return (
    <>
      <Button size="lg" onClick={() => setIsOpen(true)}>
        Подати заявку
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заявка на оренду</DialogTitle>
            <DialogDescription>{listing.address.format()}</DialogDescription>
          </DialogHeader>

          <ApplicationForm listingId={listing.id} onSubmitted={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
