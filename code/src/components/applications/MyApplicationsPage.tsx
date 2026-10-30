"use client";

import { useState } from "react";
import { MyApplicationRow } from "@/components/applications/MyApplicationRow.tsx";
import { Button } from "@/components/ui/button.tsx";
import { APPLICATION_STATUS_LABELS, ApplicationStatus } from "@/domain/enums.ts";
import { useMyApplications } from "@/hooks/useMyApplications.ts";

const STATUSES = Object.values(ApplicationStatus);

// Заявки орендаря за станами з лічильниками
export function MyApplicationsPage() {
  const allApplications = useMyApplications();
  const [status, setStatus] = useState<ApplicationStatus | null>(null);

  const visibleApplications =
    status === null ? allApplications : allApplications.filter((application) => application.status === status);

  const countOf = (candidate: ApplicationStatus) =>
    allApplications.filter((application) => application.status === candidate).length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Мої заявки</h1>

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
        <p className="text-muted-foreground">
          {allApplications.length === 0 ? "Ви ще не подавали заявок." : "Заявок у цьому стані немає."}
        </p>
      ) : (
        <ul className="grid gap-4">
          {visibleApplications.map((application) => (
            <MyApplicationRow key={application.id} application={application} />
          ))}
        </ul>
      )}
    </main>
  );
}
