# Yukemuri Plugins

Official plugins for the Yukemuri framework.

## Available Plugins

### Implemented Plugins

#### 1. Authentication Plugin (@yukemuri/plugin-auth) ✅

Full-featured authentication and authorization system.

**Features:**
- JWT token management (HMAC-SHA256)
- Password hashing (PBKDF2)
- User management (CRUD operations)
- User profile management
- OAuth mock provider for development
- React hooks (useAuth, useUser)
- Pre-built UI components (LoginForm, RegisterForm, UserProfile, AuthGuard)
- Route protection middleware

**Quick Start:**
```bash
npm install @yukemuri/plugin-auth
```

```typescript
import authPlugin from '@yukemuri/plugin-auth';

app.use(authPlugin, {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: '7d'
});
```

**Documentation:** See [packages/plugins/auth/README.md](./auth/README.md)

---

#### 2. Database Plugin (@yukemuri/plugin-database) ✅

SQLite and Turso database integration with type-safe queries.

**Features:**
- SQLite/Turso database support
- Type-safe query operations (queryOne, queryAll, execute)
- CRUD operations (insert, update, delete)
- Transaction support with automatic rollback
- Table management (create, drop, getTableInfo)
- Database statistics and health checks
- Migration runner and schema builder
- Backup functionality
- Connection pooling

**Quick Start:**
```bash
npm install @yukemuri/plugin-database
```

```typescript
import { databasePlugin } from '@yukemuri/plugin-database';

app.use(databasePlugin, {
  url: 'file:./app.db',
  authToken: process.env.DATABASE_TOKEN
});
```

**Documentation:** See [packages/plugins/database/README.md](./database/README.md)

---

#### 3. Email Plugin (@yukemuri/plugin-email) ✅

Email sending with multiple transport options and template support.

**Features:**
- Support for SMTP, SendGrid, and Mailgun providers
- Email template engine with variable substitution
- Template registry (welcome, password_reset, email_verification)
- Rate limiting per user with quota management
- Email queue for batch operations
- Email validation (format, domain, list validation)
- Email formatting (recipient formatting, HTML-to-text, HTML escaping)
- Attachment support (file, buffer, base64)
- Connection health checks
- Type-safe error handling
- Comprehensive test suite (58 tests)

**Quick Start:**
```bash
npm install @yukemuri/plugin-email
```

```typescript
import emailPlugin from '@yukemuri/plugin-email';

app.use(emailPlugin, {
  provider: 'smtp',
  config: {
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  }
});
```

**Use Cases:**
- User notifications
- Transactional emails
- Newsletter delivery
- Password reset emails
- Account verification

**Documentation:** See [packages/plugins/email/README.md](./email/README.md)

---

#### 4. Rate Limiting Plugin (@yukemuri/plugin-rate-limiting) ✅

API rate limiting and quota management.

**Features:**
- Token bucket algorithm for smooth rate limiting
- Sliding window algorithm for precise rate limiting
- Per-user rate limiting with custom key generation
- Per-IP rate limiting support
- Configurable storage backends
- Rate limit headers in responses (X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After)
- Custom handler support for limit exceeded scenarios
- In-memory storage with MemoryStore
- Flexible rate limit strategies

**Quick Start:**
```bash
npm install @yukemuri/plugin-rate-limiting
```

```typescript
import { createRateLimit } from '@yukemuri/plugin-rate-limiting';

app.use(createRateLimit({
  strategy: 'token-bucket',
  maxRequests: 100,
  windowMs: 60000,
  keyGenerator: (c) => c.req.header('x-forwarded-for') || 'default'
}));
```

**Documentation:** See [packages/plugins/rate-limiting/README.md](./rate-limiting/README.md)

---

#### 5. Logging Plugin (@yukemuri/plugin-logging) ✅

Structured logging with multi-sink support.

**Features:**
- Structured JSON logging with timestamps
- Multiple log levels (debug, info, warn, error) with level filtering
- Multi-sink architecture for flexible output
- Built-in sinks: Console, In-Memory (MemoryFileSink)
- Extensible LogSink interface for custom sinks
- Async sink support for non-blocking operations
- Hono middleware for automatic request/response logging
- Error logging with stack traces
- Metadata support for contextual information
- Type-safe logger with ILogger interface

**Quick Start:**
```bash
npm install @yukemuri/plugin-logging
```

```typescript
import { createLogger, createLoggingMiddleware, MemoryFileSink } from '@yukemuri/plugin-logging';

// Create logger instance
const logger = createLogger({
  minLevel: 'info',
  sinks: [new MemoryFileSink()],
  console: true
});

logger.info('Application started');
logger.error('Error occurred', new Error('Something failed'));

// Or use Hono middleware
app.use(createLoggingMiddleware({ minLevel: 'debug' }));
```

**Use Cases:**
- Application monitoring
- Error tracking with stack traces
- Request/response logging
- Audit logging
- Debugging

**Documentation:** See [packages/plugins/logging/README.md](./logging/README.md)

---

### Planned Plugins

The following plugins are planned for implementation in future releases.

---

#### 1. Cache Plugin (@yukemuri/plugin-cache) 📋

In-memory and Redis-based caching.

**Planned Features:**
- In-memory cache (development)
- Redis support (production)
- TTL (Time-To-Live) management
- Cache invalidation strategies
- Stampede prevention
- Cache statistics and monitoring
- Key expiration
- Manual and automatic cache clearing
- Cache warming
- Distributed cache support

**Use Cases:**
- Database query caching
- API response caching
- Session storage
- Rate limit counters
- Performance optimization

---

#### 2. Analytics Plugin (@yukemuri/plugin-analytics) 📋

Event tracking and analytics integration.

**Planned Features:**
- Google Analytics integration
- Plausible Analytics support
- Custom event tracking
- User segmentation
- Funnel analysis
- A/B testing support
- Dashboard generation
- Real-time analytics
- Export data functionality
- Privacy-focused tracking options

**Use Cases:**
- User behavior tracking
- Conversion tracking
- Performance monitoring
- Feature usage analysis
- Business intelligence

---

#### 3. Payments Plugin (@yukemuri/plugin-payments) 📋

Payment processing with multiple providers.

**Planned Features:**
- Stripe integration
- PayPal integration
- Payment intent creation
- Payment method management
- Invoice generation
- Subscription management
- Refund handling
- Webhook processing
- Payment status tracking
- Multi-currency support
- Tax calculation

**Use Cases:**
- SaaS billing
- E-commerce payments
- Subscription management
- Invoice generation
- Payment tracking

---

## Plugin Development Guide

### Creating a Custom Plugin

```typescript
import { createPlugin } from '@yukemuri/core';

export const myPlugin = createPlugin({
  name: '@myorg/plugin-myname',
  version: '1.0.0',
  description: 'My custom plugin',
  author: 'Your Name',
  license: 'MIT',

  // Configuration schema
  configSchema: {
    apiKey: {
      type: 'string',
      required: true,
      description: 'API key for the service'
    },
    timeout: {
      type: 'number',
      required: false,
      default: 5000,
      description: 'Request timeout in ms'
    }
  },

  // Default configuration
  defaultConfig: {
    timeout: 5000
  },

  // Initialization hook
  async init(context) {
    context.logger.info('Plugin initialized');
    
    // Setup resources
    // Register routes
    // Initialize utilities
  },

  // Routes provided by the plugin
  routes: [
    {
      path: '/api/myroute',
      method: 'GET',
      handler: async (c) => c.json({ message: 'Hello' })
    }
  ],

  // Middleware provided by the plugin
  middleware: [
    {
      path: '/api/*',
      middleware: async (c, next) => {
        // Add custom logic
        return await next();
      }
    }
  ],

  // Cleanup hook
  async teardown(context) {
    context.logger.info('Plugin cleaned up');
    // Clean up resources
  }
});

export default myPlugin;
```

### Plugin Structure

```
plugin-myname/
├── src/
│   ├── index.ts           # Main plugin definition
│   ├── manager.ts         # Plugin logic
│   ├── types.ts           # TypeScript interfaces
│   ├── utils.ts           # Utility functions
│   ├── hooks/             # React hooks
│   ├── components/        # UI components
│   └── middleware/        # Express-like middleware
├── package.json           # Plugin metadata
├── tsconfig.json          # TypeScript config
├── README.md              # Documentation
└── LICENSE                # License
```

### Plugin Configuration Schema

```typescript
// Define configuration options
const configSchema = {
  // String field
  apiKey: {
    type: 'string',
    required: true,
    description: 'Your API key'
  },

  // Number field with constraints
  timeout: {
    type: 'number',
    required: false,
    default: 5000,
    minimum: 100,
    maximum: 30000
  },

  // Boolean field
  enableFeature: {
    type: 'boolean',
    required: false,
    default: true
  },

  // Array field
  whitelist: {
    type: 'array',
    required: false,
    items: { type: 'string' },
    default: []
  },

  // Object field
  options: {
    type: 'object',
    required: false,
    default: {}
  }
};
```

### Plugin Lifecycle

Plugins have the following lifecycle:

1. **Registration** - Plugin is registered with the app
2. **Configuration** - Plugin configuration is validated and merged
3. **Initialization** (`init` hook) - Plugin is initialized with context
4. **Runtime** - Plugin provides routes, middleware, and utilities
5. **Cleanup** (`teardown` hook) - Plugin cleans up resources on app shutdown

### Best Practices

1. **Use TypeScript** - Always use TypeScript for type safety
2. **Validate Input** - Always validate configuration and user input
3. **Error Handling** - Implement proper error handling with try-catch
4. **Logging** - Use the provided logger for debugging
5. **Documentation** - Document all public APIs with JSDoc
6. **Tests** - Include unit tests for your plugin
7. **Examples** - Provide examples in README and source code
8. **Versioning** - Follow semantic versioning
9. **Dependencies** - Keep dependencies minimal and documented
10. **Cleanup** - Implement proper resource cleanup in teardown

### Testing a Plugin

```typescript
import { createApp } from '@yukemuri/core';
import myPlugin from './index';

// Create a test app
const app = createApp({ name: 'Test' });

// Register the plugin
await app.use(myPlugin, {
  apiKey: 'test-key'
});

// Test the plugin
const response = await app.request(new Request('http://localhost/api/myroute'));
const data = await response.json();
console.log(data); // { message: 'Hello' }
```

### Publishing a Plugin

1. Create a GitHub repository with the plugin code
2. Update `package.json` with:
   - Correct name (e.g., `@yukemuri/plugin-myname`)
   - Description, keywords, license
   - Links to repository and homepage
3. Add authentication guide to README
4. Publish to npm:
   ```bash
   npm publish --access public
   ```
5. Submit to Yukemuri plugin registry (if available)
6. Add to official plugins list in documentation

### Plugin Performance Considerations

- **Lazy load** - Load heavy dependencies only when needed
- **Cache** - Cache computed results when possible
- **Async** - Use async/await for I/O operations
- **Memory** - Be mindful of memory usage
- **Cleanup** - Always clean up timers and subscriptions

## Contributing

We welcome community contributions! To contribute a plugin:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-plugin`)
3. Implement your plugin following best practices
4. Write tests and documentation
5. Submit a pull request

## Support

For issues or questions about plugins:

- Check the [Yukemuri documentation](../core/README.md)
- Open an issue on GitHub
- Check existing plugin READMEs for examples

## License

All official Yukemuri plugins are released under the MIT License.
