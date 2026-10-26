export interface FavoriteData {
  id: string;
  userId: string;
  listingId: string;
  createdAt: number;
}

export class Favorite {
  readonly id: string;
  readonly userId: string;
  readonly listingId: string;
  readonly createdAt: number;

  private constructor(data: FavoriteData) {
    this.id = data.id;
    this.userId = data.userId;
    this.listingId = data.listingId;
    this.createdAt = data.createdAt;
  }

  // Детермінований id: одне вподобання на пару користувач–оголошення
  static idFor(userId: string, listingId: string): string {
    return `${userId}_${listingId}`;
  }

  static create(userId: string, listingId: string, now: number): Favorite {
    return new Favorite({ id: Favorite.idFor(userId, listingId), userId, listingId, createdAt: now });
  }

  static fromData(data: FavoriteData): Favorite {
    return new Favorite(data);
  }

  toData(): FavoriteData {
    return { id: this.id, userId: this.userId, listingId: this.listingId, createdAt: this.createdAt };
  }
}
