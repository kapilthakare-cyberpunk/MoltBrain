/**
 * Query Cache
 * 
 * Caches query results to improve performance.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

export interface QueryCacheOptions {
  maxSize?: number;
  ttlMs?: number;
  onEvict?: (key: string, entry: CacheEntry<any>) => void;
}

export class QueryCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private options: QueryCacheOptions;

  constructor(options: QueryCacheOptions = {}) {
    this.options = {
      maxSize: 100,
      ttlMs: 5 * 60 * 1000, // 5 minutes
      ...options,
    };
  }

  /**
   * Get cached value
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;

    // Check TTL
    if (this.isExpired(entry)) {
      this.delete(key);
      return undefined;
    }

    entry.hits++;
    return entry.data;
  }

  /**
   * Set cached value
   */
  set(key: string, data: T): void {
    // Evict if at capacity
    if (this.cache.size >= this.options.maxSize! && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete cached value
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry && this.options.onEvict) {
      this.options.onEvict(key, entry);
    }
    return this.cache.delete(key);
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    if (this.options.onEvict) {
      for (const [key, entry] of this.cache) {
        this.options.onEvict(key, entry);
      }
    }
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache stats
   */
  stats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
  } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize!,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      totalHits,
    };
  }

  /**
   * Get or set with factory function
   */
  async getOrSet(key: string, factory: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const data = await factory();
    this.set(key, data);
    return data;
  }

  /**
   * Invalidate entries matching a pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Prune expired entries
   */
  prune(): number {
    let count = 0;
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.options.ttlMs!;
  }

  private evictLRU(): void {
    // Find least recently used (lowest hits, oldest)
    let lruKey: string | null = null;
    let lruEntry: CacheEntry<T> | null = null;

    for (const [key, entry] of this.cache) {
      if (!lruEntry || entry.hits < lruEntry.hits || 
          (entry.hits === lruEntry.hits && entry.timestamp < lruEntry.timestamp)) {
        lruKey = key;
        lruEntry = entry;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
    }
  }
}
