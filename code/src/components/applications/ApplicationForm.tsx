"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider.tsx";
import { TextField } from "@/components/forms/TextField.tsx";
import { Button } from "@/components/ui/button.tsx";
import { DialogClose, DialogFooter } from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import { applicationFormSchema, type ApplicationFormValues } from "@/lib/validation.ts";

interface ApplicationFormProps {
  listingId: string;
  onSubmitted: () => void;
}

// Форма заявки: ім'я підставляється з профілю, контакт і коментар вводить орендар
export function ApplicationForm({ listingId, onSubmitted }: ApplicationFormProps) {
  const { userId, profile } = useAuth();
  const { applicationService } = useServices();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: { applicantName: profile?.fullName ?? "", contact: "", comment: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (userId === null) return;

    setFormError(null);

    try {
      await applicationService.submit(userId, listingId, values);

      toast.success("Заявку подано");
      onSubmitted();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Не вдалося подати заявку");
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <TextField label="Ім'я" autoComplete="name" error={errors.applicantName?.message} {...register("applicantName")} />

      <TextField
        label="Контактні дані"
        placeholder="Телефон або email"
        autoComplete="off"
        error={errors.contact?.message}
        {...register("contact")}
      />

      <div className="grid gap-1.5">
        <Label htmlFor="application-comment">Коментар (необов&apos;язково)</Label>
        <Textarea id="application-comment" aria-invalid={errors.comment ? true : undefined} {...register("comment")} />
        {errors.comment && <p className="text-sm text-destructive">{errors.comment.message}</p>}
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Скасувати</DialogClose>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Надсилання..." : "Надіслати заявку"}
        </Button>
      </DialogFooter>
    </form>
  );
}
