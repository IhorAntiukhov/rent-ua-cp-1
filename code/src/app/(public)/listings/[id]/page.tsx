import { ListingDetails } from "@/components/listings/ListingDetails.tsx";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Оголошення" };

export default function ListingPage() {
  return <ListingDetails />;
}
