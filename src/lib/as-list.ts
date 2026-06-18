/**
 * Coerce an i18n value to an array. Guards the landing sections so a
 * misconfigured or missing translation degrades to an empty list instead of
 * crashing the render with `t.map is not a function`.
 */
export function asList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}
