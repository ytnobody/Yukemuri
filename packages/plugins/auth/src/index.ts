import { createPlugin, createConfigSchema } from "@yukemuri/core"
import { JWTUtils, PasswordUtils, UserUtils } from "./utils/auth"

// Configuration schema
const configSchema = createConfigSchema(
  {
    jwtSecret: {
      type: "string",
      description: "JWT secret for token signing",
      required: true,
    },
    jwtExpiry: {
      type: "string",
      description: "JWT token expiry time",
      default: "7d",
    },
    bcryptRounds: {
      type: "number",
      description: "Bcrypt salt rounds",
      default: 12,
      minimum: 8,
      maximum: 15,
    },
    providers: {
      type: "array",
      description: "OAuth providers configuration",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          clientId: { type: "string" },
          clientSecret: { type: "string" },
          scope: { type: "array", items: { type: "string" } },
        },
      },
      default: [],
    },
    loginRoute: {
      type: "string",
      description: "Login route path",
      default: "/auth/login",
    },
    logoutRoute: {
      type: "string",
      description: "Logout route path",
      default: "/auth/logout",
    },
    protectedRoutes: {
      type: "array",
      description: "Routes that require authentication",
      items: { type: "string" },
      default: ["/api/protected/*"],
    },
  },
  ["jwtSecret"]
)

// Auth middleware - validates JWT token and sets user context
async function authMiddleware(c: any, next: any) {
  const config = c.get("pluginConfig")
  const path = c.req.path

  const isProtected = config.protectedRoutes.some((route: string) => {
    const regex = new RegExp(route.replace("*", ".*"))
    return regex.test(path)
  })

  if (!isProtected) {
    return next()
  }

  const authHeader = c.req.header("Authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const payload = JWTUtils.verify(token, config.jwtSecret)
  if (!payload) {
    return c.json({ error: "Invalid or expired token" }, 401)
  }

  const user = UserUtils.findById(payload.userId)
  if (!user) {
    return c.json({ error: "User not found" }, 401)
  }

  c.set("user", user)
  return next()
}
// Register route handler
async function registerHandler(c: any) {
  try {
    const config = c.get("pluginConfig")
    const body = c.get("body") || {}
    const { email, password, name } = body

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400)
    }

    const user = UserUtils.createUser(email, password, { name })
    const token = JWTUtils.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      config.jwtExpiry
    )

    return c.json({ token, user }, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed"
    return c.json({ error: message }, 400)
  }
}

// Login route handler
async function loginHandler(c: any) {
  try {
    const config = c.get("pluginConfig")
    const body = c.get("body") || {}
    const { email, password } = body

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400)
    }

    const user = UserUtils.authenticate(email, password)
    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401)
    }

    const token = JWTUtils.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      config.jwtExpiry
    )
    return c.json({ token, user })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed"
    return c.json({ error: message }, 400)
  }
}

// Logout route handler
async function logoutHandler(c: any) {
  // In a production app, you might maintain a token blacklist
  // For now, the client just removes the token from localStorage
  return c.json({ message: "Logged out successfully" })
}

// Get current user route handler
async function meHandler(c: any) {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Not authenticated" }, 401)
  }
  return c.json(user)
}

// Refresh token route handler
async function refreshHandler(c: any) {
  try {
    const config = c.get("pluginConfig")
    const authHeader = c.req.header("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return c.json({ error: "No token provided" }, 401)
    }

    const payload = JWTUtils.verify(token, config.jwtSecret)
    if (!payload) {
      return c.json({ error: "Invalid or expired token" }, 401)
    }

    const user = UserUtils.findById(payload.userId)
    if (!user) {
      return c.json({ error: "User not found" }, 401)
    }

    const newToken = JWTUtils.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      config.jwtExpiry
    )
    return c.json({ token: newToken })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Token refresh failed"
    return c.json({ error: message }, 400)
  }
}

export default createPlugin({
  name: "@yukemuri/plugin-auth",
  version: "1.0.0",
  description: "Authentication and authorization system for Yukemuri",
  author: "Yukemuri Team",
  license: "MIT",
  configSchema,
  defaultConfig: {
    jwtExpiry: "7d",
    bcryptRounds: 12,
    providers: [],
    loginRoute: "/auth/login",
    logoutRoute: "/auth/logout",
    protectedRoutes: ["/api/protected/*"],
  },
  init: async (context: any) => {
    const { logger } = context
    logger.info("Auth plugin initialized with JWT and password hashing")
  },
  middleware: [
    {
      path: "/api/*",
      middleware: authMiddleware,
    },
  ],
  routes: [
    {
      path: "/auth/register",
      method: "POST",
      handler: registerHandler,
    },
    {
      path: "/auth/login",
      method: "POST",
      handler: loginHandler,
    },
    {
      path: "/auth/logout",
      method: "POST",
      handler: logoutHandler,
    },
    {
      path: "/auth/me",
      method: "GET",
      handler: meHandler,
    },
    {
      path: "/auth/refresh",
      method: "POST",
      handler: refreshHandler,
    },
  ],
  clientExtensions: {
    hooks: [
      {
        name: "useAuth",
        hook: () => import("./hooks/useAuth"),
      },
      {
        name: "useUser",
        hook: () => import("./hooks/useUser"),
      },
    ],
    components: [
      {
        name: "LoginForm",
        component: () => import("./components/LoginForm"),
      },
      {
        name: "RegisterForm",
        component: () => import("./components/RegisterForm"),
      },
      {
        name: "UserProfile",
        component: () => import("./components/UserProfile"),
      },
      {
        name: "AuthGuard",
        component: () => import("./components/AuthGuard"),
      },
    ],
    utilities: [
      {
        name: "auth",
        utility: () => import("./utils/auth"),
      },
    ],
  },
})
