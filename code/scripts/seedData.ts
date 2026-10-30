import type { ApplicationInput } from "@/domain/Application.ts";
import type { ListingInput } from "@/domain/Listing.ts";

// Чисті дані для заповнення бази: нічого не пише в Firebase, тому годиться для dry-run

export const DEMO_PASSWORD = "Demo12345";

export type DemoRole = "owner" | "tenant";

export interface DemoUser {
  key: string;
  role: DemoRole;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export const DEMO_USERS: DemoUser[] = [
  { key: "owner1", role: "owner", email: "demo.owner1@example.com", firstName: "Олена", lastName: "Коваль", phone: "+380501110001" },
  { key: "owner2", role: "owner", email: "demo.owner2@example.com", firstName: "Дмитро", lastName: "Бондаренко", phone: "+380501110002" },
  { key: "owner3", role: "owner", email: "demo.owner3@example.com", firstName: "Наталія", lastName: "Мельник", phone: "+380501110003" },
  { key: "tenant1", role: "tenant", email: "demo.tenant1@example.com", firstName: "Ірина", lastName: "Шевченко", phone: "+380671110001" },
  { key: "tenant2", role: "tenant", email: "demo.tenant2@example.com", firstName: "Андрій", lastName: "Ткаченко", phone: "+380671110002" },
  { key: "tenant3", role: "tenant", email: "demo.tenant3@example.com", firstName: "Софія", lastName: "Кравченко", phone: "+380671110003" },
];

const OWNER_KEYS = ["owner1", "owner2", "owner3"];
const TENANT_KEYS = ["tenant1", "tenant2", "tenant3"];

// Місто, коефіцієнт ціни та вулиці
const CITIES: Array<{ city: string; priceFactor: number; streets: string[] }> = [
  { city: "Київ", priceFactor: 1.7, streets: ["Хрещатик", "Володимирська", "Саксаганського"] },
  { city: "Львів", priceFactor: 1.35, streets: ["Городоцька", "Зелена", "Личаківська"] },
  { city: "Одеса", priceFactor: 1.35, streets: ["Дерибасівська", "Пушкінська", "Академіка Корольова"] },
  { city: "Харків", priceFactor: 1.15, streets: ["Сумська", "Клочківська", "Космічна"] },
  { city: "Дніпро", priceFactor: 1.15, streets: ["Яворницького", "Робоча", "Мандриківська"] },
  { city: "Запоріжжя", priceFactor: 1, streets: ["Полякова", "Перемоги", "Українська"] },
  { city: "Вінниця", priceFactor: 0.95, streets: ["Соборна", "Келецька", "Хмельницьке шосе"] },
  { city: "Полтава", priceFactor: 0.9, streets: ["Європейська", "Зигіна", "Шевченка"] },
  { city: "Чернівці", priceFactor: 0.9, streets: ["Головна", "Ольги Кобилянської", "Героїв Майдану"] },
  { city: "Луцьк", priceFactor: 0.9, streets: ["Лесі Українки", "Волі", "Кравчука"] },
  { city: "Івано-Франківськ", priceFactor: 1, streets: ["Незалежності", "Гетьмана Мазепи", "Стуса"] },
  { city: "Житомир", priceFactor: 0.85, streets: ["Київська", "Бердичівська", "Покровська"] },
];

const DESCRIPTIONS = [
  "Світла квартира після ремонту, меблі та техніка залишаються. Поруч зупинка транспорту, магазини й парк.",
  "Затишне житло для довгострокової оренди. Тиха сусідня територія, є балкон, інтернет підключено.",
  "Простора квартира з окремою кухнею. Підійде для сім'ї або двох студентів, домашні тварини обговорюються.",
  "Свіжий ремонт, нова сантехніка, автономне опалення. Комунальні платежі окремо, депозит – один місяць.",
];

const COMMENTS = ["", "", "Шукаю житло на рік і більше", "Без домашніх тварин, працюю віддалено", "Можу внести депозит одразу"];

const DAY = 24 * 60 * 60 * 1000;

export type ApplicationOutcome = "pending" | "rejected" | "approved" | "ended";

export interface SeedListing {
  id: string;
  ownerKey: string;
  input: ListingInput;
  createdAt: number;
}

export interface SeedApplication {
  id: string;
  listingId: string;
  tenantKey: string;
  input: ApplicationInput;
  createdAt: number;
  outcome: ApplicationOutcome;
}

export interface SeedFavorite {
  tenantKey: string;
  listingId: string;
}

export interface SeedPlan {
  listings: SeedListing[];
  applications: SeedApplication[];
  favorites: SeedFavorite[];
}

// Детермінований генератор псевдовипадкових чисел: повторний запуск дає ті самі дані
function createRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n: number) => String(n).padStart(3, "0");

function buildListings(now: number): SeedListing[] {
  const random = createRandom(20260101);
  const listings: SeedListing[] = [];

  for (const [cityIndex, { city, priceFactor, streets }] of CITIES.entries()) {
    // По три-чотири оголошення на місто
    const count = 3 + (cityIndex % 2);

    for (let i = 0; i < count; i++) {
      const index = listings.length;
      const ownerKey = OWNER_KEYS[index % OWNER_KEYS.length];
      const owner = DEMO_USERS.find((user) => user.key === ownerKey)!;

      const rooms = 1 + Math.floor(random() * 4);
      const area = Math.round(26 + rooms * 15 + random() * 12);
      const price = Math.round((5500 + rooms * 2600 + random() * 1500) * priceFactor / 100) * 100;

      listings.push({
        id: `seed-listing-${pad(index + 1)}`,
        ownerKey,
        input: {
          ownerName: `${owner.firstName} ${owner.lastName}`,
          ownerPhone: owner.phone,
          address: {
            country: "Україна",
            city,
            street: streets[i % streets.length],
            building: String(1 + Math.floor(random() * 80)),
            apartment: String(1 + Math.floor(random() * 120)),
          },
          rooms,
          area,
          description: DESCRIPTIONS[index % DESCRIPTIONS.length],
          pricePerMonth: price,
        },
        createdAt: now - Math.round((index * 1.5 + random()) * DAY),
      });
    }
  }

  return listings;
}

// Заявки: за вибраними оголошеннями (індекс, орендар, результат). Для одного оголошення
// результати узгоджені: схвалена заявка закриває його, решта стають відхиленими
const APPLICATION_PLAN: Array<{ listingIndex: number; tenantKey: string; outcome: ApplicationOutcome }> = [
  { listingIndex: 0, tenantKey: "tenant1", outcome: "pending" },
  { listingIndex: 0, tenantKey: "tenant2", outcome: "pending" },
  { listingIndex: 2, tenantKey: "tenant1", outcome: "approved" },
  { listingIndex: 2, tenantKey: "tenant2", outcome: "rejected" },
  { listingIndex: 4, tenantKey: "tenant3", outcome: "ended" },
  { listingIndex: 4, tenantKey: "tenant1", outcome: "rejected" },
  { listingIndex: 6, tenantKey: "tenant2", outcome: "rejected" },
  { listingIndex: 6, tenantKey: "tenant3", outcome: "pending" },
  { listingIndex: 8, tenantKey: "tenant3", outcome: "pending" },
  { listingIndex: 10, tenantKey: "tenant1", outcome: "approved" },
  { listingIndex: 12, tenantKey: "tenant2", outcome: "pending" },
  { listingIndex: 14, tenantKey: "tenant1", outcome: "pending" },
];

function buildApplications(listings: SeedListing[], now: number): SeedApplication[] {
  return APPLICATION_PLAN.map((entry, index) => {
    const listing = listings[entry.listingIndex];
    const tenant = DEMO_USERS.find((user) => user.key === entry.tenantKey)!;

    return {
      id: `seed-application-${pad(index + 1)}`,
      listingId: listing.id,
      tenantKey: entry.tenantKey,
      input: {
        applicantName: `${tenant.firstName} ${tenant.lastName}`,
        contact: tenant.phone,
        comment: COMMENTS[index % COMMENTS.length],
      },
      createdAt: Math.max(listing.createdAt + DAY / 2, now - (index + 1) * DAY * 0.7),
      outcome: entry.outcome,
    };
  });
}

// Кожен орендар зберігає по п'ять оголошень
function buildFavorites(listings: SeedListing[]): SeedFavorite[] {
  const favorites: SeedFavorite[] = [];

  for (const [tenantIndex, tenantKey] of TENANT_KEYS.entries()) {
    for (let i = 0; i < 5; i++) {
      favorites.push({ tenantKey, listingId: listings[(i * 3 + tenantIndex * 2) % listings.length].id });
    }
  }

  return favorites;
}

export function buildSeedPlan(now: number = Date.now()): SeedPlan {
  const listings = buildListings(now);

  return {
    listings,
    applications: buildApplications(listings, now),
    favorites: buildFavorites(listings),
  };
}
