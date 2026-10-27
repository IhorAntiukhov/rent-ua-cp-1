export function loginHref(returnPath: string): string {
  return `/login?next=${encodeURIComponent(returnPath)}`;
}

// Шлях повернення після входу з параметра next; лише внутрішні шляхи, щоб уникнути відкритого перенаправлення
export function getReturnPath(): string {
  const next = new URLSearchParams(globalThis.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
