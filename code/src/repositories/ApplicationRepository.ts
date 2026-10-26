import { BTree } from "@/core/data-structures/BTree.ts";
import { HashSet } from "@/core/data-structures/HashSet.ts";
import { HashTable } from "@/core/data-structures/HashTable.ts";
import { addToBucket, removeFromBucket } from "@/core/utils/buckets.ts";
import { compareStrings } from "@/core/utils/compare.ts";
import type { Application } from "@/domain/Application.ts";
import { ApplicationStatus } from "@/domain/enums.ts";

const ALL_APPLICATION_STATUSES = Object.values(ApplicationStatus);

// Нові заявки спершу
function compareNewestFirst(a: Application, b: Application): number {
  return b.createdAt - a.createdAt || compareStrings(a.id, b.id);
}

export class ApplicationRepository {
  // Первинне сховище: id -> заявка
  private readonly applicationsById = new BTree<string, Application>(compareStrings);
  // Хеш-індекси: ключ -> id заявок
  private readonly listingIndex = new HashTable<string, HashSet<string>>();
  private readonly applicantStatusIndex = new HashTable<string, HashSet<string>>();

  get size(): number {
    return this.applicationsById.size;
  }

  get(id: string): Application | undefined {
    return this.applicationsById.get(id);
  }

  upsert(application: Application): void {
    const previous = this.applicationsById.get(application.id);
    if (previous) this.removeFromIndexes(previous);
    this.applicationsById.insert(application.id, application);
    this.addToIndexes(application);
  }

  upsertMany(applications: Application[]): void {
    for (const application of applications) this.upsert(application);
  }

  remove(id: string): boolean {
    const previous = this.applicationsById.get(id);
    if (!previous) return false;
    this.removeFromIndexes(previous);
    this.applicationsById.delete(id);
    return true;
  }

  clear(): void {
    this.applicationsById.clear();
    this.listingIndex.clear();
    this.applicantStatusIndex.clear();
  }

  // Без status – заявки в усіх станах
  findByListing(listingId: string, status?: ApplicationStatus): Application[] {
    const ids = this.listingIndex.get(listingId);
    if (!ids) return [];
    return this.loadByIds(ids)
      .filter((application) => status === undefined || application.status === status)
      .sort(compareNewestFirst);
  }

  // Без status – заявки в усіх станах
  findByApplicant(applicantId: string, status?: ApplicationStatus): Application[] {
    const ids =
      status === undefined
        ? this.idsOfApplicantInAllStatuses(applicantId)
        : this.applicantStatusIndex.get(this.applicantStatusKey(applicantId, status));
    return ids ? this.loadByIds(ids).sort(compareNewestFirst) : [];
  }

  // Чи є в користувача заявка в очікуванні на це оголошення
  hasPendingApplication(applicantId: string, listingId: string): boolean {
    const pendingIds = this.applicantStatusIndex.get(this.applicantStatusKey(applicantId, ApplicationStatus.Pending));
    if (!pendingIds) return false;
    return this.loadByIds(pendingIds).some((application) => application.listingId === listingId);
  }

  private applicantStatusKey(applicantId: string, status: ApplicationStatus): string {
    return `${applicantId}:${status}`;
  }

  private idsOfApplicantInAllStatuses(applicantId: string): HashSet<string> {
    let ids = new HashSet<string>();
    for (const status of ALL_APPLICATION_STATUSES) {
      const bucket = this.applicantStatusIndex.get(this.applicantStatusKey(applicantId, status));
      if (bucket) ids = HashSet.union(ids, bucket);
    }
    return ids;
  }

  private loadByIds(ids: HashSet<string>): Application[] {
    const applications: Application[] = [];
    for (const id of ids) {
      const application = this.applicationsById.get(id);
      if (application) applications.push(application);
    }
    return applications;
  }

  private addToIndexes(application: Application): void {
    addToBucket(this.listingIndex, application.listingId, application.id);
    addToBucket(
      this.applicantStatusIndex,
      this.applicantStatusKey(application.applicantId, application.status),
      application.id,
    );
  }

  private removeFromIndexes(application: Application): void {
    removeFromBucket(this.listingIndex, application.listingId, application.id);
    removeFromBucket(
      this.applicantStatusIndex,
      this.applicantStatusKey(application.applicantId, application.status),
      application.id,
    );
  }
}
