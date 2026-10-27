import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type Unsubscribe,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, type Firestore } from "firebase/firestore";
import { DomainError } from "@/domain/DomainError.ts";
import { UserProfile } from "@/domain/UserProfile.ts";
import type { LoginFormValues, RegisterFormValues } from "@/lib/validation.ts";
import { COLLECTIONS } from "@/sync/collections.ts";
import { userProfileFromDoc, userProfileToDoc } from "@/sync/converters.ts";

export class AuthService {
  // Реєстрація, що виконується зараз: getProfile чекає на неї, щоб не прочитати профіль до запису
  private pendingRegistration: Promise<UserProfile> | null = null;

  constructor(
    private readonly auth: Auth,
    private readonly db: Firestore,
  ) {}

  // Створює обліковий запис Auth і профіль у users/{uid}; якщо профіль не записався, акаунт видаляється
  async register(values: RegisterFormValues): Promise<UserProfile> {
    const registration = this.createAccount(values);
    this.pendingRegistration = registration;

    try {
      return await registration;
    } catch (error) {
      throw AuthService.toDomainError(error);
    } finally {
      this.pendingRegistration = null;
    }
  }

  async login(values: LoginFormValues): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, values.email, values.password);
    } catch (error) {
      throw AuthService.toDomainError(error);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  // Колбек отримує uid користувача або null після виходу
  onAuthChange(callback: (userId: string | null) => void): Unsubscribe {
    return onAuthStateChanged(this.auth, (user: User | null) => callback(user ? user.uid : null));
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    await this.pendingRegistration?.catch(() => undefined);

    const snapshot = await getDoc(doc(this.db, COLLECTIONS.users, userId));

    return snapshot.exists() ? userProfileFromDoc(snapshot) : null;
  }

  private async createAccount(values: RegisterFormValues): Promise<UserProfile> {
    const credential = await createUserWithEmailAndPassword(this.auth, values.email, values.password);
    const profile = UserProfile.create(credential.user.uid, values.email, values.firstName, values.lastName, Date.now());

    try {
      await setDoc(doc(this.db, COLLECTIONS.users, profile.uid), userProfileToDoc(profile));
    } catch (error) {
      await deleteUser(credential.user);
      throw error;
    }

    return profile;
  }

  private static toDomainError(error: unknown): DomainError {
    if (error instanceof DomainError) return error;

    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

    switch (code) {
      case "auth/email-already-in-use":
        return new DomainError("Користувач із таким email уже зареєстрований");
      case "auth/invalid-email":
        return new DomainError("Некоректна адреса email");
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return new DomainError("Неправильний email або пароль");
      case "auth/weak-password":
        return new DomainError("Занадто простий пароль");
      case "auth/too-many-requests":
        return new DomainError("Забагато спроб, спробуйте пізніше");
      case "auth/network-request-failed":
        return new DomainError("Немає з'єднання із сервером");
      case "auth/operation-not-allowed":
      case "auth/configuration-not-found":
        return new DomainError("Автентифікацію не налаштовано у Firebase");
      case "permission-denied":
        return new DomainError("Не вдалося зберегти профіль: немає доступу");
      default:
        return new DomainError("Сталася помилка автентифікації");
    }
  }
}
