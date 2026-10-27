import type { AddressSearchParts } from "@/domain/Address.ts";

export type SortField = "createdAt" | "area" | "price";
export type SortDirection = "asc" | "desc";

export interface RoomsFilter {
  roomCount: number;
  // true – «roomCount і більше», false – рівно roomCount
  atLeast: boolean;
}

interface QueryFields {
  addressFilter: AddressSearchParts;
  roomsFilter: RoomsFilter | null;
  minPricePerMonth: number | null;
  maxPricePerMonth: number | null;
  ownerIdFilter: string | null;
  sortField: SortField;
  sortDirection: SortDirection;
}

// Імутабельний опис запиту: кожен метод повертає нову копію
export class ListingQuery {
  readonly addressFilter: AddressSearchParts;
  readonly roomsFilter: RoomsFilter | null;
  readonly minPricePerMonth: number | null;
  readonly maxPricePerMonth: number | null;
  readonly ownerIdFilter: string | null;

  readonly sortField: SortField;
  readonly sortDirection: SortDirection;

  private constructor(fields: QueryFields) {
    this.addressFilter = fields.addressFilter;
    this.roomsFilter = fields.roomsFilter;
    this.minPricePerMonth = fields.minPricePerMonth;
    this.maxPricePerMonth = fields.maxPricePerMonth;
    this.ownerIdFilter = fields.ownerIdFilter;

    this.sortField = fields.sortField;
    this.sortDirection = fields.sortDirection;
  }

  // Усі оголошення, спершу найновіші
  static create(): ListingQuery {
    return new ListingQuery({
      addressFilter: {},
      roomsFilter: null,
      minPricePerMonth: null,
      maxPricePerMonth: null,
      ownerIdFilter: null,

      sortField: "createdAt",
      sortDirection: "desc",
    });
  }

  withAddress(parts: AddressSearchParts): ListingQuery {
    return this.copy({ addressFilter: parts });
  }

  // roomCount = null знімає фільтр
  withRooms(roomCount: number | null, atLeast = false): ListingQuery {
    return this.copy({ roomsFilter: roomCount === null ? null : { roomCount, atLeast } });
  }

  // null означає відсутність відповідної межі
  withPriceBetween(minPricePerMonth: number | null, maxPricePerMonth: number | null): ListingQuery {
    return this.copy({ minPricePerMonth, maxPricePerMonth });
  }

  withOwner(ownerId: string | null): ListingQuery {
    return this.copy({ ownerIdFilter: ownerId });
  }

  withSorting(field: SortField, direction: SortDirection): ListingQuery {
    return this.copy({ sortField: field, sortDirection: direction });
  }

  private copy(changes: Partial<QueryFields>): ListingQuery {
    return new ListingQuery({
      addressFilter: this.addressFilter,
      roomsFilter: this.roomsFilter,
      minPricePerMonth: this.minPricePerMonth,
      maxPricePerMonth: this.maxPricePerMonth,
      ownerIdFilter: this.ownerIdFilter,

      sortField: this.sortField,
      sortDirection: this.sortDirection,

      ...changes,
    });
  }
}
