import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { ApplicationRepository } from "@/repositories/ApplicationRepository.ts";
import { FavoriteRepository } from "@/repositories/FavoriteRepository.ts";
import { ListingRepository } from "@/repositories/ListingRepository.ts";
import { ApplicationService } from "@/services/ApplicationService.ts";
import { AuthService } from "@/services/AuthService.ts";
import { FavoriteService } from "@/services/FavoriteService.ts";
import { ListingService } from "@/services/ListingService.ts";
import { FirestoreSyncService } from "@/sync/FirestoreSyncService.ts";

// Composition root: створює об'єкти застосунку один раз і зв'язує їх між собою
export class ServiceContainer {
  readonly listings = new ListingRepository();
  readonly applications = new ApplicationRepository();
  readonly favorites = new FavoriteRepository();

  readonly sync: FirestoreSyncService;
  readonly authService: AuthService;
  readonly listingService: ListingService;
  readonly applicationService: ApplicationService;
  readonly favoriteService: FavoriteService;

  constructor(db: Firestore, auth: Auth) {
    this.sync = new FirestoreSyncService(db, this.listings, this.applications, this.favorites);

    this.authService = new AuthService(auth, db);
    this.listingService = new ListingService(db, this.listings, this.applications);
    this.applicationService = new ApplicationService(db, this.listings, this.applications);
    this.favoriteService = new FavoriteService(db, this.listings, this.favorites);
  }
}
