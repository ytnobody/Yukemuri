/**
 * Auth state interface
 */
export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  token: string | null
  user: any | null
}

/**
 * useAuth hook for authentication management
 * Provides login, register, logout, and auth state
 */
export function useAuth(apiBaseUrl: string = "/api/auth") {
  let isAuthenticated = false
  let isLoading = false
  let error: string | null = null
  let token: string | null = null
  let user: any | null = null

  // Restore token from localStorage on initialization
  const savedToken = typeof localStorage !== "undefined" ? localStorage.getItem("auth_token") : null
  if (savedToken) {
    token = savedToken
    isAuthenticated = true
  }

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    isLoading = true
    error = null

    try {
      const response = await fetch(`${apiBaseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const { token: newToken, user: userData } = await response.json()
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("auth_token", newToken)
      }

      token = newToken
      user = userData
      isAuthenticated = true
      isLoading = false

      return { success: true, user: userData }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      error = message
      isAuthenticated = false
      isLoading = false
      return { success: false, error: message }
    }
  }

  /**
   * Register new user
   */
  const register = async (email: string, password: string, name?: string) => {
    isLoading = true
    error = null

    try {
      const response = await fetch(`${apiBaseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const { token: newToken, user: userData } = await response.json()
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("auth_token", newToken)
      }

      token = newToken
      user = userData
      isAuthenticated = true
      isLoading = false

      return { success: true, user: userData }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed"
      error = message
      isLoading = false
      return { success: false, error: message }
    }
  }

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await fetch(`${apiBaseUrl}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    } catch {
      // Ignore logout errors, still clear local state
    }

    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("auth_token")
    }
    token = null
    user = null
    isAuthenticated = false
    error = null
  }

  /**
   * Refresh auth token
   */
  const refreshToken = async () => {
    if (!token) return { success: false }

    try {
      const response = await fetch(`${apiBaseUrl}/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Token refresh failed")
      }

      const { token: newToken } = await response.json()
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("auth_token", newToken)
      }

      token = newToken
      return { success: true, token: newToken }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Token refresh failed"
      error = message
      isAuthenticated = false
      return { success: false, error: message }
    }
  }

  return {
    isAuthenticated,
    isLoading,
    error,
    token,
    user,
    login,
    register,
    logout,
    refreshToken,
  }
}
