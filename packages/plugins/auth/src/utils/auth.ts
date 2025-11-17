import crypto from "crypto"

/**
 * JWT utilities for token generation and verification
 */
export class JWTUtils {
  private static readonly ALGORITHM = "HS256"

  /**
   * Sign JWT token
   */
  static sign(payload: Record<string, any>, secret: string, expiryTime: string = "7d"): string {
    const header = {
      alg: JWTUtils.ALGORITHM,
      typ: "JWT",
    }

    const now = Math.floor(Date.now() / 1000)
    const expirySeconds = JWTUtils.parseExpiryTime(expiryTime)
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + expirySeconds,
    }

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
    const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url")
    const message = `${encodedHeader}.${encodedPayload}`

    const signature = crypto.createHmac("sha256", secret).update(message).digest("base64url")

    return `${message}.${signature}`
  }

  /**
   * Verify JWT token
   */
  static verify(token: string, secret: string): Record<string, any> | null {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split(".")

      if (!encodedHeader || !encodedPayload || !signature) {
        return null
      }

      const message = `${encodedHeader}.${encodedPayload}`
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(message)
        .digest("base64url")

      if (signature !== expectedSignature) {
        return null
      }

      const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString())

      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null
      }

      return payload
    } catch (error) {
      return null
    }
  }

  /**
   * Parse expiry time string (e.g., '7d', '24h', '3600s')
   */
  private static parseExpiryTime(expiryStr: string): number {
    const match = expiryStr.match(/^(\d+)([dhms])$/)
    if (!match) throw new Error(`Invalid expiry time format: ${expiryStr}`)

    const value = parseInt(match[1], 10)
    const unit = match[2]

    switch (unit) {
      case "d":
        return value * 24 * 60 * 60
      case "h":
        return value * 60 * 60
      case "m":
        return value * 60
      case "s":
        return value
      default:
        throw new Error(`Unknown time unit: ${unit}`)
    }
  }

  /**
   * Decode JWT without verification
   */
  static decode(token: string): Record<string, any> | null {
    try {
      const [, encodedPayload] = token.split(".")
      if (!encodedPayload) return null
      return JSON.parse(Buffer.from(encodedPayload, "base64url").toString())
    } catch {
      return null
    }
  }
}

/**
 * Password hashing utilities
 */
export class PasswordUtils {
  /**
   * Hash password using PBKDF2
   */
  static hash(password: string, rounds: number = 12): string {
    const salt = crypto.randomBytes(16).toString("hex")
    const iterations = 1000 * rounds

    const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha256").toString("hex")
    return `${iterations}$${salt}$${hash}`
  }

  /**
   * Verify password against hash
   */
  static verify(password: string, hash: string): boolean {
    try {
      const [iterationsStr, salt, originalHash] = hash.split("$")
      const iterations = parseInt(iterationsStr, 10)

      const computedHash = crypto
        .pbkdf2Sync(password, salt, iterations, 64, "sha256")
        .toString("hex")

      return computedHash === originalHash
    } catch {
      return false
    }
  }

  /**
   * Generate random token for password reset, email verification
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex")
  }
}

/**
 * User management utilities
 */
export class UserUtils {
  private static users: Map<string, any> = new Map()
  private static userEmails: Map<string, string> = new Map()

  /**
   * Create new user
   */
  static createUser(email: string, password: string, profile?: Record<string, any>): any {
    if (UserUtils.userEmails.has(email)) {
      throw new Error("User with this email already exists")
    }

    const userId = crypto.randomUUID()
    const hashedPassword = PasswordUtils.hash(password)

    const user = {
      id: userId,
      email,
      password: hashedPassword,
      profile: profile || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      verified: false,
    }

    UserUtils.users.set(userId, user)
    UserUtils.userEmails.set(email, userId)

    return UserUtils.sanitizeUser(user)
  }

  /**
   * Find user by email
   */
  static findByEmail(email: string): any | null {
    const userId = UserUtils.userEmails.get(email)
    if (!userId) return null
    return UserUtils.users.get(userId) || null
  }

  /**
   * Find user by ID
   */
  static findById(userId: string): any | null {
    return UserUtils.users.get(userId) || null
  }

  /**
   * Authenticate user with email and password
   */
  static authenticate(email: string, password: string): any | null {
    const user = UserUtils.findByEmail(email)
    if (!user) return null

    if (!PasswordUtils.verify(password, user.password)) {
      return null
    }

    return UserUtils.sanitizeUser(user)
  }

  /**
   * Update user profile
   */
  static updateProfile(userId: string, updates: Record<string, any>): any | null {
    const user = UserUtils.users.get(userId)
    if (!user) return null

    user.profile = { ...user.profile, ...updates }
    user.updatedAt = new Date()

    return UserUtils.sanitizeUser(user)
  }

  /**
   * Remove sensitive fields from user object
   */
  private static sanitizeUser(user: any): any {
    const { password, ...sanitized } = user
    return sanitized
  }
}

/**
 * OAuth mock provider (for development)
 */
export class OAuthMockProvider {
  /**
   * Verify OAuth token (mock implementation)
   */
  static verifyToken(
    provider: string,
    token: string,
    _clientSecret?: string
  ): Record<string, any> | null {
    if (!token || token === "invalid") {
      return null
    }

    return {
      id: `${provider}_user_${crypto.randomBytes(4).toString("hex")}`,
      email: `user+${provider}@example.com`,
      name: `${provider} User`,
      provider,
    }
  }

  /**
   * Get authorization URL
   */
  static getAuthUrl(
    provider: string,
    clientId: string,
    redirectUri: string,
    scope: string[]
  ): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope.join(" "),
      response_type: "code",
    })

    return `https://${provider}.example.com/oauth/authorize?${params.toString()}`
  }
}

// Legacy exports for backward compatibility
export function encodeToken(payload: any): string {
  return JWTUtils.sign(payload, "default-secret")
}

export function decodeToken(token: string): any {
  return JWTUtils.decode(token)
}

export function validateToken(token: string): boolean {
  return JWTUtils.verify(token, "default-secret") !== null
}

export function hashPassword(password: string): string {
  return PasswordUtils.hash(password)
}

export function comparePasswords(password: string, hash: string): boolean {
  return PasswordUtils.verify(password, hash)
}
