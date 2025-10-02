import { createUser, getUserByEmail } from "./database";

interface User {
  id: string;
  email: string;
}

let currentUser: User | null = null;

const AUTH_STORAGE_KEY = "ebenezer_auth_user";

export function getCurrentUser(): User | null {
  if (!currentUser) {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      currentUser = JSON.parse(stored);
    }
  }
  return currentUser;
}

export async function signIn(email: string, password: string): Promise<User> {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("Credenziali non valide");
  }

  const userObj = { id: user.id as string, email: user.email as string };
  currentUser = userObj;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));

  return userObj;
}

export async function signUp(email: string, password: string): Promise<User> {
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new Error("Email già registrata");
  }

  const id = crypto.randomUUID();
  await createUser(id, email);

  const userObj = { id, email };
  currentUser = userObj;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));

  return userObj;
}

export function signOut() {
  currentUser = null;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  callback(getCurrentUser());

  const interval = setInterval(() => {
    const user = getCurrentUser();
    callback(user);
  }, 1000);

  return () => clearInterval(interval);
}
