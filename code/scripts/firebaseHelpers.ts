// deno-lint-ignore-file no-process-global
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "@/domain/UserProfile.ts";
import { auth, db } from "@/lib/firebase.ts";
import { COLLECTIONS } from "@/sync/collections.ts";
import { userProfileToDoc } from "@/sync/converters.ts";
import type { DemoUser } from "./seedData.ts";

export { auth, db };

export function requireEnv(): void {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    throw new Error("Не задано NEXT_PUBLIC_FIREBASE_API_KEY: запускайте скрипт через npm run, щоб підтягнувся .env.local");
  }

  getDemoPassword();
}

// Пароль демо-акаунтів лежить лише в .env.local, а не в репозиторії
export function getDemoPassword(): string {
  const password = process.env.SEED_DEMO_PASSWORD;
  if (!password || password.length < 6) {
    throw new Error("Задайте SEED_DEMO_PASSWORD (мінімум 6 символів) у .env.local");
  }

  return password;
}

// Одноразова міграція: акаунт зі старим паролем (SEED_LEGACY_PASSWORD) отримує новий, дані зберігаються
async function migrateLegacyPassword(email: string, password: string): Promise<string | null> {
  const legacyPassword = process.env.SEED_LEGACY_PASSWORD;
  if (!legacyPassword) return null;

  try {
    const credential = await signInWithEmailAndPassword(auth, email, legacyPassword);
    await updatePassword(credential.user, password);

    return credential.user.uid;
  } catch {
    return null;
  }
}

// Входить під демо-користувачем; якщо його ще немає, створює акаунт і профіль. Повертає uid
export async function ensureDemoUser(user: DemoUser): Promise<string> {
  const password = getDemoPassword();
  let uid: string;

  try {
    uid = (await signInWithEmailAndPassword(auth, user.email, password)).user.uid;
  } catch {
    const migratedUid = await migrateLegacyPassword(user.email, password);

    if (migratedUid) {
      uid = migratedUid;
    } else {
      try {
        uid = (await createUserWithEmailAndPassword(auth, user.email, password)).user.uid;
      } catch {
        throw new Error(
          `Акаунт ${user.email} уже існує з іншим паролем: задайте SEED_LEGACY_PASSWORD зі старим паролем або видаліть акаунт у консолі`,
        );
      }
    }
  }

  const profileReference = doc(db, COLLECTIONS.users, uid);
  if (!(await getDoc(profileReference)).exists()) {
    const profile = UserProfile.create(uid, user.email, user.firstName, user.lastName, Date.now());

    await setDoc(profileReference, userProfileToDoc(profile));
  }

  return uid;
}

export async function signInAs(user: DemoUser): Promise<string> {
  const credential = await signInWithEmailAndPassword(auth, user.email, getDemoPassword());

  return credential.user.uid;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
