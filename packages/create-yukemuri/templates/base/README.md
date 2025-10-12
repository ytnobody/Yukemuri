# Yukemari Application ♨️

This is a new PWA built with Yukemari framework powered by Hono + Preact.

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

# Use with ngrok
ngrok http 5173

# For ngrok with custom domain, set environment variables:
HMR_HOST=your-domain.ngrok.io npm run dev
```

**ngrok HTTPS setup:**
```bash
# Copy .env.example to .env and configure:
cp .env.example .env

# Edit .env file:
HMR_HOST=your-domain.ngrok.io
HMR_PROTOCOL=wss
HMR_PORT=443
```

The development server will automatically:
- ✅ Enable CORS for all origins
- ✅ Show available network addresses  
- ✅ Configure HMR for external access
- ✅ Support both HTTP and HTTPS ngrok tunnels

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

- [Yukemari Documentation](https://github.com/your-org/yukemari)
- [HonoX Documentation](https://hono.dev/getting-started/cloudflare-pages)
- [Cloudflare Pages](https://pages.cloudflare.com)