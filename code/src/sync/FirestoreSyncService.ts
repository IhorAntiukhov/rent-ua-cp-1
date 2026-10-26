import {
  collection,
  onSnapshot,
  query,
  where,
  type Firestore,
  type FirestoreError,
  type Query,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import type { ApplicationRepository } from "@/repositories/ApplicationRepository.ts";
import type { FavoriteRepository } from "@/repositories/FavoriteRepository.ts";
import type { ListingRepository } from "@/repositories/ListingRepository.ts";
import { COLLECTIONS } from "./collections.ts";
import { applicationFromDoc, favoriteFromDoc, listingFromDoc } from "./converters.ts";

// Кількість користувацьких слухачів: заявки власника, заявки орендаря, вподобання
const USER_LISTENERS_COUNT = 3;

interface SyncTarget<T> {
  upsert(item: T): void;
  remove(id: string): boolean;
}

// Єдине місце, де індекси змінюються з даних Firestore: слухачі onSnapshot оновлюють
// репозиторії, після кожного снепшота підписники (React) отримують сповіщення
export class FirestoreSyncService {
  private version = 0;
  private readonly subscribers = new Set<() => void>();
  private unsubscribeListings: Unsubscribe | null = null;
  private unsubscribeUserData: Unsubscribe[] = [];
  private activeUserId: string | null = null;
  private pendingUserSnapshots = 0;
  private listingsLoaded = false;
  private errorMessage: string | null = null;

  constructor(
    private readonly db: Firestore,
    private readonly listings: ListingRepository,
    private readonly applications: ApplicationRepository,
    private readonly favorites: FavoriteRepository,
  ) {}

  // Для useSyncExternalStore
  readonly subscribe = (subscriber: () => void): (() => void) => {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  };

  // Лічильник змін: зростає після кожного оброблення снепшота або зміни стану
  readonly getVersion = (): number => this.version;

  get listingsReady(): boolean {
    return this.listingsLoaded;
  }

  // Для гостя (без користувацьких слухачів) завжди true
  get userDataReady(): boolean {
    return this.pendingUserSnapshots === 0;
  }

  get error(): string | null {
    return this.errorMessage;
  }

  // Публічні оголошення: запускається один раз при старті застосунку
  startPublic(): void {
    if (this.unsubscribeListings) return;
    this.unsubscribeListings = onSnapshot(
      collection(this.db, COLLECTIONS.listings),
      (snapshot) => {
        this.applyChanges(snapshot, listingFromDoc, this.listings);
        this.listingsLoaded = true;
        this.notify();
      },
      (error) => this.fail(error),
    );
  }

  // Приватні дані користувача: заявки (як власника й орендаря) та вподобання
  startUser(userId: string): void {
    if (this.activeUserId === userId) return;
    this.stopUser();

    this.activeUserId = userId;
    this.pendingUserSnapshots = USER_LISTENERS_COUNT;
    this.unsubscribeUserData = [
      this.listenUserData(
        query(collection(this.db, COLLECTIONS.applications), where("ownerId", "==", userId)),
        applicationFromDoc,
        this.applications,
      ),
      this.listenUserData(
        query(collection(this.db, COLLECTIONS.applications), where("applicantId", "==", userId)),
        applicationFromDoc,
        this.applications,
      ),
      this.listenUserData(
        query(collection(this.db, COLLECTIONS.favorites), where("userId", "==", userId)),
        favoriteFromDoc,
        this.favorites,
      ),
    ];
    this.notify();
  }

  // Вихід: приватні дані прибираються, оголошення залишаються
  stopUser(): void {
    for (const unsubscribe of this.unsubscribeUserData) unsubscribe();
    this.unsubscribeUserData = [];
    this.activeUserId = null;
    this.pendingUserSnapshots = 0;
    this.applications.clear();
    this.favorites.clear();
    this.notify();
  }

  stop(): void {
    this.stopUser();
    this.unsubscribeListings?.();
    this.unsubscribeListings = null;
    this.listingsLoaded = false;
    this.errorMessage = null;
    this.listings.clear();
    this.notify();
  }

  private listenUserData<T>(
    userQuery: Query,
    fromDoc: (snapshot: QueryDocumentSnapshot) => T,
    target: SyncTarget<T>,
  ): Unsubscribe {
    let firstSnapshot = true;
    return onSnapshot(
      userQuery,
      (snapshot: QuerySnapshot) => {
        this.applyChanges(snapshot, fromDoc, target);
        if (firstSnapshot) {
          firstSnapshot = false;
          this.pendingUserSnapshots--;
        }
        this.notify();
      },
      (error: FirestoreError) => this.fail(error),
    );
  }

  // added / modified – оновлення індексів за новим станом, removed – видалення
  private applyChanges<T>(
    snapshot: QuerySnapshot,
    fromDoc: (snapshot: QueryDocumentSnapshot) => T,
    target: SyncTarget<T>,
  ): void {
    for (const change of snapshot.docChanges()) {
      if (change.type === "removed") target.remove(change.doc.id);
      else target.upsert(fromDoc(change.doc));
    }
  }

  private fail(error: FirestoreError): void {
    this.errorMessage = FirestoreSyncService.describe(error);
    this.notify();
  }

  private static describe(error: FirestoreError): string {
    switch (error.code) {
      case "permission-denied":
        return "Немає доступу до даних";
      case "unavailable":
        return "Немає з'єднання із сервером";
      default:
        return "Не вдалося завантажити дані";
    }
  }

  private notify(): void {
    this.version++;
    for (const subscriber of this.subscribers) subscriber();
  }
}
