// deno-lint-ignore-file no-process-global
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { ApplicationStatus } from "@/domain/enums.ts";
import { COLLECTIONS } from "@/sync/collections.ts";
import { buildSeedPlan, DEMO_USERS, type DemoUser } from "./seedData.ts";

// Перевіряє правила Firestore на демонстраційних даних: дозволені дії мають проходити,
// заборонені – завершуватись permission-denied. Спершу запустіть npm run seed.
// Запуск: npm run check-rules

interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
}

const results: CheckResult[] = [];

function errorCode(error: unknown): string {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : String(error);
}

async function expectAllowed(name: string, action: () => Promise<unknown>): Promise<void> {
  try {
    await action();
    results.push({ name, passed: true, detail: "дозволено" });
  } catch (error) {
    results.push({ name, passed: false, detail: `очікувалось дозволено, а було: ${errorCode(error)}` });
  }
}

async function expectDenied(name: string, action: () => Promise<unknown>): Promise<void> {
  try {
    await action();
    results.push({ name, passed: false, detail: "очікувалась відмова, а дію виконано" });
  } catch (error) {
    const code = errorCode(error);

    results.push({
      name,
      passed: code === "permission-denied",
      detail: code === "permission-denied" ? "відмовлено" : `очікувалось permission-denied, а було: ${code}`,
    });
  }
}

async function main(): Promise<void> {
  const helpers = await import("./firebaseHelpers.ts");
  helpers.requireEnv();

  const { db, signInAs, signOutUser } = helpers;

  const plan = buildSeedPlan();
  const user = (key: string): DemoUser => DEMO_USERS.find((item) => item.key === key)!;
  const listingOf = (listingId: string) => plan.listings.find((listing) => listing.id === listingId)!;

  const listingReference = (id: string) => doc(db, COLLECTIONS.listings, id);
  const applicationReference = (id: string) => doc(db, COLLECTIONS.applications, id);

  // Дані для сценаріїв: оголошення двох власників і заявки в різних станах
  const ownListing = plan.listings.find((listing) => listing.ownerKey === "owner1")!;
  const foreignListing = plan.listings.find((listing) => listing.ownerKey === "owner2")!;

  const approvedSeed = plan.applications.find((application) => application.outcome === "approved")!;
  const endedSeed = plan.applications.find((application) => application.outcome === "ended")!;
  const pendingSeed = plan.applications.find(
    (application) => application.outcome === "pending" && application.tenantKey === "tenant1",
  )!;
  const otherTenantSeed = plan.applications.find((application) => application.tenantKey === "tenant2")!;

  // Оголошення без заявок: на нього орендар подасть тимчасову заявку
  const freeListing = plan.listings.find(
    (listing) => !plan.applications.some((application) => application.listingId === listing.id),
  )!;

  // Тимчасова заявка могла лишитись після невдалого запуску: власник оголошення її видаляє
  const temporaryId = "rules-check-application";
  const freeOwnerId = (await getDoc(listingReference(freeListing.id))).data()?.ownerId as string;

  const cleanupUid = await signInAs(user(freeListing.ownerKey));
  const leftovers = await getDocs(query(collection(db, COLLECTIONS.applications), where("ownerId", "==", cleanupUid)));

  for (const leftover of leftovers.docs.filter((item) => item.id === temporaryId)) await deleteDoc(leftover.ref);

  // 1. Гість
  await signOutUser();

  await expectAllowed("гість читає оголошення", () => getDocs(collection(db, COLLECTIONS.listings)));
  await expectDenied("гість не створює оголошення", () =>
    setDoc(listingReference("rules-check-1"), { ownerId: "x", status: "OPEN" }),
  );
  await expectDenied("гість не читає заявки", () =>
    getDocs(query(collection(db, COLLECTIONS.applications), where("applicantId", "==", "x"))),
  );

  // 2. Орендар
  const tenantUid = await signInAs(user("tenant1"));

  await expectDenied("орендар не змінює чуже оголошення", () => updateDoc(listingReference(ownListing.id), { pricePerMonth: 1 }));
  await expectDenied("орендар не видаляє чуже оголошення", () => deleteDoc(listingReference(ownListing.id)));
  await expectDenied("орендар не створює оголошення від чужого імені", () =>
    setDoc(listingReference("rules-check-2"), { ownerId: "someone-else", status: "OPEN" }),
  );
  await expectDenied("орендар не схвалює власну заявку", () =>
    updateDoc(applicationReference(pendingSeed.id), { status: ApplicationStatus.Approved, updatedAt: Date.now() }),
  );
  await expectDenied("орендар не читає чужі заявки", () =>
    getDocs(query(collection(db, COLLECTIONS.applications), where("applicantId", "==", "other-user"))),
  );
  await expectDenied("орендар не змінює чужу заявку", () =>
    updateDoc(applicationReference(otherTenantSeed.id), { status: ApplicationStatus.Rejected, updatedAt: Date.now() }),
  );
  await expectDenied("орендар не видаляє схвалену заявку", () => deleteDoc(applicationReference(approvedSeed.id)));
  await expectDenied("орендар не читає чужі профілі", () =>
    getDocs(query(collection(db, COLLECTIONS.users), where("firstName", "==", "Олена"))),
  );

  // Тимчасова заявка на відкрите оголошення: подання дозволене, видалення – поки вона очікує
  await expectAllowed("орендар подає заявку на відкрите оголошення", () =>
    setDoc(applicationReference(temporaryId), {
      listingId: freeListing.id,
      ownerId: freeOwnerId,
      applicantId: tenantUid,
      applicantName: "Перевірка правил",
      contact: "+380000000000",
      comment: null,
      status: ApplicationStatus.Pending,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  );
  await expectAllowed("орендар видаляє власну заявку, що очікує", () => deleteDoc(applicationReference(temporaryId)));

  // 3. Власник першого оголошення
  const ownerUid = await signInAs(user("owner1"));

  await expectAllowed("власник читає заявки на свої оголошення", () =>
    getDocs(query(collection(db, COLLECTIONS.applications), where("ownerId", "==", ownerUid))),
  );
  await expectAllowed("власник читає вподобання на своє оголошення (для каскадного видалення)", () =>
    getDocs(query(collection(db, COLLECTIONS.favorites), where("listingId", "==", ownListing.id))),
  );
  await expectAllowed("власник змінює власне оголошення", () =>
    updateDoc(listingReference(ownListing.id), { updatedAt: Date.now() }),
  );
  await expectDenied("власник не читає заявки чужих оголошень", () =>
    getDocs(query(collection(db, COLLECTIONS.applications), where("ownerId", "==", "other-owner"))),
  );
  await expectDenied("власник не змінює чуже оголошення", () => updateDoc(listingReference(foreignListing.id), { pricePerMonth: 1 }));
  await expectDenied("власник не передає оголошення іншому", () => updateDoc(listingReference(ownListing.id), { ownerId: "someone-else" }));
  await expectDenied("власник змінює лише стан заявки, а не її дані", () =>
    updateDoc(applicationReference(pendingSeed.id), { applicantName: "Підмінено", updatedAt: Date.now() }),
  );

  // 4. Недопустимі переходи станів під власником відповідного оголошення
  await signInAs(user(listingOf(endedSeed.listingId).ownerKey));

  await expectDenied("власник не змінює заявку зі станом «Оренду завершено»", () =>
    updateDoc(applicationReference(endedSeed.id), { status: ApplicationStatus.Approved, updatedAt: Date.now() }),
  );

  await signInAs(user(listingOf(approvedSeed.listingId).ownerKey));

  await expectDenied("власник не відхиляє вже схвалену заявку", () =>
    updateDoc(applicationReference(approvedSeed.id), { status: ApplicationStatus.Rejected, updatedAt: Date.now() }),
  );

  await signOutUser();

  const failed = results.filter((result) => !result.passed);

  for (const result of results) console.log(`${result.passed ? "OK  " : "FAIL"} ${result.name} – ${result.detail}`);
  console.log(`\nПеревірено: ${results.length}, помилок: ${failed.length}`);

  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
