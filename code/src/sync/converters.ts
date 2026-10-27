import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Application, type ApplicationData } from "@/domain/Application.ts";
import { Favorite, type FavoriteData } from "@/domain/Favorite.ts";
import { Listing, type ListingData } from "@/domain/Listing.ts";
import { UserProfile, type UserProfileData } from "@/domain/UserProfile.ts";

// Документ Firestore не містить власного id: він береться з ключа документа
type WithoutId<T extends { id: string }> = Omit<T, "id">;

function withoutId<T extends { id: string }>(data: T): WithoutId<T> {
  const { id, ...rest } = data;
  void id;

  return rest;
}

export function listingFromDoc(snapshot: QueryDocumentSnapshot): Listing {
  const data: DocumentData = snapshot.data();

  return Listing.fromData({
    id: snapshot.id,
    ownerId: data.ownerId,
    ownerName: data.ownerName,
    ownerPhone: data.ownerPhone,

    address: {
      country: data.address.country,
      city: data.address.city,
      street: data.address.street,
      building: data.address.building,
      apartment: data.address.apartment,
    },
    rooms: data.rooms,
    area: data.area,
    description: data.description ?? "",
    pricePerMonth: data.pricePerMonth,

    status: data.status,
    approvedApplicationId: data.approvedApplicationId ?? null,

    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  });
}

export function listingToDoc(listing: Listing): WithoutId<ListingData> {
  return withoutId(listing.toData());
}

export function applicationFromDoc(snapshot: QueryDocumentSnapshot): Application {
  const data: DocumentData = snapshot.data();

  return Application.fromData({
    id: snapshot.id,
    listingId: data.listingId,
    ownerId: data.ownerId,

    applicantId: data.applicantId,
    applicantName: data.applicantName,
    contact: data.contact,
    comment: data.comment ?? null,

    status: data.status,

    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  });
}

export function applicationToDoc(application: Application): WithoutId<ApplicationData> {
  return withoutId(application.toData());
}

export function favoriteFromDoc(snapshot: QueryDocumentSnapshot): Favorite {
  const data: DocumentData = snapshot.data();

  return Favorite.fromData({
    id: snapshot.id,
    userId: data.userId,
    listingId: data.listingId,
    createdAt: data.createdAt,
  });
}

export function favoriteToDoc(favorite: Favorite): WithoutId<FavoriteData> {
  return withoutId(favorite.toData());
}

// Ключ документа профілю – uid користувача
export function userProfileFromDoc(snapshot: { id: string; data(): DocumentData | undefined }): UserProfile {
  const data: DocumentData = snapshot.data() ?? {};

  return UserProfile.fromData({
    uid: snapshot.id,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    createdAt: data.createdAt,
  });
}

export function userProfileToDoc(profile: UserProfile): Omit<UserProfileData, "uid"> {
  const { uid, ...rest } = profile.toData();
  void uid;

  return rest;
}
