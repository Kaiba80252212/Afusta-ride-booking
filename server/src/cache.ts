/* Tiny in-memory TTL cache for hot, rarely-changing reads (fare settings,
 * active locations). Helps warm serverless instances and the long-running
 * local API avoid redundant round-trips to PostgreSQL. Not shared across
 * instances; entries expire quickly so staleness stays bounded. */
type CacheEntry = { value: unknown; expires: number };
const store = new Map<string, CacheEntry>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expires <= Date.now()) { store.delete(key); return undefined; }
  return entry.value as T;
}

export function cacheSet(key: string, value: unknown, ttlMs: number): void {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

export function cacheInvalidate(...keys: string[]): void {
  for (const key of keys) store.delete(key);
}

export const FARES_CACHE_KEY = 'fares:active';
export const LOCATIONS_CACHE_KEY = 'locations:active';
