# @yukemuri/create-yukemuri

Project scaffolding tool for creating new Yukemuri applications with templates.

## Usage

```bash
# Using npx (recommended)
npx @yukemuri/create-yukemuri my-awesome-app

# Or with npm
npm init @yukemuri/create-yukemuri my-awesome-app

# Or with pnpm
pnpm create @yukemuri/create-yukemuri my-awesome-app

# Interactive mode (if no app name provided)
npx @yukemuri/create-yukemuri
```

## Features

### Automatic Project Customization

When you create a new project, the tool automatically customizes:

- **package.json**: Project name and description
- **README.md**: Branded with your project name
- **manifest.json**: PWA manifest with your app name
- **Biome configuration**: Ready for code quality checks
- **Git hooks**: Auto-enabled for format/lint on commit

### Example

```bash
$ npx @yukemuri/create-yukemuri my-blog-app
✔ Created project directory
✔ Generated biome.json
✔ Generated icon files
✔ Git hooks configured
✔ Project my-blog-app created successfully! ♨️

Next steps:
  cd my-blog-app
  npm install
  npm run dev
```

After creation, your project files contain:
```
package.json: { "name": "my-blog-app", "description": "A Yukemuri application - my-blog-app" }
README.md: # my-blog-app ♨️
manifest.json: { "name": "My Blog App", "short_name": "My Blog" }
```

## Interactive Setup

The tool will guide you through:

1. **Project Name**: Enter your project name (or provide as argument)
2. **Validation**: Ensures lowercase letters, numbers, hyphens, underscores only
3. **Customization**: Automatically updates all configuration files
4. **Git Hooks**: Pre-commit hooks set up for code quality

## Templates

### Base Template (Recommended)

The default template includes:

**Features:**
- File-based routing with preact-router
- Server-side rendering (SSR)
- Service Worker for PWA
- UnoCSS for styling
- Vite dev server with HMR
- Cloudflare Workers deployment
- TypeScript strict mode
- Build optimization

**What's Included:**
```
app/
├── routes/              # File-based routes
├── api/                 # API handlers
├── components/          # Reusable components
├── pages/               # Page components
├── core/                # PWA, router, service worker
├── lib/                 # Utilities
└── types/               # TypeScript types

scripts/
├── tunnel.js            # ngrok tunnel support
└── cleanup.js           # Build cleanup

public/
├── manifest.json        # PWA manifest
├── sw.js                # Service Worker
└── icons/               # App icons

Configuration:
├── vite.config.ts       # Vite configuration
├── wrangler.toml        # Cloudflare Workers config
├── tsconfig.json        # TypeScript config
├── uno.config.ts        # UnoCSS config
└── package.json
```

**Getting Started:**
```bash
cd my-app
npm run dev
# Server starts on http://localhost:3000
```

## Project Setup

### 1. Generate VAPID Keys for PWA

```bash
npm run generate-vapid
```

Creates public/private key pair for Web Push Notifications.

### 2. Set Environment Variables

Create `.env.local`:

```env
# From generate-vapid command
VITE_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:your-email@example.com

# API configuration
VITE_API_BASE=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 4. Start Development Server

```bash
npm run dev
```

## Adding Plugins

After project creation, add plugins:

```bash
# Add auth plugin
npm install @yukemuri/plugin-auth

# Then register in app/server.ts
```

Example with auth plugin:

```typescript
import { createApp } from '@yukemuri/core';
import authPlugin from '@yukemuri/plugin-auth';

const app = createApp();

await app.use(authPlugin, {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiry: '7d',
  protectedRoutes: ['/api/protected/*']
});

// Your routes and middleware
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run dev:host     # Start on 0.0.0.0 for network access
npm run dev:ssr      # Start with server-side rendering

# Building
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Check TypeScript errors

# Deployment
npm run deploy       # Deploy to Cloudflare Workers
npm run tunnel       # Create ngrok tunnel for sharing

# Utilities
npm run cleanup      # Clean build artifacts
npm run generate-vapid  # Generate VAPID keys for PWA
```

## File-based Routing

Files in `app/routes/` automatically become routes:

```
routes/
├── index.tsx        → GET /
├── about.tsx        → GET /about
├── contact.tsx      → GET /contact
├── users/
│   ├── index.tsx    → GET /users
│   ├── [id].tsx     → GET /users/:id
│   └── settings.tsx → GET /users/settings
└── api/
    ├── posts.ts     → GET /api/posts
    ├── users.ts     → GET /api/users
    └── [resource]/
        └── [id].ts  → GET /api/:resource/:id
```

## Building Pages

### Page Component Template

```typescript
// app/pages/home.tsx
import { h } from 'preact';
import { useState } from 'preact/hooks';

interface HomeProps {}

export default function Home(props: HomeProps) {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>Welcome!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### API Route Template

```typescript
// app/api/posts.ts
import type { Context } from 'hono';

export async function GET(c: Context) {
  return c.json({ posts: [] });
}

export async function POST(c: Context) {
  const body = await c.req.text();
  // Handle POST
  return c.json({ created: true }, 201);
}
```

## Development Workflow

### 1. Create a Page

```typescript
// app/pages/products.tsx
export default function Products() {
  return <h1>Products</h1>;
}
```

Automatically available at `/products`

### 2. Create API Endpoint

```typescript
// app/api/products.ts
export async function GET(c) {
  return c.json({ products: [] });
}
```

Available at `/api/products`

### 3. Add Component

```typescript
// app/components/ProductCard.tsx
export default function ProductCard({ product }) {
  return <div>{product.name}</div>;
}
```

### 4. Use in Page

```typescript
import ProductCard from '../components/ProductCard';

export default function Products() {
  return (
    <div>
      <ProductCard product={{ name: 'Product 1' }} />
    </div>
  );
}
```

## Styling with UnoCSS

UnoCSS provides utility-first CSS similar to Tailwind:

```typescript
// Using utility classes
<div className="p-4 bg-blue-500 text-white rounded">
  Styled with UnoCSS
</div>

// Custom CSS
<div className="custom-class">
  Content
</div>
```

Configure in `uno.config.ts`:

```typescript
import { defineConfig } from 'unocss';
import presetUno from '@unocss/preset-uno';

export default defineConfig({
  presets: [presetUno()],
  shortcuts: {
    'btn': 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600',
    'card': 'p-4 bg-white rounded-lg shadow'
  }
});
```

## PWA Features

### Service Worker

Automatically caches assets for offline support:

```typescript
// Enabled in app/core/service-worker.ts
- Caches HTML, JS, CSS on first load
- Returns cached versions when offline
- Updates cache on new deployments
```

### Web App Manifest

Configured in `public/manifest.json`:

```json
{
  "name": "My Yukemuri App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "icons": [...]
}
```

### Push Notifications

Use with VAPID keys for Web Push:

```typescript
import { Notification } from '@yukemuri/core';

// Request permission
const permission = await Notification.requestPermission();

// Send notification
if (permission === 'granted') {
  new Notification('Hello!', {
    body: 'Welcome to Yukemuri',
    icon: '/icon.png'
  });
}
```

## Deployment

### Cloudflare Workers

```bash
# Login
wrangler login

# Deploy
npm run deploy
```

Configured in `wrangler.toml`:

```toml
name = "my-app"
main = "dist/index.js"
compatibility_date = "2025-01-01"

[[routes]]
pattern = "*.example.com/*"
zone_name = "example.com"
```

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build
docker build -t my-app .

# Run
docker run -p 3000:3000 my-app
```

## Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 4000
```

### Build Errors
```bash
rm -rf .vite dist node_modules package-lock.json
npm install
npm run build
```

### TypeScript Errors
```bash
npm run type-check
npm install -D typescript@latest
```

## Learning Resources

- [Preact Documentation](https://preactjs.com/)
- [Hono Documentation](https://hono.dev/)
- [UnoCSS Documentation](https://unocss.dev/)
- [Vite Documentation](https://vitejs.dev/)

## Support

- [Yukemuri GitHub](https://github.com/ytnobody/Yukemuri)
- [Issue Tracker](https://github.com/ytnobody/Yukemuri/issues)
- [Discussions](https://github.com/ytnobody/Yukemuri/discussions)
