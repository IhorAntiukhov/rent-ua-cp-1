import { MyApplicationsPage } from "@/components/applications/MyApplicationsPage.tsx";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Мої заявки" };

export default function MyApplicationsRoute() {
  return <MyApplicationsPage />;
}
