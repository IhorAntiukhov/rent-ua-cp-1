import { EditListingPage } from "@/components/listings/EditListingPage.tsx";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Редагування оголошення" };

export default function EditListingRoute() {
  return <EditListingPage />;
}
