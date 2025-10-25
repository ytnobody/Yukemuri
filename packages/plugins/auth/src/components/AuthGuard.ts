/**
 * AuthGuard Component
 * Route guard for protected routes
 */
export interface AuthGuardProps {
  isAuthenticated: boolean;
  isLoading?: boolean;
  fallback?: string | null;
  children: any;
}

export function AuthGuard(props: AuthGuardProps) {
  if (props.isLoading) {
    return '<div class="auth-guard-loading">Loading...</div>';
  }

  if (!props.isAuthenticated) {
    return props.fallback || '<div class="auth-guard-unauthorized">Unauthorized. Please log in.</div>';
  }

  return props.children;
}
