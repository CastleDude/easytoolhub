"use client";

const COOKIE_NAME = "easytoolhub_favorites";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export function getFavorites(): string[] {
  if (typeof document === "undefined") return [];
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setFavorites(slugs: string[]): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(slugs))}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

export function toggleFavorite(slug: string): string[] {
  const current = getFavorites();
  const index = current.indexOf(slug);
  if (index >= 0) {
    current.splice(index, 1);
  } else {
    current.unshift(slug);
  }
  setFavorites(current);
  return current;
}
