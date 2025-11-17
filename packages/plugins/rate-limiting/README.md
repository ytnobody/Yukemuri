# @yukemuri/plugin-rate-limiting

Rate limiting plugin for Yukemuri framework. Provides token bucket and sliding window algorithms for request throttling and quota management.

## Features

- **Token Bucket Algorithm**: Smooth request distribution over time
- **Sliding Window Algorithm**: Accurate request counting in rolling time window
- **Fixed Window Algorithm**: Simple fixed time window limiting
- **Customizable Storage**: In-memory or custom distributed store
- **Per-User/IP Limiting**: Flexible key generation
- **Rate Limit Headers**: Standard HTTP rate limit headers (X-RateLimit-*)
- **Custom Handlers**: Execute custom logic when limit exceeded
- **TypeScript Support**: Full type safety

## Installation

```bash
npm install @yukemuri/plugin-rate-limiting
# or
pnpm add @yukemuri/plugin-rate-limiting
```

## Quick Start

### Token Bucket (Recommended)

```typescript
import { Hono } from 'hono';
import { createRateLimit } from '@yukemuri/plugin-rate-limiting';

const app = new Hono();

// Apply rate limiting: 10 requests per 60 seconds
app.use(
  createRateLimit({
    strategy: 'token-bucket',
    maxRequests: 10,
    windowMs: 60000, // 60 seconds
  }),
);

app.get('/api/data', (c) => {
  return c.json({ data: 'Hello World' });
});
```

### Sliding Window

```typescript
app.use(
  createRateLimit({
    strategy: 'sliding-window',
    maxRequests: 100,
    windowMs: 3600000, // 1 hour
  }),
);
```

## Configuration

```typescript
interface RateLimitConfig {
  // Algorithm strategy: 'token-bucket', 'sliding-window', or 'fixed-window'
  strategy: RateLimitStrategy;

  // Maximum requests allowed in the window
  maxRequests: number;

  // Time window in milliseconds
  windowMs: number;

  // Skip rate limiting for successful requests (2xx)
  skipSuccessfulRequests?: boolean;

  // Skip rate limiting for failed requests (5xx)
  skipFailedRequests?: boolean;

  // Function to generate rate limit key (default: IP address)
  keyGenerator?: (context: Context) => string;

  // Custom handler when limit exceeded
  handler?: (context: Context, key: string, remaining: number) => void | Promise<void>;

  // Custom storage backend (default: MemoryStore)
  store?: RateLimitStore;
}
```

## Usage Examples

### Per-User Rate Limiting

```typescript
import { createRateLimit } from '@yukemuri/plugin-rate-limiting';

app.use(
  createRateLimit({
    strategy: 'token-bucket',
    maxRequests: 100,
    windowMs: 3600000, // 1 hour
    keyGenerator: (c) => {
      // Use user ID if authenticated, fallback to IP
      return c.req.header('authorization') || c.req.header('x-forwarded-for') || 'anonymous';
    },
  }),
);
```

### Custom Handler

```typescript
app.use(
  createRateLimit({
    strategy: 'token-bucket',
    maxRequests: 50,
    windowMs: 60000,
    handler: async (c, key, remaining) => {
      // Log rate limit event
      console.log(`Rate limit exceeded for key: ${key}, remaining: ${remaining}`);

      // Send notification, update database, etc.
      // await notifyUser(key);
    },
  }),
);
```

### Different Limits for Different Routes

```typescript
const publicLimit = createRateLimit({
  strategy: 'token-bucket',
  maxRequests: 10,
  windowMs: 60000,
});

const authenticatedLimit = createRateLimit({
  strategy: 'token-bucket',
  maxRequests: 1000,
  windowMs: 3600000,
  keyGenerator: (c) => c.req.header('authorization') || 'anonymous',
});

// Public API with strict limits
app.get('/api/public', publicLimit, (c) => {
  return c.json({ public: true });
});

// Authenticated API with generous limits
app.post('/api/protected', authenticatedLimit, async (c) => {
  // Protected endpoint logic
});
```

## Algorithm Comparison

### Token Bucket
- **Use Case**: Smooth traffic distribution, bursty but controlled access
- **Memory**: Low (O(n) keys, not requests)
- **Accuracy**: Good for bursty patterns
- **Best For**: APIs with occasional bursts of traffic

Example: Allow 10 requests/minute, but can do 15 in one burst, then pause for refill.

### Sliding Window
- **Use Case**: Precise rate limiting, strict enforcement
- **Memory**: Medium (stores recent timestamps)
- **Accuracy**: Highest precision
- **Best For**: Strict quota management

Example: Exactly 100 requests per hour, no bursts beyond limit.

### Fixed Window
- **Use Case**: Simple fixed time intervals
- **Memory**: Low
- **Accuracy**: Can allow bursts at window boundaries
- **Best For**: Simple implementations

## Response Headers

When rate limited, the middleware adds these HTTP headers:

```
X-RateLimit-Limit: 100        # Max requests in window
X-RateLimit-Remaining: 45     # Requests remaining
X-RateLimit-Reset: 1640000000 # Unix timestamp when limit resets
Retry-After: 3600             # Seconds to wait before retry
```

## Custom Storage

Implement the `RateLimitStore` interface for distributed rate limiting:

```typescript
import { RateLimitStore, RateLimitData, RateLimitKey } from '@yukemuri/plugin-rate-limiting';

class RedisStore implements RateLimitStore {
  private redis: RedisClient;

  async get(key: RateLimitKey): Promise<RateLimitData | undefined> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : undefined;
  }

  async set(key: RateLimitKey, data: RateLimitData): Promise<void> {
    await this.redis.setex(key, Math.ceil(data.resetTime / 1000), JSON.stringify(data));
  }

  async increment(key: RateLimitKey): Promise<RateLimitData> {
    // Redis INCR logic
  }

  async reset(key: RateLimitKey): Promise<void> {
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    await this.redis.flushdb();
  }
}

// Use with custom store
const rateLimit = createRateLimit({
  strategy: 'token-bucket',
  maxRequests: 100,
  windowMs: 3600000,
  store: new RedisStore(),
});
```

## Performance Considerations

- **Memory**: MemoryStore stores one entry per unique key. ~200 bytes per key
- **CPU**: O(1) operations for token bucket, O(n) for sliding window where n = requests in window
- **Distribution**: MemoryStore is single-instance only. Use custom store for multi-instance deployments

## Testing

```typescript
import { describe, it, expect } from 'node:test';
import { createRateLimit, MemoryStore } from '@yukemuri/plugin-rate-limiting';

describe('Rate Limiting', () => {
  it('should limit requests', async () => {
    const store = new MemoryStore();
    const rateLimit = createRateLimit({
      strategy: 'token-bucket',
      maxRequests: 2,
      windowMs: 1000,
      store,
    });

    // Test implementation
  });
});
```

## License

MIT
