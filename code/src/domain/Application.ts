import { DomainError } from "./DomainError";
import { ApplicationStatus } from "./enums";
import type { Listing } from "./Listing";

export interface ApplicationInput {
  applicantName: string;
  contact: string;
  comment?: string | null;
}

export interface ApplicationData {
  id: string;
  listingId: string;
  ownerId: string;
  applicantId: string;
  applicantName: string;
  contact: string;
  comment: string | null;
  status: ApplicationStatus;
  createdAt: number;
  updatedAt: number;
}

// Заявка імутабельна: методи станів повертають нову копію
export class Application {
  readonly id: string;
  readonly listingId: string;
  readonly ownerId: string;
  readonly applicantId: string;
  readonly applicantName: string;
  readonly contact: string;
  readonly comment: string | null;
  readonly status: ApplicationStatus;
  readonly createdAt: number;
  readonly updatedAt: number;

  private constructor(data: ApplicationData) {
    this.id = data.id;
    this.listingId = data.listingId;
    this.ownerId = data.ownerId;
    this.applicantId = data.applicantId;
    this.applicantName = data.applicantName;
    this.contact = data.contact;
    this.comment = data.comment;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static create(id: string, listing: Listing, applicantId: string, input: ApplicationInput, now: number): Application {
    if (listing.isOwnedBy(applicantId)) throw new DomainError("Не можна подати заявку на власне оголошення");
    if (!listing.isOpen) throw new DomainError("Оголошення закрите для нових заявок");
    return new Application({
      id,
      listingId: listing.id,
      ownerId: listing.ownerId,
      applicantId,
      applicantName: input.applicantName,
      contact: input.contact,
      comment: input.comment ? input.comment : null,
      status: ApplicationStatus.Pending,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Відновлення з даних Firestore
  static fromData(data: ApplicationData): Application {
    return new Application(data);
  }

  get isPending(): boolean {
    return this.status === ApplicationStatus.Pending;
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  isSubmittedBy(userId: string): boolean {
    return this.applicantId === userId;
  }

  approve(now: number): Application {
    return this.transition(ApplicationStatus.Pending, ApplicationStatus.Approved, now);
  }

  reject(now: number): Application {
    return this.transition(ApplicationStatus.Pending, ApplicationStatus.Rejected, now);
  }

  cancel(now: number): Application {
    return this.transition(ApplicationStatus.Pending, ApplicationStatus.Cancelled, now);
  }

  revoke(now: number): Application {
    return this.transition(ApplicationStatus.Approved, ApplicationStatus.Revoked, now);
  }

  toData(): ApplicationData {
    return {
      id: this.id,
      listingId: this.listingId,
      ownerId: this.ownerId,
      applicantId: this.applicantId,
      applicantName: this.applicantName,
      contact: this.contact,
      comment: this.comment,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transition(from: ApplicationStatus, to: ApplicationStatus, now: number): Application {
    if (this.status !== from) throw new DomainError("Цю дію неможливо виконати в поточному стані заявки");
    return new Application({ ...this.toData(), status: to, updatedAt: now });
  }
}
