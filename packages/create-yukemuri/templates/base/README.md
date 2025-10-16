# Yukemuri Application ♨️

This is a new PWA built with Yukemuri framework powered by Hono + Preact.

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view your application.

### External Access (LAN, ngrok, etc.)

For accessing from other devices or external services:

```bash
# Enable access from any host (LAN access)
npm run dev:host

# Quick ngrok tunnel (easiest method)
npm run tunnel
```

**Prerequisites:**
```bash
# Install ngrok globally first
npm install -g ngrok

# Get authtoken from https://ngrok.com and set it
ngrok authtoken YOUR_TOKEN
```

**Advanced HMR configuration:**
```bash
# For external access with HMR
HMR_HOST=your-domain.ngrok.io HMR_PROTOCOL=wss HMR_PORT=443 npm run dev
```

The development server will automatically:
- ✅ Enable CORS for all origins
- ✅ Show available network addresses  
- ✅ Configure HMR for external access
- ✅ Support HTTPS ngrok tunnels

**Ngrok Features:**
- 🌍 **Public URL**: Share your app with anyone
- 📱 **PWA Testing**: Test install prompts on mobile devices
- 🔔 **Push Notifications**: Test real push notifications
- 🔄 **Live Reload**: HMR works through the tunnel

**Troubleshooting:**

If ngrok fails:
```bash
# Option 1: Setup ngrok manually
npm install -g ngrok
ngrok authtoken YOUR_TOKEN  # Get from https://ngrok.com
ngrok http 5173

# Option 2: Use LAN access only
npm run dev:host
```

Common ngrok issues:
- **"failed to start tunnel"**: Sign up at ngrok.com and set authtoken
- **"connection refused"**: Make sure dev server is running first

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Deploy to Cloudflare Pages

```bash
npm run deploy
```

## Project Structure

```
├── app/
│   ├── routes/           # File-based routing
│   │   ├── index.tsx     # Home page (/)
│   │   └── api/          # API routes
│   │       ├── users.ts  # /api/users
│   │       └── health.ts # /api/health
│   ├── islands/          # Client-side components
│   └── client.ts         # Client entry point
├── src/
│   └── index.ts          # Server entry point
├── vite.config.ts        # Vite configuration
└── wrangler.toml         # Cloudflare Pages configuration
```

## Features

- ⚡ **Edge-first**: Powered by HonoX and Cloudflare Workers/Pages
- 🔒 **Type-safe**: Full TypeScript support with JSX
- 🚀 **Fast development**: Vite for instant HMR
- 📦 **File-based routing**: Intuitive routing system
- 🏝️ **Islands Architecture**: Selective hydration for performance
- 📱 **PWA Ready**: Progressive Web App capabilities

## API Endpoints

- `GET /` - Home page with UI
- `GET /api/health` - Health check endpoint
- `GET /api/users` - Get users list
- `POST /api/users` - Create new user

## Learn More

- [Yukemuri Documentation](https://github.com/your-org/yukemuri)
- [HonoX Documentation](https://hono.dev/getting-started/cloudflare-pages)
- [Cloudflare Pages](https://pages.cloudflare.com)