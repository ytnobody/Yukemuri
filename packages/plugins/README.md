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

### Planned Plugins

The following plugins are planned for implementation in future releases.

#### 1. Email Plugin (@yukemuri/plugin-email) 📋

Email sending with multiple transport options.

**Planned Features:**
- Support for SendGrid, Mailgun, and SMTP
- Email template system with variables
- Delivery tracking and open/click analytics
- Rate limiting for email sends
- Batch email operations
- HTML and plain text support
- Attachment support
- Email validation and sanitization
- Bounce and complaint handling

**Use Cases:**
- User notifications
- Transactional emails
- Newsletter delivery
- Password reset emails
- Account verification

---

#### 2. Rate Limiting Plugin (@yukemuri/plugin-rate-limit) 📋

API rate limiting and quota management.

**Planned Features:**
- Token bucket algorithm
- Sliding window algorithm
- Per-user rate limiting
- Per-IP rate limiting
- Per-route rate limiting
- Distributed rate limiting (Redis support)
- Quota management
- Rate limit headers in responses
- Custom rate limit strategies
- Whitelist/blacklist support

**Use Cases:**
- API protection
- DDoS prevention
- Resource usage control
- Fair access policies
- Premium tier enforcement

---

#### 3. Logging Plugin (@yukemuri/plugin-logging) 📋

Structured logging with multiple outputs.

**Planned Features:**
- Pino/Winston integration
- Multiple log levels (debug, info, warn, error)
- Structured logging format
- File-based logging
- Console logging with colors
- External service integration (e.g., Datadog, Sentry)
- Performance monitoring
- Request/response logging
- Custom log formatters
- Log rotation

**Use Cases:**
- Application monitoring
- Error tracking
- Performance analysis
- Audit logging
- Debugging

---

#### 4. Cache Plugin (@yukemuri/plugin-cache) 📋

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

#### 5. Analytics Plugin (@yukemuri/plugin-analytics) 📋

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

#### 6. Payments Plugin (@yukemuri/plugin-payments) 📋

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
