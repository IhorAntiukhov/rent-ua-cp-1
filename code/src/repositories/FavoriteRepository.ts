import { BTree } from "@/core/data-structures/BTree.ts";
import { HashSet } from "@/core/data-structures/HashSet.ts";
import { HashTable } from "@/core/data-structures/HashTable.ts";
import { addToBucket, removeFromBucket } from "@/core/utils/buckets.ts";
import { compareStrings } from "@/core/utils/compare.ts";
import { Favorite } from "@/domain/Favorite.ts";

export class FavoriteRepository {
  // Первинне сховище: id -> вподобання
  private readonly favoritesById = new BTree<string, Favorite>(compareStrings);

  // Хеш-індекс: userId -> id вподобаних оголошень
  private readonly userIndex = new HashTable<string, HashSet<string>>();

  get size(): number {
    return this.favoritesById.size;
  }

  get(id: string): Favorite | undefined {
    return this.favoritesById.get(id);
  }

  upsert(favorite: Favorite): void {
    const previous = this.favoritesById.get(favorite.id);
    if (previous) this.removeFromIndexes(previous);

    this.favoritesById.insert(favorite.id, favorite);
    this.addToIndexes(favorite);
  }

  upsertMany(favorites: Favorite[]): void {
    for (const favorite of favorites) this.upsert(favorite);
  }

  remove(id: string): boolean {
    const previous = this.favoritesById.get(id);
    if (!previous) return false;

    this.removeFromIndexes(previous);
    this.favoritesById.delete(id);

    return true;
  }

  clear(): void {
    this.favoritesById.clear();
    this.userIndex.clear();
  }

  isFavorite(userId: string, listingId: string): boolean {
    return this.userIndex.get(userId)?.has(listingId) ?? false;
  }

  // id вподобаних оголошень користувача, нещодавно додані спершу
  findFavoriteListingIds(userId: string): string[] {
    const listingIds = this.userIndex.get(userId);
    if (!listingIds) return [];

    const favorites: Favorite[] = [];

    for (const listingId of listingIds) {
      const favorite = this.favoritesById.get(Favorite.idFor(userId, listingId));
      if (favorite) favorites.push(favorite);
    }

    favorites.sort((a, b) => b.createdAt - a.createdAt || compareStrings(a.id, b.id));

    return favorites.map((favorite) => favorite.listingId);
  }

  private addToIndexes(favorite: Favorite): void {
    addToBucket(this.userIndex, favorite.userId, favorite.listingId);
  }

  private removeFromIndexes(favorite: Favorite): void {
    removeFromBucket(this.userIndex, favorite.userId, favorite.listingId);
  }
}
