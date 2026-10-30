import { RegisterForm } from "@/components/auth/RegisterForm.tsx";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Реєстрація" };

export default function RegisterPage() {
  return <RegisterForm />;
}
