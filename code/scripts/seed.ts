// deno-lint-ignore-file no-process-global
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, type Query, type QueryDocumentSnapshot } from "firebase/firestore";
import { Application } from "@/domain/Application.ts";
import { ApplicationStatus, ListingStatus } from "@/domain/enums.ts";
import { Favorite } from "@/domain/Favorite.ts";
import { Listing } from "@/domain/Listing.ts";
import { COLLECTIONS } from "@/sync/collections.ts";
import { applicationFromDoc, applicationToDoc, favoriteToDoc, listingToDoc } from "@/sync/converters.ts";
import { buildSeedPlan, DEMO_USERS, type SeedApplication, type SeedListing, type SeedPlan } from "./seedData.ts";

// Заповнює Firebase демонстраційними даними: акаунти, 30–50 оголошень у містах України,
// заявки в різних станах і вподобання. Повторний запуск нічого не дублює.
// Запуск: npm run seed (або npm run seed:dry – лише перевірка даних без запису)

function summarize(plan: SeedPlan): void {
  const cities = new Set(plan.listings.map((listing) => listing.input.address.city));
  const outcomes = new Map<string, number>();

  for (const application of plan.applications) {
    outcomes.set(application.outcome, (outcomes.get(application.outcome) ?? 0) + 1);
  }

  console.log(`Користувачів: ${DEMO_USERS.length}`);
  console.log(`Оголошень: ${plan.listings.length} у ${cities.size} містах`);
  console.log(`Заявок: ${plan.applications.length} (${[...outcomes].map(([k, v]) => `${k}: ${v}`).join(", ")})`);
  console.log(`Вподобань: ${plan.favorites.length}`);
}

// Перевірка без запису: усі сутності створюються через домен
function dryRun(plan: SeedPlan): void {
  const listings = new Map<string, Listing>();

  for (const seed of plan.listings) {
    listings.set(seed.id, Listing.create(seed.id, `uid-${seed.ownerKey}`, seed.input, seed.createdAt));
  }

  for (const seed of plan.applications) {
    Application.create(seed.id, listings.get(seed.listingId)!, `uid-${seed.tenantKey}`, seed.input, seed.createdAt);
  }

  console.log("Dry-run: усі сутності створюються без помилок.");
}

async function main(): Promise<void> {
  const plan = buildSeedPlan();
  summarize(plan);

  if (process.argv.includes("--dry-run")) {
    dryRun(plan);
    return;
  }

  // Firebase підключається лише тут, щоб dry-run не потребував налаштувань
  const helpers = await import("./firebaseHelpers.ts");
  helpers.requireEnv();

  const { db, ensureDemoUser, signInAs, signOutUser } = helpers;

  // 1. Акаунти й профілі
  const uids = new Map<string, string>();
  for (const user of DEMO_USERS) uids.set(user.key, await ensureDemoUser(user));
  console.log("Акаунти готові");

  const listingEntities = new Map<string, Listing>();
  const ownerOf = (seed: SeedListing) => uids.get(seed.ownerKey)!;

  // 2. Оголошення створюють їхні власники
  for (const user of DEMO_USERS.filter((u) => u.role === "owner")) {
    await signInAs(user);

    for (const seed of plan.listings.filter((listing) => listing.ownerKey === user.key)) {
      const listing = Listing.create(seed.id, ownerOf(seed), seed.input, seed.createdAt);
      listingEntities.set(seed.id, listing);

      const reference = doc(db, COLLECTIONS.listings, seed.id);
      if (!(await getDoc(reference)).exists()) await setDoc(reference, listingToDoc(listing));
    }
  }
  console.log("Оголошення готові");

  // 3. Заявки подають орендарі (правила вимагають відкритого оголошення, тому до результатів)
  for (const user of DEMO_USERS.filter((u) => u.role === "tenant")) {
    const tenantUid = await signInAs(user);

    // Правила не дозволяють читати неіснуючі заявки й вподобання за id, тому наявні беруться запитом
    const existingApplicationIds = await findIds(query(collection(db, COLLECTIONS.applications), where("applicantId", "==", tenantUid)));
    const existingFavoriteIds = await findIds(query(collection(db, COLLECTIONS.favorites), where("userId", "==", tenantUid)));

    for (const seed of plan.applications.filter((application) => application.tenantKey === user.key)) {
      if (existingApplicationIds.has(seed.id)) continue;

      const reference = doc(db, COLLECTIONS.applications, seed.id);

      const application = Application.create(seed.id, listingEntities.get(seed.listingId)!, tenantUid, seed.input, seed.createdAt);

      await setDoc(reference, applicationToDoc(application));
    }

    // Вподобання
    for (const favorite of plan.favorites.filter((item) => item.tenantKey === user.key)) {
      const entity = Favorite.create(tenantUid, favorite.listingId, Date.now());

      if (!existingFavoriteIds.has(entity.id)) await setDoc(doc(db, COLLECTIONS.favorites, entity.id), favoriteToDoc(entity));
    }
  }
  console.log("Заявки й вподобання готові");

  // 4. Результати розгляду виставляють власники
  for (const user of DEMO_USERS.filter((u) => u.role === "owner")) {
    const ownerUid = await signInAs(user);

    const ownSnapshots = new Map<string, QueryDocumentSnapshot>();
    const ownerApplications = await getDocs(query(collection(db, COLLECTIONS.applications), where("ownerId", "==", ownerUid)));
    for (const snapshot of ownerApplications.docs) ownSnapshots.set(snapshot.id, snapshot);

    const ownApplications = plan.applications.filter((application) => {
      const listing = plan.listings.find((item) => item.id === application.listingId)!;

      return listing.ownerKey === user.key && application.outcome !== "pending";
    });

    for (const seed of ownApplications) await applyOutcome(seed, ownSnapshots.get(seed.id));
  }
  console.log("Результати заявок виставлено");

  await signOutUser();

  console.log("\nДемо-акаунти (пароль для всіх – SEED_DEMO_PASSWORD з .env.local):");
  for (const user of DEMO_USERS) console.log(`  ${user.role === "owner" ? "орендодавець" : "орендар"}: ${user.email}`);
}

// Виставляє стан заявки (і оголошення) за результатом; уже оброблені заявки пропускаються
async function applyOutcome(seed: SeedApplication, snapshot: QueryDocumentSnapshot | undefined): Promise<void> {
  if (!snapshot) return;

  const { db } = await import("./firebaseHelpers.ts");

  const applicationReference = doc(db, COLLECTIONS.applications, seed.id);
  const listingReference = doc(db, COLLECTIONS.listings, seed.listingId);

  const application = applicationFromDoc(snapshot);
  if (application.status !== ApplicationStatus.Pending) return;

  const writeStatus = (changed: Application) =>
    updateDoc(applicationReference, { status: changed.status, updatedAt: changed.updatedAt });

  if (seed.outcome === "rejected") {
    await writeStatus(application.reject(Date.now()));
    return;
  }

  // Схвалення закриває оголошення
  const approved = application.approve(Date.now());
  await writeStatus(approved);
  await updateDoc(listingReference, {
    status: ListingStatus.Closed,
    approvedApplicationId: application.id,
    updatedAt: Date.now(),
  });

  // Завершена оренда: орендар виїхав, оголошення знову відкрите
  if (seed.outcome === "ended") {
    await writeStatus(approved.endTenancy(Date.now()));
    await updateDoc(listingReference, { status: ListingStatus.Open, approvedApplicationId: null, updatedAt: Date.now() });
  }
}

async function findIds(documentsQuery: Query): Promise<Set<string>> {
  const snapshot = await getDocs(documentsQuery);

  return new Set(snapshot.docs.map((item) => item.id));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
