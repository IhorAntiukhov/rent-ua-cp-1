import { collection, deleteDoc, doc, runTransaction, setDoc, updateDoc, type Firestore } from "firebase/firestore";
import { Application, type ApplicationInput } from "@/domain/Application.ts";
import { DomainError } from "@/domain/DomainError.ts";
import { ApplicationStatus } from "@/domain/enums.ts";
import type { ApplicationRepository } from "@/repositories/ApplicationRepository.ts";
import type { ListingRepository } from "@/repositories/ListingRepository.ts";
import { COLLECTIONS } from "@/sync/collections.ts";
import { applicationToDoc } from "@/sync/converters.ts";
import { readApplication, readListing } from "./documentReaders.ts";

export class ApplicationService {
  constructor(
    private readonly db: Firestore,
    private readonly listings: ListingRepository,
    private readonly applications: ApplicationRepository,
  ) {}

  // Подає заявку на оголошення; повертає id нової заявки
  async submit(userId: string, listingId: string, input: ApplicationInput): Promise<string> {
    const listing = this.listings.get(listingId);
    if (!listing) throw new DomainError("Оголошення не знайдено");
    if (this.applications.hasPendingApplication(userId, listingId)) {
      throw new DomainError("Заявку на це оголошення вже подано");
    }

    const reference = doc(collection(this.db, COLLECTIONS.applications));
    const application = Application.create(reference.id, listing, userId, input, Date.now());

    await setDoc(reference, applicationToDoc(application));

    return application.id;
  }

  // Орендар видаляє власну заявку, що очікує: вона повністю зникає
  async withdraw(userId: string, applicationId: string): Promise<void> {
    const application = this.requireApplication(applicationId);
    if (!application.isSubmittedBy(userId)) throw new DomainError("Можна видалити лише власну заявку");
    if (!application.isPending) throw new DomainError("Видалити можна лише заявку, що очікує");

    await deleteDoc(doc(this.db, COLLECTIONS.applications, application.id));
  }

  // Власник оголошення відхиляє заявку
  async reject(userId: string, applicationId: string): Promise<void> {
    const application = this.requireApplication(applicationId);
    if (!application.isOwnedBy(userId)) throw new DomainError("Лише власник оголошення може відхилити заявку");

    const rejected = application.reject(Date.now());

    await this.writeStatus(rejected);
  }

  // Схвалює заявку й закриває оголошення; решта заявок, що очікують, відхиляються
  async approve(userId: string, applicationId: string): Promise<void> {
    const target = this.requireApplication(applicationId);
    if (!target.isOwnedBy(userId)) throw new DomainError("Лише власник оголошення може схвалити заявку");

    // Транзакція не вміє виконувати запити, тому інші заявки беруться з локального індексу
    const otherPendingIds = this.applications
      .findByListing(target.listingId, ApplicationStatus.Pending)
      .filter((application) => application.id !== target.id)
      .map((application) => application.id);

    await runTransaction(this.db, async (transaction) => {
      const listing = await readListing(this.db, transaction, target.listingId);
      const application = await readApplication(this.db, transaction, target.id);

      const others: Application[] = [];
      for (const id of otherPendingIds) others.push(await readApplication(this.db, transaction, id));

      const now = Date.now();
      const closed = listing.close(application.id, now);
      const approved = application.approve(now);
      const rejected = others.filter((other) => other.isPending).map((other) => other.reject(now));

      transaction.update(doc(this.db, COLLECTIONS.listings, closed.id), {
        status: closed.status,
        approvedApplicationId: closed.approvedApplicationId,
        updatedAt: closed.updatedAt,
      });

      for (const changed of [approved, ...rejected]) {
        transaction.update(doc(this.db, COLLECTIONS.applications, changed.id), {
          status: changed.status,
          updatedAt: changed.updatedAt,
        });
      }
    });
  }

  private requireApplication(applicationId: string): Application {
    const application = this.applications.get(applicationId);
    if (!application) throw new DomainError("Заявку не знайдено");

    return application;
  }

  private async writeStatus(application: Application): Promise<void> {
    await updateDoc(doc(this.db, COLLECTIONS.applications, application.id), {
      status: application.status,
      updatedAt: application.updatedAt,
    });
  }
}
