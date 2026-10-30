// deno-lint-ignore-file no-process-global
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "@/domain/UserProfile.ts";
import { auth, db } from "@/lib/firebase.ts";
import { COLLECTIONS } from "@/sync/collections.ts";
import { userProfileToDoc } from "@/sync/converters.ts";
import { DEMO_PASSWORD, type DemoUser } from "./seedData.ts";

export { auth, db };

export function requireEnv(): void {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    throw new Error("Не задано NEXT_PUBLIC_FIREBASE_API_KEY: запускайте скрипт через npm run, щоб підтягнувся .env.local");
  }
}

// Входить під демо-користувачем; якщо його ще немає, створює акаунт і профіль. Повертає uid
export async function ensureDemoUser(user: DemoUser): Promise<string> {
  let uid: string;

  try {
    uid = (await signInWithEmailAndPassword(auth, user.email, DEMO_PASSWORD)).user.uid;
  } catch {
    // Акаунта немає (або він захищений від перебору): створюємо
    uid = (await createUserWithEmailAndPassword(auth, user.email, DEMO_PASSWORD)).user.uid;
  }

  const profileReference = doc(db, COLLECTIONS.users, uid);
  if (!(await getDoc(profileReference)).exists()) {
    const profile = UserProfile.create(uid, user.email, user.firstName, user.lastName, Date.now());

    await setDoc(profileReference, userProfileToDoc(profile));
  }

  return uid;
}

export async function signInAs(user: DemoUser): Promise<string> {
  const credential = await signInWithEmailAndPassword(auth, user.email, DEMO_PASSWORD);

  return credential.user.uid;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
