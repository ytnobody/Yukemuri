/**
 * Authentication utilities export
 * Central export point for all auth utility functions and classes
 */

export {
  JWTUtils,
  PasswordUtils,
  UserUtils,
  OAuthMockProvider,
  encodeToken,
  decodeToken,
  validateToken,
  hashPassword,
  comparePasswords
} from './auth';

export type { AuthState } from '../hooks/useAuth';
export type { UserProfile } from '../hooks/useUser';
