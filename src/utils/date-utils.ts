/**
 * Get today's date as UTC midnight
 * Use this for "date-only" fields like lease dates
 */
export function getTodayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

/**
 * Parse YYYY-MM-DD string as UTC midnight
 * Reusable version of parseAsUTC from actions
 */
export function parseAsUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
