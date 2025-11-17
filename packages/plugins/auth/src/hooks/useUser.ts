/**
 * User data interface
 */
export interface UserProfile {
  id: string
  email: string
  profile?: Record<string, any>
  createdAt: string
  updatedAt: string
  verified: boolean
}

/**
 * useUser hook for managing user profile
 * Fetches and updates current user data
 */
export function useUser(token?: string | null, apiBaseUrl: string = "/api/auth") {
  let user: UserProfile | null = null
  let isLoading = false
  let error: string | null = null

  /**
   * Fetch current user data
   */
  const fetchUser = async (): Promise<void> => {
    if (!token) {
      user = null
      return
    }

    isLoading = true
    error = null

    try {
      const response = await fetch(`${apiBaseUrl}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user")
      }

      const userData = await response.json()
      user = userData
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch user"
      error = message
      user = null
    } finally {
      isLoading = false
    }
  }

  /**
   * Update user profile
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!token) {
      error = "Not authenticated"
      return { success: false, error: "Not authenticated" }
    }

    try {
      const response = await fetch(`${apiBaseUrl}/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const updatedUser = await response.json()
      user = updatedUser
      error = null
      return { success: true, user: updatedUser }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile"
      error = message
      return { success: false, error: message }
    }
  }

  /**
   * Refetch user data
   */
  const refetch = async (): Promise<void> => {
    await fetchUser()
  }

  return {
    user,
    isLoading,
    error,
    updateProfile,
    refetch,
  }
}
