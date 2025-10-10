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

- `packages/core` - Core framework (under development)
- `packages/create-yukemuri` - Project scaffolding tool
- `packages/plugins` - Official plugins (planned)

## Development

This is a monorepo managed with pnpm:

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Link create-yukemuri globally for testing
pnpm --filter create-yukemuri link --global
```

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
- [ ] Core framework implementation
- [ ] Plugin system architecture
- [ ] Database integration (Turso/SQLite)
- [ ] Authentication plugins
- [ ] Deployment helpers

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## License

MIT License - see [LICENSE](LICENSE) for details.