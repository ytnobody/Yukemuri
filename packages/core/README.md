# @yukemuri/core

Core framework for building edge-first PWAs with file-based routing and plugin system.

## Overview

Yukemuri is a lightweight, type-safe web framework built on Hono and Preact. It provides:

- **Edge-first Architecture**: Optimized for Cloudflare Workers and edge computing
- **File-based Routing**: Automatic route generation from file structure
- **PWA Support**: Built-in Service Worker and offline capabilities
- **Plugin System**: Extensible architecture for adding features
- **Type Safety**: Full TypeScript support with strict mode enabled
- **Performance**: Minimal runtime overhead with optimized bundling

## Installation

```bash
npm install @yukemuri/core
# or
pnpm add @yukemuri/core
```

## Quick Start

### 1. Create Application

```typescript
import { createApp } from '@yukemuri/core';

const app = createApp({
  name: 'My App',
  version: '1.0.0',
  port: 3000
});

app.listen(3000);
```

### 2. Register Plugins

```typescript
import authPlugin from '@yukemuri/plugin-auth';

await app.use(authPlugin, {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiry: '7d'
});
```

### 3. Define Routes

```typescript
app.route({
  path: '/api/users',
  method: 'GET',
  handler: async (c) => {
    return c.json({ users: [] });
  }
});
```

## Plugin System

### Available Plugins

#### Authentication Plugin (@yukemuri/plugin-auth)

Full-featured authentication system with JWT and password hashing.

**Key Features:**
- User registration and login
- JWT token management
- Password hashing with PBKDF2
- Route protection middleware
- React hooks and UI components

**Setup:**
```typescript
import authPlugin from '@yukemuri/plugin-auth';

await app.use(authPlugin, {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: '7d',
  protectedRoutes: ['/api/protected/*']
});
```

**Usage:**
```typescript
// Client-side
import { useAuth, LoginForm, AuthGuard } from '@yukemuri/plugin-auth';

function Login() {
  const { login, isLoading, error } = useAuth();
  return <LoginForm onSubmit={login} isLoading={isLoading} error={error} />;
}
```

See [@yukemuri/plugin-auth README](../auth/README.md) for detailed documentation.

#### Database Plugin (@yukemuri/plugin-database)

SQLite and Turso database integration with type-safe queries.

**Key Features:**
- SQLite/Turso database support
- Type-safe query operations
- Transaction support
- Migration management
- CRUD operations with automatic casting

**Setup:**
```typescript
import { databasePlugin } from '@yukemuri/plugin-database';

await app.use(databasePlugin, {
  url: 'file:./app.db',
  authToken: process.env.DATABASE_TOKEN
});
```

See [@yukemuri/plugin-database README](../database/README.md) for detailed documentation.

#### Email Plugin (@yukemuri/plugin-email)

Email sending with multiple transport options and template support.

**Key Features:**
- Multi-provider support (SMTP, SendGrid, Mailgun)
- Email template engine with variables
- Rate limiting and queue management
- Email validation and formatting
- Built-in templates (welcome, password_reset, email_verification)

**Setup:**
```typescript
import emailPlugin from '@yukemuri/plugin-email';

await app.use(emailPlugin, {
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

**Usage:**
```typescript
// Send email
const result = await app.email.send({
  to: { email: 'user@example.com' },
  subject: 'Welcome to Yukemuri',
  html: '<h1>Welcome!</h1>'
});

// Send with template
const result = await app.email.sendWithTemplate({
  to: { email: 'user@example.com' },
  template: 'welcome',
  variables: { name: 'John' }
});
```

See [@yukemuri/plugin-email README](../email/README.md) for detailed documentation.

### Creating Custom Plugins

```typescript
import { createPlugin, createConfigSchema } from '@yukemuri/core';

const configSchema = createConfigSchema({
  apiKey: { type: 'string', required: true },
  timeout: { type: 'number', default: 5000 }
}, ['apiKey']);

const myPlugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom plugin',
  configSchema,
  defaultConfig: {
    timeout: 5000
  },
  init: async (context) => {
    console.log('Plugin initialized');
  },
  routes: [
    {
      path: '/api/custom',
      method: 'GET',
      handler: async (c) => {
        return c.json({ message: 'Hello from custom plugin' });
      }
    }
  ],
  middleware: [
    {
      path: '/api/*',
      middleware: async (c, next) => {
        console.log(`Request to ${c.req.path}`);
        return next();
      }
    }
  ],
  clientExtensions: {
    hooks: [
      {
        name: 'useCustom',
        hook: () => import('./hooks/useCustom')
      }
    ],
    components: [
      {
        name: 'CustomComponent',
        component: () => import('./components/CustomComponent')
      }
    ]
  }
});

export default myPlugin;
```

### Plugin Lifecycle

1. **Registration** (`app.use(plugin, config)`):
   - Plugin is registered with configuration
   - Configuration is validated against schema

2. **Initialization** (`plugin.init(context)`):
   - Plugin initialization logic runs
   - Access to logger, utils, and dependencies

3. **Route Registration**:
   - All plugin routes are registered
   - Routes are added to the application

4. **Middleware Registration**:
   - Middleware is mounted at specified paths
   - Middleware runs before route handlers

5. **Client Extensions**:
   - Hooks, components, and utilities are exported
   - Available to client-side code

## Configuration

### Application Config

```typescript
interface YukemuriConfig {
  name: string;
  version: string;
  environment: 'development' | 'production';
  debug: boolean;
  port: number;
  host: string;
}
```

### Default Configuration

```typescript
{
  name: 'Yukemuri App',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',
  port: 3000,
  host: 'localhost'
}
```

### Merging Configuration

```typescript
const app = createApp({
  debug: true,
  port: 4000
});
// Merges with defaults
```

## Core APIs

### Storage Management with StorageManager

StorageManager provides a unified API for managing state across three storage levels.

#### Overview

StorageManager offers three storage options optimized for different use cases:

| Storage | Scope | Persistence | Capacity | Speed | Use Case |
|---------|-------|-------------|----------|-------|----------|
| **local** | Browser wide | Session | 5-10MB | ⚡⚡⚡ | User preferences, theme, UI state |
| **session** | Current tab | Tab lifetime | 5-10MB | ⚡⚡ | Temporary form data, filters, pagination |
| **persistent** | Browser wide | User deletion | 50MB+ | ⚡ | User data, cache, important settings |

#### Quick Start

```typescript
import { Yukemuri } from '@yukemuri/core';

const yu = new Yukemuri();

// Local storage - survives browser restarts
const username = yu.storage.local('username', 'Guest');
username.set('John Doe');
console.log(username.get()); // 'John Doe'

// Session storage - cleared when tab closes
const tempData = yu.storage.session('temp', { page: 1 });
tempData.set(prev => ({ page: prev.page + 1 }));

// Persistent storage (IndexedDB) - survives indefinitely
const userData = yu.storage.persistent('user', { id: '', name: '' });
userData.set({ id: '123', name: 'John' });
```

#### Common API (All Storage Types)

```typescript
// Get current value
const value = storage.get();

// Set value directly or with function
storage.set(newValue);
storage.set(prev => ({ ...prev, field: newValue }));

// Reset to default
storage.clear();

// Subscribe to changes
const unsubscribe = storage.subscribe((newValue) => {
  console.log('Changed:', newValue);
});

// Cleanup listener
unsubscribe();
```

#### Persistent Storage API

Persistent storage adds additional methods for IndexedDB synchronization:

```typescript
// Manual sync to IndexedDB
await userData.sync();

// Check sync status
if (userData.isSyncing()) {
  console.log('Syncing...');
}

// Get last sync time
const lastSync = userData.lastSynced(); // Date | null
```

#### Sync Strategies (Persistent Only)

**Immediate (Default)** - Syncs to IndexedDB immediately after each change.
```typescript
const data = yu.storage.persistent('config', {}, {
  syncStrategy: 'immediate'
});
data.set({ theme: 'dark' }); // Syncs immediately
```

**Batched** - Debounces syncs for 300ms, useful for frequent updates.
```typescript
const logs = yu.storage.persistent('logs', [], {
  syncStrategy: 'batched'
});
logs.set(prev => [...prev, 'event1']);
logs.set(prev => [...prev, 'event2']); // Both sync once after 300ms
```

**Manual** - Requires explicit `sync()` calls.
```typescript
const form = yu.storage.persistent('form', {}, {
  syncStrategy: 'manual'
});
form.set({ field: 'value' });
await form.sync(); // Explicit sync when needed
```

#### Real-World Examples

**User Theme Preference**
```typescript
const theme = yu.storage.local('theme', 'light');

function setTheme(newTheme: 'light' | 'dark') {
  theme.set(newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
}

// Listen to changes from other tabs
theme.subscribe((newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme);
});
```

**Shopping Cart with Batched Sync**
```typescript
interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const cart = yu.storage.persistent('cart', [] as CartItem[], {
  syncStrategy: 'batched'
});

function addToCart(item: CartItem) {
  cart.set(prev => {
    const existing = prev.find(i => i.id === item.id);
    if (existing) {
      return prev.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    }
    return [...prev, item];
  });
}

function getTotal() {
  return cart.get().reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

**Form State with Manual Sync**
```typescript
interface FormState {
  title: string;
  content: string;
  lastSaved: Date | null;
}

const form = yu.storage.persistent('form', 
  { title: '', content: '', lastSaved: null },
  { syncStrategy: 'manual' }
);

async function saveForm() {
  await form.sync();
  form.set(prev => ({ ...prev, lastSaved: new Date() }));
}
```

#### Best Practices

1. **Choose Appropriate Storage Level**
   - `local` - UI state, user preferences
   - `session` - temporary form data, filters
   - `persistent` - user data, important settings

2. **Select Right Sync Strategy**
   - `immediate` - important data, infrequent updates
   - `batched` - form inputs, rapid updates
   - `manual` - critical operations, user control

3. **Type Safety**
   ```typescript
   interface UserData {
     id: string;
     email: string;
     role: 'user' | 'admin';
   }
   
   const user = yu.storage.persistent<UserData>('user', {
     id: '',
     email: '',
     role: 'user'
   });
   ```

4. **Memory Management**
   ```typescript
   const unsubscribe = data.subscribe(listener);
   
   // Clean up when component unmounts
   onDestroy(() => unsubscribe());
   ```

5. **Error Handling**
   ```typescript
   try {
     data.set(newValue);
     await data.sync();
   } catch (error) {
     console.error('Storage error:', error);
   }
   ```

#### Browser Support

All storage options are supported in modern browsers:
- localStorage/sessionStorage: Chrome, Firefox, Safari, Edge ✅
- IndexedDB: Chrome, Firefox, Safari, Edge ✅

#### Limitations

- Local/Session Storage: Limited to ~5-10MB per domain
- IndexedDB: May require user permission for large storage
- Cross-Origin: Storage is isolated per origin
- Private Browsing: May have limited or no storage

---

### Network Management with NetworkManager

NetworkManager provides network status monitoring and offline request queue management for PWA applications.

#### Overview

NetworkManager offers two key features:
1. **Network Status Monitoring** - Real-time connection and network information
2. **Offline Sync** - Automatic request queueing and syncing when back online

#### Network Status API

```typescript
import { Yukemuri } from '@yukemuri/core';

const yu = new Yukemuri();

// Get current network status
const status = yu.network.status;
console.log(status.isOnline);      // boolean
console.log(status.isOffline);     // boolean
console.log(status.connectionType); // 'wifi' | 'cellular' | 'ethernet' | etc
console.log(status.effectiveType);  // '4g' | '3g' | '2g' | 'slow-2g'
console.log(status.downlink);       // Mbps
console.log(status.rtt);            // Round trip time in ms
console.log(status.saveData);       // User's data saver preference

// Listen to network status changes
const unsubscribe = yu.network.onStatusChange((status) => {
  if (status.isOffline) {
    console.log('⚠️ Connection lost, requests will be queued');
  } else {
    console.log('✅ Back online, syncing queued requests...');
  }
});

// Stop listening
unsubscribe();
```

#### Offline Sync API

Queue requests automatically when offline and sync when back online:

```typescript
const yu = new Yukemuri();

// Queue a request while offline
const requestId = await yu.network.offlineSync.queueRequest({
  url: '/api/users',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: { name: 'John', email: 'john@example.com' },
  priority: 'high',
  maxRetries: 3
});

// Get pending requests
const pending = yu.network.offlineSync.getPendingRequests();
console.log(`Pending requests: ${pending.length}`);
console.log(`Sync in progress: ${yu.network.offlineSync.issyncing}`);
console.log(`Total pending: ${yu.network.offlineSync.pendingCount}`);

// Manually trigger sync
const results = await yu.network.offlineSync.syncWhenOnline();
results.forEach(result => {
  if (result.success) {
    console.log(`✅ Request ${result.id} succeeded`);
  } else {
    console.error(`❌ Request ${result.id} failed:`, result.error);
  }
});

// Retry failed requests
const retryResults = await yu.network.offlineSync.retryFailedRequests();
console.log(`Retried ${retryResults.length} requests`);

// Clear all queued requests
await yu.network.offlineSync.clearQueue();
```

#### Request Priority

Requests are synced in priority order: `high` → `normal` → `low`

```typescript
// High priority - synced first
await yu.network.offlineSync.queueRequest({
  url: '/api/critical-data',
  method: 'POST',
  priority: 'high'
});

// Normal priority - synced second (default)
await yu.network.offlineSync.queueRequest({
  url: '/api/user-data',
  method: 'POST'
  // priority defaults to 'normal'
});

// Low priority - synced last
await yu.network.offlineSync.queueRequest({
  url: '/api/analytics',
  method: 'POST',
  priority: 'low'
});
```

#### Retry Management

Failed requests are automatically retried up to `maxRetries` times:

```typescript
const requestId = await yu.network.offlineSync.queueRequest({
  url: '/api/data',
  method: 'POST',
  maxRetries: 5  // Default is 3
});

// Manually retry failed requests
const retryResults = await yu.network.offlineSync.retryFailedRequests();
```

#### Real-World Examples

**Auto-save Form with Offline Support**
```typescript
const yu = new Yukemuri();

async function saveForm(formData: any) {
  if (yu.network.status.isOffline) {
    // Queue for later
    await yu.network.offlineSync.queueRequest({
      url: '/api/form-data',
      method: 'POST',
      body: formData,
      priority: 'high'
    });
    console.log('Form queued, will sync when online');
  } else {
    // Send immediately
    const response = await fetch('/api/form-data', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    if (!response.ok) throw new Error('Save failed');
  }
}

// Listen for connectivity
yu.network.onStatusChange((status) => {
  if (status.isOnline && yu.network.offlineSync.pendingCount > 0) {
    console.log('🔄 Syncing queued requests...');
    yu.network.offlineSync.syncWhenOnline();
  }
});
```

**Adaptive API Calls Based on Connection**
```typescript
const yu = new Yukemuri();

async function fetchData(url: string) {
  const status = yu.network.status;

  // High quality on fast connections
  if (status.effectiveType === '4g') {
    return fetch(`${url}?quality=high`);
  }

  // Medium quality on 3G
  if (status.effectiveType === '3g') {
    return fetch(`${url}?quality=medium`);
  }

  // Low quality on slow connections
  return fetch(`${url}?quality=low`);
}
```

**Data Saver Mode Support**
```typescript
const yu = new Yukemuri();

async function fetchImages() {
  const status = yu.network.status;

  if (status.saveData) {
    // Skip image loading when user has data saver enabled
    console.log('Data saver enabled, skipping image requests');
    return null;
  }

  return fetch('/api/images');
}
```

#### Best Practices

1. **Queue Requests Strategically**
   - Queue high-priority operations when offline
   - For UI feedback, show request is queued
   - Log important operations

2. **Handle Sync Errors**
   ```typescript
   const results = await yu.network.offlineSync.syncWhenOnline();
   results.forEach(result => {
     if (!result.success) {
       // Handle failed request
       console.error(`Request failed: ${result.error.message}`);
     }
   });
   ```

3. **Respect User's Data Saver Preference**
   ```typescript
   if (!yu.network.status.saveData) {
     // Load additional resources
   }
   ```

4. **Provide User Feedback**
   ```typescript
   const unsubscribe = yu.network.onStatusChange((status) => {
     const message = status.isOnline ? '✅ Online' : '⚠️ Offline';
     updateConnectionIndicator(message);
   });
   ```

5. **Clean Up Listeners**
   ```typescript
   const unsubscribe = yu.network.onStatusChange(handler);
   // Later...
   unsubscribe(); // Stop listening
   ```

#### Limitations

- **Offline Queue**: Persists in memory only (not stored to disk)
- **Max Request Size**: Limited by fetch API and server
- **Connection Detection**: Browser-dependent, may have slight delays
- **Service Worker**: Requires Service Worker for truly offline operation

---

### createApp(config?: YukemuriConfig)

Creates a Yukemuri application instance.

```typescript
const app = createApp({
  name: 'My App',
  port: 3000
});
```

### app.use(plugin, config?)

Registers a plugin with the application.

```typescript
await app.use(authPlugin, { jwtSecret: 'secret' });
```

### app.route(routeConfig)

Registers a single route.

```typescript
app.route({
  path: '/api/hello',
  method: 'GET',
  handler: (c) => c.json({ message: 'Hello' })
});
```

### app.middleware(middlewareConfig)

Registers middleware.

```typescript
app.middleware({
  path: '/api/*',
  middleware: async (c, next) => {
    // middleware logic
    return next();
  }
});
```

### app.listen(port)

Starts the application server.

```typescript
await app.listen(3000);
console.log('Server running on port 3000');
```

## File-based Routing

Yukemuri supports automatic route generation from file structure.

```
routes/
├── index.tsx        → GET /
├── about.tsx        → GET /about
├── users/
│   ├── index.tsx    → GET /users
│   └── [id].tsx     → GET /users/:id
└── api/
    └── posts.ts     → GET /api/posts
```

## Error Handling

### Type-safe Error Handling

```typescript
try {
  // operation
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return c.json({ error: message }, 500);
}
```

### Middleware Error Handling

```typescript
app.middleware({
  path: '/api/*',
  middleware: async (c, next) => {
    try {
      return await next();
    } catch (error) {
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  }
});
```

## TypeScript

All code is written with TypeScript strict mode enabled.

### Type Definitions

Core types are exported for use in plugins:

```typescript
import type { 
  YukemuriConfig, 
  YukemuriApp, 
  YukemuriPlugin,
  RouteConfig,
  MiddlewareConfig
} from '@yukemuri/core';
```

## Deployment

### Cloudflare Workers

```bash
npm run build
npm run deploy
```

### Node.js

```bash
npm run dev         # Development
npm run build       # Production build
npm start           # Start server
```

## Examples

### Complete Auth Flow

```typescript
import { createApp } from '@yukemuri/core';
import authPlugin from '@yukemuri/plugin-auth';

const app = createApp({ name: 'Auth Demo' });

// Register auth plugin
await app.use(authPlugin, {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: '7d',
  protectedRoutes: ['/api/protected/*']
});

// Protected route
app.route({
  path: '/api/protected/data',
  method: 'GET',
  handler: (c) => {
    const user = c.get('user');
    return c.json({ data: `Hello ${user.email}!` });
  }
});

await app.listen(3000);
```

### Custom Plugin

```typescript
import { createPlugin, createConfigSchema } from '@yukemuri/core';

const loggingPlugin = createPlugin({
  name: 'logging',
  version: '1.0.0',
  configSchema: createConfigSchema({ level: { type: 'string' } }),
  init: async (context) => {
    context.logger.info('Logging plugin initialized');
  },
  middleware: [
    {
      path: '/*',
      middleware: async (c, next) => {
        const start = Date.now();
        const response = await next();
        const duration = Date.now() - start;
        console.log(`${c.req.method} ${c.req.path} - ${duration}ms`);
        return response;
      }
    }
  ]
});

export default loggingPlugin;
```

## Best Practices

1. **Always use type-safe code**: Enable TypeScript strict mode
2. **Handle errors properly**: Use try-catch and check error types
3. **Validate input**: Use schema validation for configuration
4. **Use plugins for features**: Keep core code minimal
5. **Document your code**: Add JSDoc comments to public APIs
6. **Test thoroughly**: Write comprehensive tests for plugins

## See Also

- [Plugins Documentation](../plugins/auth/README.md)
- [CLI Documentation](../cli/README.md)
- [API Reference](./YUKEMURI_API.md)
