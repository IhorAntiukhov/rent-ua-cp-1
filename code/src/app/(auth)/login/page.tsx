import { LoginForm } from "@/components/auth/LoginForm.tsx";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Вхід" };

export default function LoginPage() {
  return <LoginForm />;
}
