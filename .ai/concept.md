# Yukemuri ♨️ - Internet edge PWA framework

## Core Concept

Yukemuri (meaning "hot spring steam") is a PWA framework named to provide developers with a warm and comfortable development experience, just like the steam from hot springs. It aims to enable small to medium-sized service vendors and individual developers to build practical web applications immediately without worrying about complex technology selection.

## Current Technology Stack (October 2025)

### Core Architecture
- **Web Framework**: Hono (lightweight, type-safe, edge-first design)
- **UI Library**: Preact (React-compatible, built-in TypeScript support)
- **Build Tool**: Vite (fast dev server, HMR support)
- **Styling**: UnoCSS (on-demand CSS generation, lightweight)
- **PWA Features**: Web App Manifest, Service Worker, Push notifications
- **Deployment Environment**: Cloudflare Workers (edge computing)

### Development Tools
- **CLI**: create-yukemuri (instant project creation with `npx create-yukemuri my-app`)
- **Type Safety**: Full TypeScript support (clean implementation without @ts-ignore)
- **SSR + Hydration**: Server-side rendering + client-side dynamic features

## Design Philosophy

### 1. Warm and Comfortable Development Experience (Yukemuri Concept)
- **Minimal Learning Cost**: Directly leverage existing knowledge (React/TypeScript)
- **Immediate Results**: Beautiful UI displayed instantly with `npm run dev`
- **Error-Free**: Clean code generation without TypeScript errors

### 2. Edge-First Design
- **Performance**: High-speed execution on Cloudflare Workers
- **Lightweight**: Optimized CSS output from UnoCSS
- **Scalability**: Auto-scaling through edge computing

### 3. PWA Native Experience
- **Installable**: Native app-like experience
- **Offline Support**: Stable operation with Service Workers
- **Push Notifications**: Real-time user engagement
- **Fast Startup**: Splash screen and cache optimization

### 4. Plugin Ecosystem (Future Expansion)
```sql
-- Planned Plugin System
plugins/
├── auth/           # Authentication Plugin (Auth0, Clerk, Supabase)
├── payments/       # Payment Plugin (Stripe, PayPal)
├── database/       # Database Plugin (Turso + Drizzle)
├── analytics/      # Analytics Plugin (Google Analytics, Plausible)
└── cms/           # CMS Plugin (Headless CMS Integration)
```

## Current Implementation Status

### ✅ Completed Features
- **create-yukemuri CLI**: Fully operational, project generation
- **Hono + Preact Integration**: SSR + Hydration completed
- **UnoCSS Integration**: Beautiful UI component generation
- **Full TypeScript Support**: Error-free templates
- **Development Environment**: Instant startup with `npm run dev`
- **Build System**: Client/server-side support

### 🚧 In Development / Planned
- **PWA Core Features**: Web App Manifest, Service Worker, offline support
- **PWA Notification Features**: Push notifications, background sync
- **PWA Installation Features**: Installation prompt, splash screen
- **Plugin System**: Architecture design
- **Database Integration**: Turso + Drizzle ORM
- **Authentication System**: Multiple provider support
- **Payment System**: Stripe integration

## Branding

### Symbol
- **Logo**: ♨️ (hot spring mark, displayed prominently)
- **Message**: "Happy coding! ♨️"
- **Color Palette**: Primary blue (#3b82f6), warm gray

### Communication
- **Warm and Friendly**: Soothing development experience like hot spring steam
- **Practical Focus**: Balance between beauty and functionality
- **Community-Oriented**: Knowledge sharing among developers

## Target Users

### Primary Targets
- **Individual Developers**: Side projects and portfolio creation
- **Startups**: Rapid MVP (Minimum Viable Product) development
- **Small Teams**: Agile development with 2-5 people

### Use Case Examples
- **SaaS MVP**: Authentication + payment + core features
- **Landing Page**: Fast and SEO-optimized
- **Enterprise Tools**: Rapid internal system development
- **E-commerce Site**: Product sales system

## Competitive Differentiation

### vs Next.js
- **Learning Cost**: Simpler, configuration-less
- **Performance**: Edge-first design
- **Scale**: Optimized for small to medium projects

### vs Nuxt.js
- **Type Safety**: TypeScript-first
- **Lightweight**: Smaller bundle size
- **Deployment**: Native Cloudflare Workers support

### vs SvelteKit
- **Ecosystem**: Abundant React/Preact library ecosystem
- **Migration Cost**: Leverage existing React knowledge
- **Enterprise Adoption**: More stable technology choice

## Future Roadmap

### Phase 1 (Completed) - Foundation Building
- ✅ CLI + template system
- ✅ Hono + Preact + UnoCSS integration
- ✅ Full TypeScript support

### Phase 2 (High Priority for Next Development) - PWA Core Features
- 🚧 Web App Manifest (app metadata, icons, theme)
- 🚧 Service Worker (cache strategy, offline support)
- 🚧 Installation Features (PWA install prompt, splash screen)
- 🚧 Push Notifications (permission, message delivery, background processing)
- 🚧 PWA Detection API (installation state check, native capability access)

### Phase 3 (Mid-term Development) - Plugin Ecosystem
- 🚧 Authentication Plugin (Auth0, Clerk, Supabase)
- 🚧 Payment Plugin (Stripe)
- 🚧 Database Plugin (Turso + Drizzle)

### Phase 4 (Future Expansion) - Ecosystem Extension
- 📋 CMS Integration
- 📋 Analytics Tool Integration
- 📋 Test & Deployment Automation
- 📋 Community Plugins

## PWA Features Details (Phase 2 Development Plan)

### Web App Manifest
- **App Information**: Name, description, icons (multiple sizes)
- **Display Settings**: standalone, fullscreen, minimal-ui support
- **Theme Color**: Unified brand color
- **Splash Screen**: Customizable startup screen

### Service Worker
- **Cache Strategy**:
  - Cache First (static resources)
  - Network First (API)
  - Stale While Revalidate (images)
- **Offline Support**: Fallback page, data sync
- **Background Sync**: Auto-sending on network recovery

### Installation Features
- **Installation Detection**: Determine if PWA is installable
- **Custom Prompt**: Brand-aligned installation guidance
- **Installation State**: Check if app is already installed
- **Update Notification**: Auto-detect new versions

### Push Notifications
- **Permission Request**: User-friendly permission request
- **Message Delivery**: Real-time server notifications
- **Notification Actions**: Button-enabled notifications, deep linking support
- **Background Processing**: Notification handling when app is not running

## Technical Superiority

### Performance
- **Edge Computing**: High-speed response worldwide
- **On-Demand CSS**: Generate only used styles
- **Lightweight Runtime**: Small bundle size with Preact
- **PWA Caching**: Efficient resource management with Service Workers

### Developer Experience
- **Zero Config**: Start immediately without configuration
- **Type Safety**: Detect errors before runtime
- **HMR**: Fast development cycle
- **PWA Tools**: Auto-generate manifests, Service Workers

### User Experience
- **Native-like**: Installation without app store
- **Offline Support**: Works independently of network conditions
- **Push Notifications**: Enhanced user engagement
- **Fast Startup**: Instant display with cache strategy

### Operations
- **Cost Efficient**: Pay-per-use serverless model
- **Scalability**: Auto-scaling
- **Security**: Leverage Cloudflare infrastructure