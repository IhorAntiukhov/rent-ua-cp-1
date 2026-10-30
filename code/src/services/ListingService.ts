import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  where,
  writeBatch,
  type DocumentReference,
  type Firestore,
} from "firebase/firestore";
import { ApplicationStatus } from "@/domain/enums.ts";
import { DomainError } from "@/domain/DomainError.ts";
import { Listing, type ListingInput } from "@/domain/Listing.ts";
import type { ApplicationRepository } from "@/repositories/ApplicationRepository.ts";
import type { ListingRepository } from "@/repositories/ListingRepository.ts";
import { COLLECTIONS } from "@/sync/collections.ts";
import { listingToDoc } from "@/sync/converters.ts";
import { readApplication, readListing } from "./documentReaders.ts";

// Firestore дозволяє до 500 операцій в одному batch
const MAX_BATCH_DELETES = 400;

export class ListingService {
  constructor(
    private readonly db: Firestore,
    private readonly listings: ListingRepository,
    private readonly applications: ApplicationRepository,
  ) {}

  // Створює оголошення від імені користувача; повертає id нового оголошення
  async create(userId: string, input: ListingInput): Promise<string> {
    const reference = doc(collection(this.db, COLLECTIONS.listings));
    const listing = Listing.create(reference.id, userId, input, Date.now());

    await setDoc(reference, listingToDoc(listing));

    return listing.id;
  }

  async update(userId: string, listingId: string, input: ListingInput): Promise<void> {
    const listing = this.requireOwnedListing(userId, listingId);
    const updated = listing.update(input, Date.now());

    await setDoc(doc(this.db, COLLECTIONS.listings, listingId), listingToDoc(updated));
  }

  // Повністю видаляє оголошення разом із заявками на нього та вподобаннями
  async cancel(userId: string, listingId: string): Promise<void> {
    this.requireOwnedListing(userId, listingId);

    const references: DocumentReference[] = [];

    for (const application of this.applications.findByListing(listingId)) {
      references.push(doc(this.db, COLLECTIONS.applications, application.id));
    }

    // Вподобання інших користувачів у пам'яті немає, тому беремо їх із Firestore
    const favorites = await getDocs(
      query(collection(this.db, COLLECTIONS.favorites), where("listingId", "==", listingId)),
    );
    for (const favorite of favorites.docs) references.push(favorite.ref);

    // Правила перевіряють власника за оголошенням, тому воно видаляється останнім
    while (references.length > MAX_BATCH_DELETES) {
      await this.deleteAll(references.splice(0, MAX_BATCH_DELETES));
    }

    await this.deleteAll([...references, doc(this.db, COLLECTIONS.listings, listingId)]);
  }

  // Поновлює закрите оголошення; орендар більше не мешкає, тому схвалена заявка завершується
  async reopen(userId: string, listingId: string): Promise<void> {
    this.requireOwnedListing(userId, listingId);

    await runTransaction(this.db, async (transaction) => {
      const listing = await readListing(this.db, transaction, listingId);
      const reopened = listing.reopen(Date.now());

      const approvedId = listing.approvedApplicationId;
      const approved = approvedId ? await readApplication(this.db, transaction, approvedId) : null;
      const ended =
        approved && approved.status === ApplicationStatus.Approved ? approved.endTenancy(reopened.updatedAt) : null;

      transaction.update(doc(this.db, COLLECTIONS.listings, listingId), {
        status: reopened.status,
        approvedApplicationId: reopened.approvedApplicationId,
        updatedAt: reopened.updatedAt,
      });

      if (ended) {
        transaction.update(doc(this.db, COLLECTIONS.applications, ended.id), {
          status: ended.status,
          updatedAt: ended.updatedAt,
        });
      }
    });
  }

  private requireOwnedListing(userId: string, listingId: string): Listing {
    const listing = this.listings.get(listingId);
    if (!listing) throw new DomainError("Оголошення не знайдено");
    if (!listing.isOwnedBy(userId)) throw new DomainError("Лише власник може змінювати це оголошення");

    return listing;
  }

  private async deleteAll(references: DocumentReference[]): Promise<void> {
    const batch = writeBatch(this.db);
    for (const reference of references) batch.delete(reference);

    await batch.commit();
  }
}
