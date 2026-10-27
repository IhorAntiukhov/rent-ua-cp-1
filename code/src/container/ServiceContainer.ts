import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { ApplicationRepository } from "@/repositories/ApplicationRepository.ts";
import { FavoriteRepository } from "@/repositories/FavoriteRepository.ts";
import { ListingRepository } from "@/repositories/ListingRepository.ts";
import { AuthService } from "@/services/AuthService.ts";
import { FirestoreSyncService } from "@/sync/FirestoreSyncService.ts";

// Composition root: створює об'єкти застосунку один раз і зв'язує їх між собою
export class ServiceContainer {
  readonly listings = new ListingRepository();
  readonly applications = new ApplicationRepository();
  readonly favorites = new FavoriteRepository();
  readonly sync: FirestoreSyncService;
  readonly authService: AuthService;

  constructor(db: Firestore, auth: Auth) {
    this.sync = new FirestoreSyncService(db, this.listings, this.applications, this.favorites);
    this.authService = new AuthService(auth, db);
  }
}
