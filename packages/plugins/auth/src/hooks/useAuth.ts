/**
 * useAuth Hook
 * Provides authentication state and functions
 */
export function useAuth() {
  return {
    user: null,
    isAuthenticated: false,
    login: (credentials: any) => Promise.resolve(),
    logout: () => Promise.resolve(),
    register: (data: any) => Promise.resolve(),
  };
}
