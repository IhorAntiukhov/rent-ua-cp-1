import { doc, type Firestore, type Transaction } from "firebase/firestore";
import type { Application } from "@/domain/Application.ts";
import { DomainError } from "@/domain/DomainError.ts";
import type { Listing } from "@/domain/Listing.ts";
import { COLLECTIONS } from "@/sync/collections.ts";
import { applicationFromDoc, listingFromDoc } from "@/sync/converters.ts";

// Читання актуального стану документів усередині транзакції

export async function readListing(db: Firestore, transaction: Transaction, listingId: string): Promise<Listing> {
  const snapshot = await transaction.get(doc(db, COLLECTIONS.listings, listingId));
  if (!snapshot.exists()) throw new DomainError("Оголошення не знайдено");

  return listingFromDoc(snapshot);
}

export async function readApplication(
  db: Firestore,
  transaction: Transaction,
  applicationId: string,
): Promise<Application> {
  const snapshot = await transaction.get(doc(db, COLLECTIONS.applications, applicationId));
  if (!snapshot.exists()) throw new DomainError("Заявку не знайдено");

  return applicationFromDoc(snapshot);
}
