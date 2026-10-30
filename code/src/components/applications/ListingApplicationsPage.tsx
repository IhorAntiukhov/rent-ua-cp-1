"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { ApplicationsTable } from "@/components/applications/ApplicationsTable.tsx";
import { Button, buttonVariants } from "@/components/ui/button.tsx";
import { APPLICATION_STATUS_LABELS, ApplicationStatus } from "@/domain/enums.ts";
import { useListing } from "@/hooks/useListing.ts";
import { useListingApplications } from "@/hooks/useListingApplications.ts";
import { cn } from "@/lib/utils.ts";

const STATUSES = Object.values(ApplicationStatus);

function Message({ title, text }: { title: string; text: string }) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{text}</p>

      <Link href="/my/listings" className={buttonVariants({ variant: "outline" })}>
        До моїх оголошень
      </Link>
    </main>
  );
}

// Заявки на оголошення для його власника з фільтром за станом
export function ListingApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const { userId } = useAuth();
  const listing = useListing(id);
  const allApplications = useListingApplications(id);
  const [status, setStatus] = useState<ApplicationStatus | null>(null);

  if (userId === null) return null;

  if (!listing) return <Message title="Оголошення не знайдено" text="Можливо, його вже скасовано." />;

  if (!listing.isOwnedBy(userId)) {
    return <Message title="Немає доступу" text="Заявки бачить лише власник оголошення." />;
  }

  const visibleApplications =
    status === null ? allApplications : allApplications.filter((application) => application.status === status);

  const countOf = (candidate: ApplicationStatus) =>
    allApplications.filter((application) => application.status === candidate).length;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <Link href="/my/listings" className={cn(buttonVariants({ variant: "ghost" }), "self-start")}>
        <ArrowLeft />
        Мої оголошення
      </Link>

      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">Заявки на оголошення</h1>
        <p className="text-muted-foreground">{listing.address.format()}</p>
      </div>

      <div className="flex flex-wrap gap-1" role="group" aria-label="Фільтр за станом">
        <Button
          type="button"
          size="sm"
          variant={status === null ? "default" : "outline"}
          aria-pressed={status === null}
          onClick={() => setStatus(null)}
        >
          Усі ({allApplications.length})
        </Button>

        {STATUSES.map((candidate) => (
          <Button
            key={candidate}
            type="button"
            size="sm"
            variant={status === candidate ? "default" : "outline"}
            aria-pressed={status === candidate}
            onClick={() => setStatus(candidate)}
          >
            {APPLICATION_STATUS_LABELS[candidate]} ({countOf(candidate)})
          </Button>
        ))}
      </div>

      {visibleApplications.length === 0 ? (
        <p className="text-muted-foreground">Заявок немає.</p>
      ) : (
        <ApplicationsTable applications={visibleApplications} ownerId={userId} canApprove={listing.isOpen} />
      )}
    </main>
  );
}
