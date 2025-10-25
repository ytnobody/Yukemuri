# @yukemuri/plugin-auth

Authentication and authorization plugin for Yukemuri framework with JWT and password hashing support.

## Features

- JWT-based token authentication (HMAC-SHA256)
- PBKDF2 password hashing
- User management and profile updates
- React hooks for auth state management
- Pre-built UI components (LoginForm, RegisterForm, UserProfile, AuthGuard)
- OAuth mock provider for development
- Route protection middleware

## Installation

```bash
npm install @yukemuri/plugin-auth
# or
pnpm add @yukemuri/plugin-auth
```

## Basic Usage

### Server-side Setup

```typescript
import { createApp } from '@yukemuri/core';
import authPlugin from '@yukemuri/plugin-auth';

const app = createApp();

// Register auth plugin with configuration
await app.use(authPlugin, {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiry: '7d',          // Token expiry time
  bcryptRounds: 12,         // Password hashing iterations
  protectedRoutes: ['/api/protected/*']  // Routes requiring authentication
});

app.listen(3000);
```

### API Endpoints

The plugin provides the following endpoints:

#### Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "John Doe"  // optional
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": { "name": "John Doe" },
    "createdAt": "2025-10-25T...",
    "verified": false
  }
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password"
}

Response:
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

#### Get Current User
```bash
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "profile": { ... },
  "createdAt": "2025-10-25T...",
  "verified": false
}
```

#### Refresh Token
```bash
POST /auth/refresh
Authorization: Bearer <token>

Response:
{
  "token": "eyJhbGc..."
}
```

#### Logout
```bash
POST /auth/logout
Authorization: Bearer <token>

Response:
{
  "message": "Logged out successfully"
}
```

## Client-side Usage

### Using the useAuth Hook

```typescript
import { useAuth } from '@yukemuri/plugin-auth';

function LoginPage() {
  const { login, isLoading, error } = useAuth('/api/auth');

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <input type="email" placeholder="Email" id="email" />
      <input type="password" placeholder="Password" id="password" />
      <button 
        onClick={() => {
          const email = (document.getElementById('email') as HTMLInputElement).value;
          const password = (document.getElementById('password') as HTMLInputElement).value;
          handleLogin(email, password);
        }}
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}
```

### Using the LoginForm Component

```typescript
import { LoginForm } from '@yukemuri/plugin-auth';
import { useAuth } from '@yukemuri/plugin-auth';

function LoginPage() {
  const { login, isLoading, error } = useAuth('/api/auth');

  return (
    <LoginForm
      onSubmit={login}
      isLoading={isLoading}
      error={error}
      onSuccess={() => window.location.href = '/dashboard'}
    />
  );
}
```

### Using the RegisterForm Component

```typescript
import { RegisterForm } from '@yukemuri/plugin-auth';
import { useAuth } from '@yukemuri/plugin-auth';

function RegisterPage() {
  const { register, isLoading, error } = useAuth('/api/auth');

  return (
    <RegisterForm
      onSubmit={register}
      isLoading={isLoading}
      error={error}
      onSuccess={() => window.location.href = '/login'}
    />
  );
}
```

### Using the UserProfile Component

```typescript
import { UserProfile } from '@yukemuri/plugin-auth';
import { useAuth } from '@yukemuri/plugin-auth';
import { useUser } from '@yukemuri/plugin-auth';

function ProfilePage() {
  const { logout, token } = useAuth('/api/auth');
  const { user, isLoading, updateProfile } = useUser(token, '/api/auth');

  return (
    <UserProfile
      user={user}
      onLogout={logout}
      onUpdate={updateProfile}
      isLoading={isLoading}
    />
  );
}
```

### Using the AuthGuard Component

```typescript
import { AuthGuard } from '@yukemuri/plugin-auth';
import { useAuth } from '@yukemuri/plugin-auth';

function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth('/api/auth');

  return (
    <AuthGuard 
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
      fallback="<div>Please log in to access this page</div>"
    >
      <h1>Dashboard Content</h1>
    </AuthGuard>
  );
}
```

## Using Utility Functions

### JWT Utilities

```typescript
import { JWTUtils } from '@yukemuri/plugin-auth';

// Sign a token
const token = JWTUtils.sign(
  { userId: '123', email: 'user@example.com' },
  'secret-key',
  '7d'
);

// Verify a token
const payload = JWTUtils.verify(token, 'secret-key');
if (payload) {
  console.log('Token is valid:', payload);
} else {
  console.log('Token is invalid or expired');
}

// Decode token without verification
const decoded = JWTUtils.decode(token);
console.log('Payload:', decoded);
```

### Password Utilities

```typescript
import { PasswordUtils } from '@yukemuri/plugin-auth';

// Hash a password
const hash = PasswordUtils.hash('user-password', 12);
console.log('Password hash:', hash);

// Verify a password
const isValid = PasswordUtils.verify('user-password', hash);
console.log('Password is valid:', isValid);

// Generate random token
const resetToken = PasswordUtils.generateToken(32);
console.log('Reset token:', resetToken);
```

### User Management Utilities

```typescript
import { UserUtils } from '@yukemuri/plugin-auth';

// Create a new user
try {
  const user = UserUtils.createUser(
    'user@example.com',
    'secure-password',
    { name: 'John Doe' }
  );
  console.log('User created:', user);
} catch (error) {
  console.error('User creation failed:', error);
}

// Find user by email
const user = UserUtils.findByEmail('user@example.com');
if (user) {
  console.log('Found user:', user);
}

// Authenticate user
const authenticatedUser = UserUtils.authenticate(
  'user@example.com',
  'secure-password'
);
if (authenticatedUser) {
  console.log('Authentication successful:', authenticatedUser);
}

// Update user profile
const updatedUser = UserUtils.updateProfile('user-id', {
  name: 'Jane Doe',
  avatar: 'https://example.com/avatar.jpg'
});
console.log('Updated user:', updatedUser);
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `jwtSecret` | string | required | Secret key for JWT signing |
| `jwtExpiry` | string | '7d' | Token expiry time (e.g., '24h', '7d') |
| `bcryptRounds` | number | 12 | PBKDF2 hashing iterations |
| `providers` | array | [] | OAuth providers configuration |
| `loginRoute` | string | '/auth/login' | Login route path |
| `logoutRoute` | string | '/auth/logout' | Logout route path |
| `protectedRoutes` | array | ['/api/protected/*'] | Routes requiring authentication |

## Middleware Behavior

The auth middleware automatically protects routes matching the `protectedRoutes` pattern:

- Checks for `Authorization: Bearer <token>` header
- Validates and decodes JWT token
- Verifies user exists
- Sets user context for route handlers
- Returns 401 Unauthorized if validation fails

Protected route example:

```bash
# Request
GET /api/protected/data
Authorization: Bearer eyJhbGc...

# Response (if valid)
{
  "data": "user-specific-content"
}

# Response (if invalid)
{
  "error": "Unauthorized"
}
```

## Development Notes

- User data is stored in-memory and will be lost on server restart
- For production, integrate with a proper database
- Tokens are validated on each request to protected routes
- OAuth mock provider is for development testing only

## See Also

- [Yukemuri Core Documentation](../../core/README.md)
- [Plugin System](../../core/README.md#plugins)
