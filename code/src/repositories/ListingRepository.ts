import { BTree } from "@/core/data-structures/BTree.ts";
import { HashSet } from "@/core/data-structures/HashSet.ts";
import { HashTable } from "@/core/data-structures/HashTable.ts";
import { Trie } from "@/core/data-structures/Trie.ts";
import { addToBucket, removeFromBucket } from "@/core/utils/buckets.ts";
import { compareStrings } from "@/core/utils/compare.ts";
import { compareSortKeys, type SortKey } from "@/core/utils/sortKeys.ts";
import { Address, type AddressSearchLevel, type AddressSearchParts } from "@/domain/Address.ts";
import type { Listing } from "@/domain/Listing.ts";
import type { ListingQuery, SortField } from "./ListingQuery.ts";

const DEFAULT_SUGGESTION_LIMIT = 8;

// Найбільший символ: верхня межа id в діапазоні складених ключів
const HIGHEST_CHAR = String.fromCharCode(0xffff);

export class ListingRepository {
  // Первинне сховище: id -> оголошення
  private readonly listingsById = new BTree<string, Listing>(compareStrings);

  // B-дерева для сортування та діапазону ціни: [значення, id] -> id
  private readonly createdAtIndex = new BTree<SortKey, string>(compareSortKeys);
  private readonly areaIndex = new BTree<SortKey, string>(compareSortKeys);
  private readonly priceIndex = new BTree<SortKey, string>(compareSortKeys);

  // Хеш-індекси для пошуку за рівністю: ключ -> id оголошень
  private readonly roomsIndex = new HashTable<number, HashSet<string>>();
  private readonly ownerIndex = new HashTable<string, HashSet<string>>();

  // Префіксний індекс адреси
  private readonly addressIndex = new Trie();

  get size(): number {
    return this.listingsById.size;
  }

  get(id: string): Listing | undefined {
    return this.listingsById.get(id);
  }

  // Додає нове або замінює наявне оголошення; старі ключі видаляються за старим станом
  upsert(listing: Listing): void {
    const previous = this.listingsById.get(listing.id);
    if (previous) this.removeFromIndexes(previous);

    this.listingsById.insert(listing.id, listing);
    this.addToIndexes(listing);
  }

  upsertMany(listings: Listing[]): void {
    for (const listing of listings) this.upsert(listing);
  }

  remove(id: string): boolean {
    const previous = this.listingsById.get(id);
    if (!previous) return false;

    this.removeFromIndexes(previous);
    this.listingsById.delete(id);

    return true;
  }

  clear(): void {
    this.listingsById.clear();
    this.createdAtIndex.clear();
    this.areaIndex.clear();
    this.priceIndex.clear();
    this.roomsIndex.clear();
    this.ownerIndex.clear();
    this.addressIndex.clear();
  }

  // Пошук за адресою, фільтри, діапазон ціни, потім сортування
  search(query: ListingQuery): Listing[] {
    let candidateIds: HashSet<string> | null = null;

    const addressPrefix = Address.searchPrefix(query.addressFilter);
    if (addressPrefix !== "") {
      candidateIds = ListingRepository.intersectWithCandidates(candidateIds, this.addressIndex.findByPrefix(addressPrefix));
    }

    if (query.roomsFilter) {
      const { roomCount, atLeast } = query.roomsFilter;
      candidateIds = ListingRepository.intersectWithCandidates(candidateIds, this.findIdsByRooms(roomCount, atLeast));
    }

    if (query.ownerIdFilter !== null) {
      const ownerIds = this.ownerIndex.get(query.ownerIdFilter) ?? new HashSet<string>();
      candidateIds = ListingRepository.intersectWithCandidates(candidateIds, ownerIds);
    }

    if (query.minPricePerMonth !== null || query.maxPricePerMonth !== null) {
      const priceIds = this.findIdsInPriceRange(query.minPricePerMonth, query.maxPricePerMonth);
      candidateIds = ListingRepository.intersectWithCandidates(candidateIds, priceIds);
    }

    if (candidateIds !== null && candidateIds.size === 0) return [];

    return this.collectSorted(query.sortField, query.sortDirection === "desc", candidateIds);
  }

  // Підказки для рівня адреси на основі Trie
  suggestAddress(
    level: AddressSearchLevel,
    filledParts: AddressSearchParts,
    limit: number = DEFAULT_SUGGESTION_LIMIT,
  ): string[] {
    const prefix = Address.suggestionPrefix(level, filledParts);

    return prefix === null ? [] : this.addressIndex.suggest(prefix, limit);
  }

  // Якщо кандидатів ще немає (null), результатом стають нові id, інакше – перетин
  private static intersectWithCandidates(candidateIds: HashSet<string> | null, ids: HashSet<string>): HashSet<string> {
    return candidateIds === null ? ids : HashSet.intersect(candidateIds, ids);
  }

  private findIdsByRooms(roomCount: number, atLeast: boolean): HashSet<string> {
    if (!atLeast) return this.roomsIndex.get(roomCount) ?? new HashSet<string>();

    let ids = new HashSet<string>();

    for (const [rooms, bucket] of this.roomsIndex.entries()) {
      if (rooms >= roomCount) ids = HashSet.union(ids, bucket);
    }

    return ids;
  }

  // Межі діапазону: ±Infinity, якщо межу не задано; id в ключі впорядковує записи з однаковою ціною
  private findIdsInPriceRange(minPrice: number | null, maxPrice: number | null): HashSet<string> {
    const lowerBound: SortKey = [minPrice ?? Number.NEGATIVE_INFINITY, ""];
    const upperBound: SortKey = [maxPrice ?? Number.POSITIVE_INFINITY, HIGHEST_CHAR];
    const ids = new HashSet<string>();

    for (const [, id] of this.priceIndex.rangeScan(lowerBound, upperBound)) ids.add(id);

    return ids;
  }

  // Обхід B-дерева обраного поля у прямому або зворотному порядку; candidateIds = null означає «усі»
  private collectSorted(field: SortField, descending: boolean, candidateIds: HashSet<string> | null): Listing[] {
    const index = field === "price" ? this.priceIndex : field === "area" ? this.areaIndex : this.createdAtIndex;
    const entries = descending ? index.entriesDescending() : index.entries();
    const listings: Listing[] = [];

    for (const [, id] of entries) {
      if (candidateIds !== null && !candidateIds.has(id)) continue;

      const listing = this.listingsById.get(id);
      if (listing) listings.push(listing);
    }

    return listings;
  }

  private addToIndexes(listing: Listing): void {
    this.createdAtIndex.insert([listing.createdAt, listing.id], listing.id);
    this.areaIndex.insert([listing.area, listing.id], listing.id);
    this.priceIndex.insert([listing.pricePerMonth, listing.id], listing.id);

    addToBucket(this.roomsIndex, listing.rooms, listing.id);
    addToBucket(this.ownerIndex, listing.ownerId, listing.id);

    this.addressIndex.insert(listing.address.toTriePath(), listing.id, listing.address.segments());
  }

  private removeFromIndexes(listing: Listing): void {
    this.createdAtIndex.delete([listing.createdAt, listing.id]);
    this.areaIndex.delete([listing.area, listing.id]);
    this.priceIndex.delete([listing.pricePerMonth, listing.id]);

    removeFromBucket(this.roomsIndex, listing.rooms, listing.id);
    removeFromBucket(this.ownerIndex, listing.ownerId, listing.id);

    this.addressIndex.remove(listing.address.toTriePath(), listing.id);
  }
}
