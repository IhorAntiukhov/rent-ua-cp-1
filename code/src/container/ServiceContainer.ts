import type { Firestore } from "firebase/firestore";
import { ApplicationRepository } from "@/repositories/ApplicationRepository.ts";
import { FavoriteRepository } from "@/repositories/FavoriteRepository.ts";
import { ListingRepository } from "@/repositories/ListingRepository.ts";
import { FirestoreSyncService } from "@/sync/FirestoreSyncService.ts";

// Composition root: створює об'єкти застосунку один раз і зв'язує їх між собою
export class ServiceContainer {
  readonly listings = new ListingRepository();
  readonly applications = new ApplicationRepository();
  readonly favorites = new FavoriteRepository();
  readonly sync: FirestoreSyncService;

  constructor(db: Firestore) {
    this.sync = new FirestoreSyncService(db, this.listings, this.applications, this.favorites);
  }
}
