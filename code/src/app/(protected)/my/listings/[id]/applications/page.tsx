import { ListingApplicationsPage } from "@/components/applications/ListingApplicationsPage.tsx";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Заявки на оголошення" };

export default function ListingApplicationsRoute() {
  return <ListingApplicationsPage />;
}
