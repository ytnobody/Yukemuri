# Yukemuri ♨️

A modern PWA framework for edge computing that delivers a soothing development experience like hot spring steam.

## Overview

Yukemuri is a meta-framework designed to dramatically improve development speed for small to medium-scale service providers and individual developers. Like the gentle steam (yukemuri) from hot springs, it provides a warm and comfortable development experience.

## Features

- **🚀 Edge-First**: Built for Cloudflare Workers and edge computing
- **🔒 Type-Safe**: TypeScript + Hono framework foundation
- **📱 PWA Ready**: Built-in Service Worker, offline support, and installable apps
- **⚛️ Modern UI**: Preact + UnoCSS for fast, reactive interfaces
- **🎨 Zero Config**: Start developing immediately with sensible defaults
- **🔧 Plugin System**: Extensible architecture for adding features

## Quick Start

```bash
# Create a new project
npx create-yukemuri my-app
cd my-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Your PWA will be available at `http://localhost:5173` with:
- ✅ Service Worker registration
- ✅ Web App Manifest
- ✅ Offline capability
- ✅ Install prompts
- ✅ Push notifications support

## Project Structure

```
my-app/
├── app/
│   ├── client.ts          # Client-side entry point
│   ├── server.ts          # Server-side Hono app
│   ├── routes/            # React components
│   └── utils/             # PWA utilities
├── public/
│   ├── manifest.json      # Web App Manifest
│   ├── sw.js              # Service Worker
│   └── icons/             # App icons
└── vite.config.ts         # Vite configuration
```

## Package Structure

- **`packages/core`** - Core framework with plugin system
  - Application factory and lifecycle
  - Plugin manager and utilities
  - Type definitions and configuration
  - StorageManager for state management (local, session, persistent)
  - [Documentation](./packages/core/README.md)

- **`packages/cli`** - Command-line interface
  - Project scaffolding commands
  - Development server management
  - Plugin installation and management
  - [Documentation](./packages/cli/README.md)

- **`packages/create-yukemuri`** - Project template scaffolding
  - Base template with PWA setup
  - Vite + Preact configuration
  - VAPID key generation for Web Push
  - [Documentation](./packages/create-yukemuri/README.md)

- **`packages/plugins/auth`** - Authentication plugin ✅
  - JWT token management
  - Password hashing with PBKDF2
  - User management system
  - React hooks and UI components
  - [Documentation](./packages/plugins/auth/README.md)

- **`packages/plugins/database`** - Database plugin ✅
  - SQLite/Turso database support
  - Type-safe query operations
  - Transaction support
  - Migration management
  - [Documentation](./packages/plugins/database/README.md)

- **`packages/plugins/email`** - Email plugin ✅
  - Email sending via SMTP, SendGrid, or Mailgun
  - Email template engine with variable substitution
  - Rate limiting and queue management
  - Email validation and formatting utilities
  - [Documentation](./packages/plugins/email/README.md)

## Planned Plugins

The following plugins are planned for future releases:

| Plugin | Status | Features |
|--------|--------|----------|
| **Email** | ✅ Implemented | Email sending via SendGrid/Mailgun/SMTP, template support, rate limiting, queue management |
| **Rate Limiting** | 🔄 Planned | Token bucket & sliding window algorithms, per-user/IP rate limits, quota management |
| **Logging** | 🔄 Planned | Structured logging, multi-sink support (file, stdout, external services), log levels |
| **Cache** | 🔄 Planned | Redis/In-Memory caching, TTL management, cache invalidation, stampede prevention |
| **Analytics** | 🔄 Planned | Event tracking, Google Analytics/Plausible integration, custom dashboards |
| **Payments** | 🔄 Planned | Stripe/PayPal integration, payment flows, invoice management, webhook handling |

## Usage Examples

### State Management with StorageManager

Yukemuri provides a powerful storage system with three levels: `local`, `session`, and `persistent`.

#### Local Storage (Browser Session)

```typescript
import { Yukemuri } from '@yukemuri/core';

const yu = new Yukemuri();

// Basic usage
const username = yu.storage.local('username', 'Guest');
username.set('John Doe');
console.log(username.get()); // 'John Doe'

// Functional updates
const counter = yu.storage.local('counter', 0);
counter.set(prev => prev + 1);

// Subscribe to changes
const unsubscribe = username.subscribe((newValue) => {
  console.log('Username changed to:', newValue);
});

// Clean up listener
unsubscribe();
```

#### Session Storage (Browser Tab)

```typescript
const yu = new Yukemuri();

// Store temporary data per tab
const tempData = yu.storage.session('temp', { page: 1, filter: '' });

tempData.set(prev => ({ 
  ...prev, 
  page: prev.page + 1 
}));
```

#### Persistent Storage (IndexedDB)

```typescript
const yu = new Yukemuri();

// Immediate sync (default)
const userData = yu.storage.persistent('user', 
  { id: '', name: '', theme: 'light' },
  { syncStrategy: 'immediate' }
);

userData.set({ id: '123', name: 'John', theme: 'dark' });
console.log(userData.isSyncing()); // false (after sync completes)
console.log(userData.lastSynced()); // Date object

// Batched sync (debounced by 300ms)
const logs = yu.storage.persistent('logs', 
  [] as string[],
  { syncStrategy: 'batched' }
);

logs.set(prev => [...prev, 'Event 1']);
logs.set(prev => [...prev, 'Event 2']); // Will sync once after 300ms

// Manual sync
const config = yu.storage.persistent('config',
  { notifications: true },
  { syncStrategy: 'manual' }
);

config.set({ notifications: false });
await config.sync(); // Explicitly sync when needed
```

#### Custom Serializers

```typescript
const yu = new Yukemuri();

const customSerializer = {
  stringify: (value: any) => JSON.stringify(value),
  parse: (str: string) => JSON.parse(str),
};

const data = yu.storage.persistent('custom', 
  { value: 0 },
  { serializer: customSerializer }
);
```

### Network Management with Offline Support

Manage network status and automatically queue requests when offline:

```typescript
import { Yukemuri } from '@yukemuri/core';

const yu = new Yukemuri();

// Monitor network status
yu.network.onStatusChange((status) => {
  if (status.isOffline) {
    console.log('📡 You are offline');
  } else {
    console.log('✅ Back online');
  }
});

// Queue requests while offline
const requestId = await yu.network.offlineSync.queueRequest({
  url: '/api/users',
  method: 'POST',
  body: { name: 'John' },
  priority: 'high'
});

// Check pending requests
console.log(`Pending: ${yu.network.offlineSync.pendingCount}`);

// Sync automatically when back online, or manually trigger:
const results = await yu.network.offlineSync.syncWhenOnline();
results.forEach(result => {
  if (result.success) {
    console.log(`✅ Request succeeded`);
  } else {
    console.log(`❌ Request failed: ${result.error.message}`);
  }
});

// Retry failed requests
await yu.network.offlineSync.retryFailedRequests();
```

### Client-Side Routing

Handle navigation and URL parameters in your SPA:

```typescript
import { Yukemuri } from '@yukemuri/core';

const yu = new Yukemuri();

// Register route patterns
yu.router.registerRoute('/users/:id');
yu.router.registerRoute('/blog/*slug');

// Navigate programmatically
yu.router.push('/users/123');

// Extract URL parameters
const { id } = yu.router.getParams();  // { id: '123' }

// Parse query parameters
const query = yu.router.getQuery();
const tab = query.get('tab');

// Check active route
if (yu.router.isActive('/users', false)) {
  console.log('On users page');
}

// Listen for navigation
yu.router.onNavigate((path) => {
  console.log('Navigated to:', path);
  updateUI(path);
});
```

### Creating an App with Authentication

```bash
# Create project
npx create-yukemuri my-secure-app
cd my-secure-app

# Install auth plugin
npm install @yukemuri/plugin-auth
```

Then in your server setup:

```typescript
import { createApp } from '@yukemuri/core';
import authPlugin from '@yukemuri/plugin-auth';

const app = createApp();

await app.use(authPlugin, {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: '7d',
  protectedRoutes: ['/api/protected/*']
});
```

And in your client:

```typescript
import { useAuth, LoginForm } from '@yukemuri/plugin-auth';

function LoginPage() {
  const { login, isLoading, error } = useAuth();
  return <LoginForm onSubmit={login} isLoading={isLoading} error={error} />;
}
```

## Development

This is a monorepo managed with pnpm:

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development servers
pnpm dev

# Link CLI globally for testing
pnpm --filter @yukemuri/cli link --global
```

### Code Quality

This project uses **Biome** for automated code linting and formatting with Git hooks integration:

```bash
# Format all files
pnpm run format

# Lint and fix issues
pnpm run lint
```

**Git Hooks**: Pre-commit hooks automatically format and lint staged files before each commit. See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed setup instructions.

## Technology Stack

- **Runtime**: Cloudflare Workers / Node.js
- **Framework**: Hono (lightweight web framework)
- **Frontend**: Preact (React-compatible, smaller bundle)
- **Styling**: UnoCSS (instant atomic CSS)
- **Build Tool**: Vite (fast build and HMR)
- **PWA**: Service Worker + Web App Manifest

## Roadmap

- [x] Project scaffolding with `create-yukemuri`
- [x] Basic PWA template with Service Worker
- [x] Development server setup
- [x] Core framework implementation with plugin system
- [x] Authentication plugin with JWT and password hashing
- [x] Database plugin with SQLite/Turso support
- [x] Email plugin with multiple transport options (SMTP, SendGrid, Mailgun)
- [x] Type-safe error handling and validation
- [x] StorageManager with local, session, and persistent storage
- [ ] Rate limiting plugin with configurable strategies
- [ ] Logging plugin with structured output
- [ ] Cache plugin with Redis support
- [ ] Analytics plugin with event tracking
- [ ] Payments plugin with Stripe/PayPal integration
- [ ] Admin dashboard template
- [ ] Deployment helpers for major platforms

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## License

MIT License - see [LICENSE](LICENSE) for details.