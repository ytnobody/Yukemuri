# @yukemuri/plugin-cache

Cache plugin for Yukemuri - Provides in-memory caching with TTL, configurable eviction strategies, and cache invalidation.

## Features

- **In-Memory Caching**: Fast, in-process caching for frequently accessed data
- **TTL Support**: Automatic expiration of cached entries
- **Eviction Strategies**: LRU, LFU, and FIFO strategies when max size is reached
- **Statistics Tracking**: Hit rate, miss count, and eviction metrics
- **Pattern-Based Invalidation**: Invalidate multiple cache entries using regex patterns
- **Event Listeners**: React to cache invalidation events
- **Type-Safe**: Full TypeScript support with generics

## Installation

```bash
npm install @yukemuri/plugin-cache
```

## Quick Start

### Basic Usage

```typescript
import { createCache } from '@yukemuri/plugin-cache';

const cache = createCache({
  defaultTtl: 60000,  // 60 seconds
  maxSize: 1000,      // Maximum entries
  strategy: 'LRU',    // Eviction strategy
});

// Set a value
cache.set('user:1', { id: 1, name: 'Alice' });

// Get a value
const user = cache.get('user:1');

// Check if key exists
if (cache.has('user:1')) {
  console.log('User is cached');
}

// Delete a value
cache.delete('user:1');

// Clear all entries
cache.clear();
```

### Custom TTL

```typescript
const cache = createCache();

// Set with 10 second TTL
cache.set('temp:data', { value: 'important' }, { ttl: 10000 });

// Set with no expiration (null TTL)
cache.set('permanent:data', { value: 'keep forever' }, { ttl: null });
```

### Get or Set Pattern

```typescript
const cache = createCache();

// Synchronous
const user = cache.getOrSet('user:1', () => {
  return fetchUserFromDatabase(1);
});

// Asynchronous
const user = await cache.getOrSet('user:1', async () => {
  return await fetchUserFromDatabase(1);
});
```

### Pattern-Based Invalidation

```typescript
const cache = createCache();

cache.set('user:1', { id: 1, name: 'Alice' });
cache.set('user:2', { id: 2, name: 'Bob' });
cache.set('post:1', { id: 1, title: 'Post 1' });

// Invalidate all user entries using string pattern
cache.invalidatePattern('user:.*');

// Or using regex
cache.invalidatePattern(/^user:/);
```

### Cache Events

```typescript
const cache = createCache();

const unsubscribe = cache.onInvalidation((event) => {
  console.log(`Cache ${event.type}: ${event.key}`);
  // event.type: 'set', 'delete', 'clear', or 'evict'
  // event.key: the cache key (null for clear/evict)
  // event.timestamp: when the event occurred
});

cache.set('key', 'value');
cache.delete('key');

// Unsubscribe when no longer needed
unsubscribe();
```

### Statistics

```typescript
const cache = createCache();

cache.set('key1', 'value1');
cache.set('key2', 'value2');

cache.get('key1'); // hit
cache.get('key1'); // hit
cache.get('key3'); // miss

const stats = cache.stats();
console.log(stats);
// {
//   hitCount: 2,
//   missCount: 1,
//   totalEntries: 2,
//   maxEntries: 1000,
//   evictedCount: 0,
//   hitRate: 0.6666666666666666
// }
```

## Configuration

### CacheConfig Options

```typescript
interface CacheConfig {
  defaultTtl?: number;      // Default TTL in ms (default: 60000)
  maxSize?: number;         // Max entries (default: 1000)
  strategy?: CacheStrategy; // 'LRU' | 'LFU' | 'FIFO' (default: 'LRU')
  enableStats?: boolean;    // Enable statistics (default: true)
}
```

### Eviction Strategies

- **LRU (Least Recently Used)**: Evicts entries that haven't been accessed recently (default)
- **LFU (Least Frequently Used)**: Evicts entries with the lowest access count
- **FIFO (First In First Out)**: Evicts entries in the order they were added

## API Reference

### CacheManager

#### Methods

- `get<T>(key: string): T | undefined` - Retrieve a value
- `set<T>(key: string, value: T, options?: CacheOptions): void` - Store a value
- `has(key: string): boolean` - Check if key exists
- `delete(key: string): boolean` - Delete a value
- `clear(): void` - Clear all entries
- `keys(): string[]` - Get all keys
- `size(): number` - Get number of entries
- `stats(): CacheStats` - Get cache statistics
- `getOrSet<T>(key: string, fn: () => T | Promise<T>, options?: CacheOptions): T | Promise<T>` - Get or compute value
- `invalidatePattern(pattern: string | RegExp): number` - Invalidate matching entries
- `onInvalidation(listener: (event) => void): () => void` - Listen for events
- `getConfig(): CacheConfig` - Get current configuration
- `setConfig(config: Partial<CacheConfig>): void` - Update configuration

## Type Definitions

```typescript
export type CacheStrategy = 'LRU' | 'FIFO' | 'LFU';

export interface CacheOptions {
  ttl?: number;           // Time to live in ms
  maxSize?: number;       // Max size override
  strategy?: CacheStrategy; // Strategy override
}

export interface CacheStats {
  hitCount: number;
  missCount: number;
  totalEntries: number;
  maxEntries: number;
  evictedCount: number;
  hitRate: number;
}

export interface CacheInvalidationEvent {
  type: 'set' | 'delete' | 'clear' | 'evict';
  key?: string;
  timestamp: number;
}
```

## Best Practices

1. **Set appropriate TTLs**: Balance between memory usage and staleness
2. **Use pattern invalidation**: Bulk invalidate related entries together
3. **Monitor hit rate**: Use statistics to optimize cache size and TTL
4. **Choose the right strategy**:
   - Use LRU for general purpose (default)
   - Use LFU if some entries are accessed much more than others
   - Use FIFO for time-based data
5. **Unsubscribe from events**: Call the returned function to clean up listeners

## Performance Considerations

- Cache lookups are O(1) operations
- LRU eviction is O(n) where n is the number of entries
- LFU eviction is O(n log n)
- FIFO eviction is O(n log n)
- TTL cleanup is performed lazily on access

## License

MIT
