let idCounter = 1;

/** Simple incrementing id generator for accounts/notes created client-side. */
export function nextId(): string {
  return String(idCounter++);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
