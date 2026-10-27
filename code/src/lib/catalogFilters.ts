import { ADDRESS_SEARCH_LEVELS, type AddressSearchLevel } from "@/domain/Address.ts";
import { ListingQuery, type SortDirection, type SortField } from "@/repositories/ListingQuery.ts";

export const DEFAULT_COUNTRY = "Україна";

// Значення фільтра кімнат: "" – усі, "1".."3" – точна кількість, "4+" – чотири і більше
export const ROOM_OPTIONS = ["1", "2", "3", "4+"] as const;

export const SORT_FIELD_LABELS: Record<SortField, string> = {
  createdAt: "Дата створення",
  area: "Площа",
  price: "Ціна",
};

export interface CatalogFilters {
  country: string;
  city: string;
  street: string;
  building: string;

  rooms: string;
  minPrice: string;
  maxPrice: string;

  sortField: SortField;
  sortDirection: SortDirection;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  country: DEFAULT_COUNTRY,
  city: "",
  street: "",
  building: "",

  rooms: "",
  minPrice: "",
  maxPrice: "",

  sortField: "createdAt",
  sortDirection: "desc",
};

const SORT_FIELD_PARAMS: Record<SortField, string> = {
  createdAt: "created",
  area: "area",
  price: "price",
};

const SORT_FIELDS = Object.keys(SORT_FIELD_PARAMS) as SortField[];

export function parseCatalogFilters(params: URLSearchParams): CatalogFilters {
  const roomsParam = params.get("rooms") ?? "";
  const sortParam = params.get("sort");
  const directionParam = params.get("dir");

  const sortField = SORT_FIELDS.find((field) => SORT_FIELD_PARAMS[field] === sortParam);

  return {
    // Порожній параметр country означає, що користувач очистив поле, а не що його не задано
    country: params.get("country") ?? DEFAULT_COUNTRY,
    city: params.get("city") ?? "",
    street: params.get("street") ?? "",
    building: params.get("building") ?? "",

    rooms: (ROOM_OPTIONS as readonly string[]).includes(roomsParam) ? roomsParam : "",
    minPrice: params.get("min") ?? "",
    maxPrice: params.get("max") ?? "",

    sortField: sortField ?? DEFAULT_FILTERS.sortField,
    sortDirection: directionParam === "asc" || directionParam === "desc" ? directionParam : DEFAULT_FILTERS.sortDirection,
  };
}

// Параметри URL без значень за замовчуванням
export function serializeCatalogFilters(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  if (filters.country !== DEFAULT_COUNTRY) params.set("country", filters.country);
  if (filters.city !== "") params.set("city", filters.city);
  if (filters.street !== "") params.set("street", filters.street);
  if (filters.building !== "") params.set("building", filters.building);

  if (filters.rooms !== "") params.set("rooms", filters.rooms);
  if (filters.minPrice !== "") params.set("min", filters.minPrice);
  if (filters.maxPrice !== "") params.set("max", filters.maxPrice);

  if (filters.sortField !== DEFAULT_FILTERS.sortField || filters.sortDirection !== DEFAULT_FILTERS.sortDirection) {
    params.set("sort", SORT_FIELD_PARAMS[filters.sortField]);
    params.set("dir", filters.sortDirection);
  }

  return params.toString();
}

// Зміна рівня адреси скидає всі глибші рівні, бо вони залежать від попередніх
export function changeAddressLevel(level: AddressSearchLevel, value: string): Partial<CatalogFilters> {
  const changes: Partial<CatalogFilters> = { [level]: value };

  for (const deeper of ADDRESS_SEARCH_LEVELS.slice(ADDRESS_SEARCH_LEVELS.indexOf(level) + 1)) {
    changes[deeper] = "";
  }

  return changes;
}

export function parsePrice(text: string): number | null {
  if (text.trim() === "") return null;

  const price = Number(text);

  return Number.isFinite(price) && price >= 0 ? price : null;
}

export function buildListingQuery(filters: CatalogFilters): ListingQuery {
  const roomCount = filters.rooms === "" ? null : Number.parseInt(filters.rooms, 10);
  const atLeast = filters.rooms.endsWith("+");

  return ListingQuery.create()
    .withAddress({
      country: filters.country,
      city: filters.city,
      street: filters.street,
      building: filters.building,
    })
    .withRooms(roomCount, atLeast)
    .withPriceBetween(parsePrice(filters.minPrice), parsePrice(filters.maxPrice))
    .withSorting(filters.sortField, filters.sortDirection);
}
