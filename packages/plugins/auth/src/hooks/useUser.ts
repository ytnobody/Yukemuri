/**
 * useUser Hook
 * Provides user-specific functionality
 */
export function useUser() {
  return {
    user: null,
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}
