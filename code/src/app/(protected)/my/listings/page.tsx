import { MyListingsPage } from "@/components/listings/MyListingsPage.tsx";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Мої оголошення" };

export default function MyListingsRoute() {
  return <MyListingsPage />;
}
