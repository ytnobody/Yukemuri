# @yukemuri/cli

Command-line interface for creating and managing Yukemuri applications.

## Installation

```bash
npm install -g @yukemuri/cli
# or use with npx
npx @yukemuri/cli --help
```

## Commands

### create

Create a new Yukemuri application.

```bash
yukemuri create [project-name]
```

**Options:**
- `--template` - Template to use (default: `base`)
- `--typescript` - Use TypeScript (default: true)

**Examples:**
```bash
# Create app with default template
yukemuri create my-app

# Create app with custom template
yukemuri create my-app --template=advanced

# Interactive mode
yukemuri create
```

### dev

Start development server with hot reload.

```bash
yukemuri dev
```

**Options:**
- `--port` - Port number (default: 3000)
- `--host` - Host address (default: localhost)
- `--open` - Open in browser

**Examples:**
```bash
yukemuri dev --port 4000
yukemuri dev --host 0.0.0.0 --open
```

### plugin

Manage plugins.

```bash
yukemuri plugin [action] [name]
```

**Actions:**
- `add` - Add a plugin
- `remove` - Remove a plugin
- `list` - List installed plugins

**Examples:**
```bash
# Add auth plugin
yukemuri plugin add auth

# Remove auth plugin
yukemuri plugin remove auth

# List all plugins
yukemuri plugin list
```

## Quick Start

### 1. Create Application

```bash
yukemuri create my-app
cd my-app
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Start Development Server

```bash
npm run dev
# or
yukemuri dev
```

### 4. Open in Browser

Navigate to `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

### 6. Deploy

```bash
npm run deploy
```

## Project Structure

```
my-app/
├── app/
│   ├── client.ts          # Client initialization
│   ├── server.ts          # Server configuration
│   ├── document.tsx       # HTML template
│   ├── routes/            # File-based routes
│   │   ├── index.tsx      # Home page
│   │   ├── about.tsx      # About page
│   │   └── api/           # API routes
│   │       └── users.ts
│   ├── components/        # Reusable components
│   ├── lib/               # Utility functions
│   ├── types/             # TypeScript types
│   └── core/              # Core features (PWA, router, etc.)
├── public/                # Static assets
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
├── scripts/               # Build scripts
├── app/api/               # API implementations
├── package.json
├── tsconfig.json
├── vite.config.ts
├── wrangler.toml          # Cloudflare Workers config
└── README.md
```

## Environment Variables

Create `.env.local` in your project root:

```env
# Development
VITE_API_BASE=http://localhost:3000

# Production
VITE_API_BASE=https://api.example.com

# PWA
VITE_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:your-email@example.com
```

## Available Scripts

```json
{
  "dev": "Start development server",
  "dev:host": "Start dev server on 0.0.0.0",
  "dev:ssr": "Start server-side rendering dev",
  "build": "Build for production",
  "preview": "Preview production build",
  "deploy": "Deploy to Cloudflare Workers",
  "tunnel": "Create ngrok tunnel for sharing",
  "cleanup": "Clean up build artifacts",
  "type-check": "Check TypeScript errors",
  "generate-vapid": "Generate VAPID keys for PWA"
}
```

## Adding Plugins

### Using CLI

```bash
yukemuri plugin add auth
```

### Manual Setup

1. Install plugin package:
```bash
npm install @yukemuri/plugin-auth
```

2. Register in server configuration:
```typescript
import { createApp } from '@yukemuri/core';
import authPlugin from '@yukemuri/plugin-auth';

const app = createApp();

await app.use(authPlugin, {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: '7d'
});
```

## Troubleshooting

### Port Already in Use

```bash
# Use different port
yukemuri dev --port 4000

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .vite dist
npm run build
```

### TypeScript Errors

```bash
# Check types
npm run type-check

# Update TypeScript
npm install -D typescript@latest
```

## Configuration

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

### wrangler.toml

```toml
name = "my-app"
main = "dist/index.js"
compatibility_date = "2025-01-01"

[env.development]
vars = { ENVIRONMENT = "development" }

[env.production]
vars = { ENVIRONMENT = "production" }
```

## Development Tips

### Hot Module Replacement

Changes to `.tsx`, `.ts`, and `.css` files automatically reload:

```bash
yukemuri dev
# Edit a file and see changes instantly
```

### Debugging

Enable debug logging:

```bash
DEBUG=* yukemuri dev
```

### Performance

Monitor bundle size:

```bash
npm run build -- --stats
```

## Deployment

### Cloudflare Workers

```bash
# Login to Cloudflare
wrangler login

# Deploy
npm run deploy
```

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## See Also

- [Core Documentation](../core/README.md)
- [Plugin Documentation](../auth/README.md)
- [Yukemuri Website](https://yukemuri.dev)
