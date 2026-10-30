import { FavoritesPage } from "@/components/listings/FavoritesPage.tsx";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Збережені" };

export default function FavoritesRoute() {
  return <FavoritesPage />;
}
