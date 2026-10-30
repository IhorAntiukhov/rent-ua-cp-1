import { NewListingPage } from "@/components/listings/NewListingPage.tsx";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Нове оголошення" };

export default function NewListingRoute() {
  return <NewListingPage />;
}
