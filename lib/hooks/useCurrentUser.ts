"use client";

import { useEffect, useSyncExternalStore } from "react";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  role: "USER" | "ADMIN";
  mustChangePassword: boolean;
};

type State = {
  user: CurrentUser | null;
  loading: boolean;
};

type CacheState =
  | { status: "idle" }
  | { status: "loading"; promise: Promise<CurrentUser | null> }
  | { status: "ready"; user: CurrentUser | null };

let cache: CacheState = { status: "idle" };
let currentSnapshot: State = { user: null, loading: true };
const listeners = new Set<() => void>();

function recompute() {
  currentSnapshot =
    cache.status === "ready"
      ? { user: cache.user, loading: false }
      : { user: null, loading: true };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): State {
  return currentSnapshot;
}

const SERVER_SNAPSHOT: State = { user: null, loading: true };
function getServerSnapshot(): State {
  return SERVER_SNAPSHOT;
}

function ensureFetch(): Promise<CurrentUser | null> {
  if (cache.status === "ready") return Promise.resolve(cache.user);
  if (cache.status === "loading") return cache.promise;
  const promise = (async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const user = res.ok ? ((await res.json()).user as CurrentUser) : null;
      cache = { status: "ready", user };
      recompute();
      return user;
    } catch {
      cache = { status: "ready", user: null };
      recompute();
      return null;
    }
  })();
  cache = { status: "loading", promise };
  return promise;
}

export function useCurrentUser(): State {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    void ensureFetch();
  }, []);
  return state;
}

export function clearCurrentUserCache() {
  cache = { status: "ready", user: null };
  recompute();
}

export function refreshCurrentUser() {
  cache = { status: "idle" };
  void ensureFetch();
}
