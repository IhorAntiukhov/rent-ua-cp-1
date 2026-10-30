"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { TextField } from "@/components/forms/TextField.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Address } from "@/domain/Address.ts";
import { listingFormSchema, type ListingFormValues } from "@/lib/validation.ts";

interface ListingFormProps {
  initialValues: Partial<ListingFormValues>;
  submitLabel: string;
  onSubmit: (values: ListingFormValues) => Promise<void>;
  onCancel: () => void;
}

// Форма створення й редагування оголошення; значення полів перевіряє Zod-схема
export function ListingForm({ initialValues, submitLabel, onSubmit, onCancel }: ListingFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: initialValues,
  });

  const address = useWatch({ control, name: "address" });
  const isAddressFilled = Boolean(
    address?.country?.trim() &&
      address.city?.trim() &&
      address.street?.trim() &&
      address.building?.trim() &&
      address.apartment?.trim(),
  );

  const submit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Не вдалося зберегти оголошення");
    }
  });

  return (
    <form onSubmit={submit} className="grid gap-8" noValidate>
      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">Адреса</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Країна" error={errors.address?.country?.message} {...register("address.country")} />
          <TextField label="Місто" error={errors.address?.city?.message} {...register("address.city")} />
          <TextField label="Вулиця" error={errors.address?.street?.message} {...register("address.street")} />
          <TextField label="Будинок" error={errors.address?.building?.message} {...register("address.building")} />
          <TextField label="Квартира" error={errors.address?.apartment?.message} {...register("address.apartment")} />
        </div>

        <p className="text-sm text-muted-foreground">
          {isAddressFilled ? Address.create(address as Required<ListingFormValues["address"]>).format() : "Адреса одним рядком з'явиться тут"}
        </p>
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">Житло</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            label="Кількість кімнат"
            type="number"
            inputMode="numeric"
            error={errors.rooms?.message}
            {...register("rooms", { valueAsNumber: true })}
          />
          <TextField
            label="Площа, м²"
            type="number"
            step="any"
            inputMode="decimal"
            error={errors.area?.message}
            {...register("area", { valueAsNumber: true })}
          />
          <TextField
            label="Ціна, грн/міс"
            type="number"
            inputMode="numeric"
            error={errors.pricePerMonth?.message}
            {...register("pricePerMonth", { valueAsNumber: true })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="listing-description">Опис</Label>
          <Textarea
            id="listing-description"
            rows={4}
            aria-invalid={errors.description ? true : undefined}
            {...register("description")}
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">Контакти власника</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Ім'я" autoComplete="name" error={errors.ownerName?.message} {...register("ownerName")} />
          <TextField
            label="Телефон"
            type="tel"
            placeholder="+380XXXXXXXXX"
            autoComplete="tel"
            error={errors.ownerPhone?.message}
            {...register("ownerPhone")}
          />
        </div>
      </section>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Збереження..." : submitLabel}
        </Button>

        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Скасувати
        </Button>
      </div>
    </form>
  );
}
