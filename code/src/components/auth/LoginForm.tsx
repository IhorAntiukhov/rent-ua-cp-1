"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/forms/TextField.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useServices } from "@/container/ServicesProvider.tsx";
import { loginFormSchema, type LoginFormValues } from "@/lib/validation.ts";

export function LoginForm() {
  const { authService } = useServices();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await authService.login(values);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Не вдалося увійти");
    }
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg">Вхід</CardTitle>
        <CardDescription>Увійдіть, щоб подавати заявки та керувати оголошеннями</CardDescription>
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
          <TextField
            label="Пароль"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Вхід..." : "Увійти"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Немає акаунта?{" "}
            <Link href="/register" className="text-foreground underline underline-offset-4">
              Зареєструватися
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
