import { createPlugin, createConfigSchema } from '@yukemuri/core';
import type { Context } from 'hono';

// Configuration schema
const configSchema = createConfigSchema({
  jwtSecret: {
    type: 'string',
    description: 'JWT secret for token signing',
    required: true
  },
  jwtExpiry: {
    type: 'string',
    description: 'JWT token expiry time',
    default: '7d'
  },
  bcryptRounds: {
    type: 'number',
    description: 'Bcrypt salt rounds',
    default: 12,
    minimum: 8,
    maximum: 15
  },
  providers: {
    type: 'array',
    description: 'OAuth providers configuration',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        clientId: { type: 'string' },
        clientSecret: { type: 'string' },
        scope: { type: 'array', items: { type: 'string' } }
      }
    },
    default: []
  },
  loginRoute: {
    type: 'string',
    description: 'Login route path',
    default: '/auth/login'
  },
  logoutRoute: {
    type: 'string',
    description: 'Logout route path',
    default: '/auth/logout'
  },
  protectedRoutes: {
    type: 'array',
    description: 'Routes that require authentication',
    items: { type: 'string' },
    default: ['/api/protected/*']
  }
}, ['jwtSecret']);

// Auth middleware
async function authMiddleware(c: Context, next: any) {
  const config = c.get('pluginConfig');
  const path = c.req.path;
  
  const isProtected = config.protectedRoutes.some((route: string) => {
    const regex = new RegExp(route.replace('*', '.*'));
    return regex.test(path);
  });
  
  if (!isProtected) {
    return next();
  }
  
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  c.set('user', { id: '1', email: 'user@example.com' });
  return next();
}

// Route handlers
async function registerHandler(c: Context) {
  return c.json({ message: 'Register endpoint' });
}

async function loginHandler(c: Context) {
  return c.json({ token: 'stub_token' });
}

async function logoutHandler(c: Context) {
  return c.json({ message: 'Logged out' });
}

async function meHandler(c: Context) {
  const user = c.get('user');
  return c.json({ user });
}

async function refreshHandler(c: Context) {
  return c.json({ token: 'new_token' });
}

export default createPlugin({
  name: '@yukemuri/plugin-auth',
  version: '1.0.0',
  description: 'Authentication and authorization system for Yukemuri',
  author: 'Yukemuri Team',
  license: 'MIT',
  configSchema,
  defaultConfig: {
    jwtExpiry: '7d',
    bcryptRounds: 12,
    providers: [],
    loginRoute: '/auth/login',
    logoutRoute: '/auth/logout',
    protectedRoutes: ['/api/protected/*']
  },
  init: async (context: any) => {
    const { logger } = context;
    logger.info('Auth plugin initialized');
  },
  middleware: [
    {
      path: '/api/*',
      middleware: authMiddleware
    }
  ],
  routes: [
    {
      path: '/auth/register',
      method: 'POST',
      handler: registerHandler
    },
    {
      path: '/auth/login',
      method: 'POST',
      handler: loginHandler
    },
    {
      path: '/auth/logout',
      method: 'POST',
      handler: logoutHandler
    },
    {
      path: '/auth/me',
      method: 'GET',
      handler: meHandler
    },
    {
      path: '/auth/refresh',
      method: 'POST',
      handler: refreshHandler
    }
  ],
  clientExtensions: {
    hooks: [
      {
        name: 'useAuth',
        hook: () => import('./hooks/useAuth')
      },
      {
        name: 'useUser',
        hook: () => import('./hooks/useUser')
      }
    ],
    components: [
      {
        name: 'LoginForm',
        component: () => import('./components/LoginForm')
      },
      {
        name: 'RegisterForm',
        component: () => import('./components/RegisterForm')
      },
      {
        name: 'UserProfile',
        component: () => import('./components/UserProfile')
      },
      {
        name: 'AuthGuard',
        component: () => import('./components/AuthGuard')
      }
    ],
    utilities: [
      {
        name: 'auth',
        utility: () => import('./utils/auth')
      }
    ]
  }
});
