import { Address, type AddressData } from "./Address.ts";
import { DomainError } from "./DomainError.ts";
import { ListingStatus } from "./enums.ts";

export interface ListingInput {
  ownerName: string;
  ownerPhone: string;
  address: AddressData;
  rooms: number;
  area: number;
  description: string;
  pricePerMonth: number;
}

export interface ListingData extends ListingInput {
  id: string;
  ownerId: string;
  status: ListingStatus;
  approvedApplicationId: string | null;
  createdAt: number;
  updatedAt: number;
}

interface ListingFields {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  address: Address;
  rooms: number;
  area: number;
  description: string;
  pricePerMonth: number;
  status: ListingStatus;
  approvedApplicationId: string | null;
  createdAt: number;
  updatedAt: number;
}

type EditableFields = Pick<
  ListingFields,
  "ownerName" | "ownerPhone" | "address" | "rooms" | "area" | "description" | "pricePerMonth"
>;

function toEditableFields(input: ListingInput): EditableFields {
  return {
    ownerName: input.ownerName,
    ownerPhone: input.ownerPhone,
    address: Address.create(input.address),
    rooms: input.rooms,
    area: input.area,
    description: input.description,
    pricePerMonth: input.pricePerMonth,
  };
}

// Оголошення імутабельне: методи станів повертають нову копію.
// Значення полів уже перевірені формою, тут перевіряються лише переходи станів
export class Listing {
  readonly id: string;
  readonly ownerId: string;
  readonly ownerName: string;
  readonly ownerPhone: string;

  readonly address: Address;
  readonly rooms: number;
  readonly area: number;
  readonly description: string;
  readonly pricePerMonth: number;

  readonly status: ListingStatus;
  readonly approvedApplicationId: string | null;

  readonly createdAt: number;
  readonly updatedAt: number;

  private constructor(fields: ListingFields) {
    this.id = fields.id;
    this.ownerId = fields.ownerId;
    this.ownerName = fields.ownerName;
    this.ownerPhone = fields.ownerPhone;

    this.address = fields.address;
    this.rooms = fields.rooms;
    this.area = fields.area;
    this.description = fields.description;
    this.pricePerMonth = fields.pricePerMonth;

    this.status = fields.status;
    this.approvedApplicationId = fields.approvedApplicationId;

    this.createdAt = fields.createdAt;
    this.updatedAt = fields.updatedAt;
  }

  static create(id: string, ownerId: string, input: ListingInput, now: number): Listing {
    return new Listing({
      ...toEditableFields(input),
      id,
      ownerId,
      status: ListingStatus.Open,
      approvedApplicationId: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Відновлення з даних Firestore
  static fromData(data: ListingData): Listing {
    return new Listing({ ...data, address: Address.create(data.address) });
  }

  get isOpen(): boolean {
    return this.status === ListingStatus.Open;
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  update(input: ListingInput, now: number): Listing {
    if (!this.isOpen) throw new DomainError("Редагувати можна лише оголошення зі статусом «Здається»");

    return this.copy({ ...toEditableFields(input), updatedAt: now });
  }

  close(applicationId: string, now: number): Listing {
    if (!this.isOpen) throw new DomainError("Оголошення вже закрите");

    return this.copy({ status: ListingStatus.Closed, approvedApplicationId: applicationId, updatedAt: now });
  }

  reopen(now: number): Listing {
    if (this.isOpen) throw new DomainError("Оголошення вже відкрите");

    return this.copy({ status: ListingStatus.Open, approvedApplicationId: null, updatedAt: now });
  }

  toData(): ListingData {
    return { ...this.fields(), address: this.address.toData() };
  }

  private fields(): ListingFields {
    return {
      id: this.id,
      ownerId: this.ownerId,
      ownerName: this.ownerName,
      ownerPhone: this.ownerPhone,

      address: this.address,
      rooms: this.rooms,
      area: this.area,
      description: this.description,
      pricePerMonth: this.pricePerMonth,

      status: this.status,
      approvedApplicationId: this.approvedApplicationId,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private copy(changes: Partial<ListingFields>): Listing {
    return new Listing({ ...this.fields(), ...changes });
  }
}
