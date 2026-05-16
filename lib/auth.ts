import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const googleProvider = new GoogleAuthProvider();

export { getRedirectResult };

export async function signInWithGoogle(): Promise<boolean> {
  try {
    await signInWithPopup(auth, googleProvider);
    return true;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
      await signInWithRedirect(auth, googleProvider);
      return false;
    }
    throw err;
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string,
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: username });
  return credential;
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return firebaseSignOut(auth);
}
