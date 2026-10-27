import { deleteDoc, doc, setDoc, type Firestore } from "firebase/firestore";
import { DomainError } from "@/domain/DomainError.ts";
import { Favorite } from "@/domain/Favorite.ts";
import type { FavoriteRepository } from "@/repositories/FavoriteRepository.ts";
import type { ListingRepository } from "@/repositories/ListingRepository.ts";
import { COLLECTIONS } from "@/sync/collections.ts";
import { favoriteToDoc } from "@/sync/converters.ts";

export class FavoriteService {
  constructor(
    private readonly db: Firestore,
    private readonly listings: ListingRepository,
    private readonly favorites: FavoriteRepository,
  ) {}

  async add(userId: string, listingId: string): Promise<void> {
    if (!this.listings.get(listingId)) throw new DomainError("Оголошення не знайдено");

    const favorite = Favorite.create(userId, listingId, Date.now());

    await setDoc(doc(this.db, COLLECTIONS.favorites, favorite.id), favoriteToDoc(favorite));
  }

  async remove(userId: string, listingId: string): Promise<void> {
    await deleteDoc(doc(this.db, COLLECTIONS.favorites, Favorite.idFor(userId, listingId)));
  }

  // Додає в збережені або прибирає звідти; повертає новий стан («вподобано» чи ні)
  async toggle(userId: string, listingId: string): Promise<boolean> {
    if (this.favorites.isFavorite(userId, listingId)) {
      await this.remove(userId, listingId);

      return false;
    }

    await this.add(userId, listingId);

    return true;
  }
}
