export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function toISODate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}
