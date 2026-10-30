"use client";

import { Check, X } from "lucide-react";
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
import { Button } from "@/components/ui/button.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import type { Application } from "@/domain/Application.ts";
import { APPLICATION_STATUS_LABELS, ApplicationStatus } from "@/domain/enums.ts";
import { formatDate } from "@/lib/format.ts";

interface ApplicationsTableProps {
  applications: Application[];
  ownerId: string;
}

// Кольори станів: схвалена виділена, решта приглушені
function statusVariant(status: ApplicationStatus): "default" | "outline" | "secondary" {
  if (status === ApplicationStatus.Approved) return "default";
  if (status === ApplicationStatus.Pending) return "outline";

  return "secondary";
}

export function ApplicationsTable({ applications, ownerId }: ApplicationsTableProps) {
  const { applicationService } = useServices();
  const [approving, setApproving] = useState<Application | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function run(action: () => Promise<void>, successMessage: string, fallbackError: string) {
    setIsBusy(true);

    try {
      await action();
      toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : fallbackError);
    } finally {
      setIsBusy(false);
    }
  }

  async function confirmApprove() {
    if (!approving) return;

    await run(() => applicationService.approve(ownerId, approving.id), "Заявку схвалено", "Не вдалося схвалити заявку");
    setApproving(null);
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ім&apos;я</TableHead>
            <TableHead>Контакти</TableHead>
            <TableHead>Коментар</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Стан</TableHead>
            <TableHead className="text-right">Дії</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell className="font-medium">{application.applicantName}</TableCell>
              <TableCell>{application.contact}</TableCell>
              <TableCell className="max-w-48 whitespace-normal text-muted-foreground">{application.comment ?? "–"}</TableCell>
              <TableCell>{formatDate(application.createdAt)}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(application.status)}>{APPLICATION_STATUS_LABELS[application.status]}</Badge>
              </TableCell>

              <TableCell className="text-right">
                {application.isPending && (
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="icon"
                      aria-label="Схвалити заявку"
                      disabled={isBusy}
                      onClick={() => setApproving(application)}
                    >
                      <Check />
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      aria-label="Відхилити заявку"
                      disabled={isBusy}
                      onClick={() =>
                        run(
                          () => applicationService.reject(ownerId, application.id),
                          "Заявку відхилено",
                          "Не вдалося відхилити заявку",
                        )
                      }
                    >
                      <X />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={approving !== null} onOpenChange={(open) => !open && setApproving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Схвалити заявку?</AlertDialogTitle>
            <AlertDialogDescription>
              Оголошення буде закрито, а решту заявок, що очікують, відхилено.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction disabled={isBusy} onClick={confirmApprove}>
              Схвалити й закрити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
