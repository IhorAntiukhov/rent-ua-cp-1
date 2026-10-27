"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/forms/TextField.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import { registerFormSchema, type RegisterFormValues } from "@/lib/validation.ts";

export function RegisterForm() {
  const { authService } = useServices();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await authService.register(values);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Не вдалося зареєструватися");
    }
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg">Реєстрація</CardTitle>
        <CardDescription>Створіть акаунт, щоб подавати заявки та публікувати оголошення</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <TextField label="Ім'я" autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
          <TextField
            label="Прізвище"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
          <TextField
            label="Пароль"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <TextField
            label="Підтвердження пароля"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Реєстрація..." : "Зареєструватися"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Уже є акаунт?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4">
              Увійти
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
