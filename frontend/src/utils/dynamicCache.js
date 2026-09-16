/**
 * Dynamic SWR (Stale-While-Revalidate) Client-Side Cache
 * Provides instant 0ms cached page rendering with background revalidation.
 */

const memoryCache = new Map();

export const dynamicCache = {
  get(key) {
    // 1. Memory check
    if (memoryCache.has(key)) {
      return memoryCache.get(key);
    }

    // 2. LocalStorage check
    try {
      const stored = localStorage.getItem(`rit_cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryCache.set(key, parsed.data);
        return parsed.data;
      }
    } catch {
      // Ignore storage errors
    }

    return null;
  },

  set(key, data, ttlMs = 10 * 60 * 1000) {
    if (data == null) return;
    memoryCache.set(key, data);

    try {
      localStorage.setItem(
        `rit_cache_${key}`,
        JSON.stringify({
          timestamp: Date.now(),
          ttlMs,
          data,
        })
      );
    } catch {
      // Ignore quota errors
    }
  },

  invalidate(pattern) {
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
      }
    }

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('rit_cache_') && k.includes(pattern)) {
          localStorage.removeItem(k);
        }
      }
    } catch {
      // Ignore errors
    }
  },

  /**
   * Stale-While-Revalidate execution helper
   */
  async fetchSWR(key, fetchFn, { onData, ttlMs = 600000 } = {}) {
    const cached = this.get(key);
    if (cached && onData) {
      onData(cached, true); // true = fromCache
    }

    try {
      const freshData = await fetchFn();
      if (freshData != null) {
        this.set(key, freshData, ttlMs);
        if (onData) {
          onData(freshData, false); // false = fresh
        }
      }
      return freshData;
    } catch (err) {
      if (cached) {
        return cached;
      }
      throw err;
    }
  }
};

export default dynamicCache;
