# Database Plugin for Yukemuri

A robust database plugin for Yukemuri that provides SQLite and Turso database management capabilities.

## Features

- **SQLite/Turso Support**: Connect to SQLite databases or Turso cloud databases
- **Type-Safe Queries**: Full TypeScript support with type-safe database operations
- **Transaction Support**: Execute database transactions with automatic rollback on errors
- **Connection Management**: Automatic connection handling with retry logic
- **Database Statistics**: Monitor table count, row count, and connection status
- **Table Management**: Create, drop, and inspect database tables
- **Backup Functionality**: Export database structure and data for backup purposes
- **Health Checks**: Built-in health check endpoints for monitoring

## Installation

```bash
# Using pnpm (recommended)
pnpm add @yukemuri/plugin-database

# Using npm
npm install @yukemuri/plugin-database
```

## Configuration

### Basic Setup

```typescript
import { databasePlugin } from '@yukemuri/plugin-database';

const config = {
  url: 'file:./app.db', // Local SQLite or Turso URL
  authToken: 'your-turso-token', // Optional, for Turso databases
  syncInterval: 3000, // Sync interval in ms
  maxRetries: 3 // Maximum retry attempts
};
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | string | - | Database connection URL (required) |
| `authToken` | string | undefined | Authentication token for Turso |
| `syncInterval` | number | 3000 | Sync interval in milliseconds |
| `maxRetries` | number | 3 | Maximum number of retry attempts |

## Usage

### Basic Initialization

```typescript
import { Hono } from 'hono';
import { databasePlugin } from '@yukemuri/plugin-database';

const app = new Hono();

// Register the database plugin
await databasePlugin.init(
  {
    url: 'file:./app.db',
    authToken: process.env.DATABASE_TOKEN
  },
  app
);

// Access database from app context
const db = (app as any).db;
```

### Executing Queries

#### Select Queries

```typescript
// Single row query
const user = await db.queryOne<User>(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// Multiple rows query
const users = await db.queryAll<User>(
  'SELECT * FROM users WHERE active = ?',
  [true]
);

// Execute with full control
const result = await db.execute<User>(
  'SELECT * FROM users WHERE created_at > ?',
  [new Date('2024-01-01')]
);

console.log(result.rows); // User[]
console.log(result.columns); // string[]
console.log(result.rowsAffected); // number
```

#### Insert Queries

```typescript
// Insert and get last ID
const userId = await db.insert(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['John Doe', 'john@example.com']
);

console.log(userId); // 1
```

#### Update Queries

```typescript
// Update and get affected rows
const rowsAffected = await db.update(
  'UPDATE users SET name = ? WHERE id = ?',
  ['Jane Doe', userId]
);

console.log(rowsAffected); // 1
```

#### Delete Queries

```typescript
// Delete and get affected rows
const rowsAffected = await db.delete(
  'DELETE FROM users WHERE id = ?',
  [userId]
);

console.log(rowsAffected); // 1
```

### Transaction Support

```typescript
// Run multiple queries in a transaction
try {
  await db.transaction(async (tx) => {
    // Create order
    const orderId = await tx.insert(
      'INSERT INTO orders (user_id, total) VALUES (?, ?)',
      [userId, 100.00]
    );

    // Create order items
    await tx.insert(
      'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
      [orderId, productId, 2]
    );

    // Update inventory
    await tx.update(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [2, productId]
    );
  });
} catch (error) {
  // Transaction automatically rolled back on error
  console.error('Transaction failed:', error);
}
```

### Table Management

```typescript
// Create table with schema
await db.createTable('users', {
  id: 'INTEGER PRIMARY KEY',
  name: 'TEXT NOT NULL',
  email: 'TEXT UNIQUE',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
});

// Get table information
const tableInfo = await db.getTableInfo('users');
// Output: [
//   { name: 'id', type: 'INTEGER PRIMARY KEY', notnull: 0, pk: 1 },
//   { name: 'name', type: 'TEXT NOT NULL', notnull: 1, pk: 0 },
//   ...
// ]

// Drop table
await db.dropTable('users');
```

### Database Statistics

```typescript
// Get database stats
const stats = await db.getStats();
// Output: {
//   tableCount: 5,
//   totalRows: 1250,
//   isConnected: true
// }
```

### Backup

```typescript
// Export database as JSON
const backupBlob = await db.backup();

// Save to file (Node.js)
import fs from 'fs';
const buffer = await backupBlob.arrayBuffer();
fs.writeFileSync('backup.json', Buffer.from(buffer));
```

### Connection Management

```typescript
// Check connection status
const isConnected = db.getIsConnected();

// Reconnect to database
await db.disconnect();
await db.connect({
  url: 'file:./app.db',
  authToken: process.env.DATABASE_TOKEN
});
```

## API Endpoints

The plugin automatically registers the following endpoints:

### Health Check

```http
GET /api/health/db
```

Response (healthy):
```json
{
  "status": "healthy",
  "tables": 5,
  "totalRows": 1250
}
```

Response (error):
```json
{
  "status": "error",
  "message": "Connection failed"
}
```

### Database Statistics

```http
GET /api/db/stats
```

Response:
```json
{
  "tableCount": 5,
  "totalRows": 1250,
  "isConnected": true
}
```

### Table Information

```http
GET /api/db/tables/:name
```

Response:
```json
{
  "table": "users",
  "columns": [
    {
      "name": "id",
      "type": "INTEGER PRIMARY KEY",
      "notnull": 0,
      "pk": 1
    },
    {
      "name": "name",
      "type": "TEXT NOT NULL",
      "notnull": 1,
      "pk": 0
    }
  ]
}
```

## Type Definitions

### DatabaseConfig

```typescript
interface DatabaseConfig {
  url: string; // Database URL (required)
  authToken?: string; // Turso auth token
  syncInterval?: number; // Sync interval in ms
  maxRetries?: number; // Retry attempts
}
```

### QueryResult

```typescript
interface QueryResult<T = any> {
  rows: T[]; // Query result rows
  columns: string[]; // Column names
  rowsAffected: number; // Number of affected rows
  lastId?: number; // Last inserted ID
}
```

### DatabaseManager Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `connect` | `(config: DatabaseConfig) => Promise<void>` | Connect to database |
| `disconnect` | `() => Promise<void>` | Close connection |
| `execute` | `<T>(sql, params?) => Promise<QueryResult<T>>` | Execute query |
| `queryOne` | `<T>(sql, params?) => Promise<T \| null>` | Get single row |
| `queryAll` | `<T>(sql, params?) => Promise<T[]>` | Get all rows |
| `insert` | `(sql, params?) => Promise<number>` | Insert and return ID |
| `update` | `(sql, params?) => Promise<number>` | Update and return count |
| `delete` | `(sql, params?) => Promise<number>` | Delete and return count |
| `transaction` | `<T>(callback) => Promise<T>` | Run transaction |
| `createTable` | `(name, schema) => Promise<void>` | Create table |
| `dropTable` | `(name) => Promise<void>` | Drop table |
| `getTableInfo` | `(name) => Promise<TableInfo[]>` | Get table schema |
| `backup` | `() => Promise<Blob>` | Backup database |
| `getStats` | `() => Promise<Stats>` | Get database stats |

## Error Handling

```typescript
try {
  const user = await db.queryOne('SELECT * FROM users WHERE id = ?', [userId]);
} catch (error) {
  if (error instanceof Error) {
    console.error('Database error:', error.message);
    // Handle error
  }
}
```

## Best Practices

### 1. Use Parameterized Queries

```typescript
// ✅ Good - prevents SQL injection
await db.queryOne('SELECT * FROM users WHERE id = ?', [userId]);

// ❌ Bad - vulnerable to SQL injection
await db.queryOne(`SELECT * FROM users WHERE id = ${userId}`);
```

### 2. Use Type Annotations

```typescript
// ✅ Good - type-safe
interface User {
  id: number;
  name: string;
  email: string;
}

const user = await db.queryOne<User>('SELECT * FROM users WHERE id = ?', [1]);
```

### 3. Always Use Transactions for Related Operations

```typescript
// ✅ Good - atomic operations
await db.transaction(async (tx) => {
  const orderId = await tx.insert('INSERT INTO orders ...', []);
  await tx.insert('INSERT INTO order_items ...', [orderId]);
});

// ❌ Bad - not atomic, can fail halfway through
await db.insert('INSERT INTO orders ...', []);
await db.insert('INSERT INTO order_items ...', []);
```

### 4. Close Connection on Shutdown

```typescript
// Properly cleanup on app shutdown
process.on('SIGTERM', async () => {
  await db.disconnect();
  process.exit(0);
});
```

### 5. Monitor Database Health

```typescript
// Periodically check health
setInterval(async () => {
  const stats = await db.getStats();
  if (!stats.isConnected) {
    console.error('Database disconnected');
    // Implement reconnection logic
  }
}, 10000);
```

## Troubleshooting

### Connection Failed

**Problem**: "Database connection failed: connection refused"

**Solution**:
1. Check database URL format
2. Verify database server is running
3. Check authentication credentials
4. Verify network connectivity

```typescript
// Debug connection
try {
  await db.connect(config);
  console.log('Connected successfully');
} catch (error) {
  console.error('Connection error:', error);
}
```

### Query Errors

**Problem**: "Database query failed: syntax error"

**Solution**:
1. Check SQL syntax
2. Verify table and column names exist
3. Check parameter count matches placeholders

```typescript
// Verify table exists
const tables = await db.queryAll(
  "SELECT name FROM sqlite_master WHERE type='table'"
);
console.log('Available tables:', tables);
```

### Performance Issues

**Problem**: Slow queries

**Solution**:
1. Add database indexes
2. Optimize queries (use EXPLAIN PLAN)
3. Increase syncInterval for batch operations

```typescript
// Create index for faster queries
await db.execute('CREATE INDEX idx_user_email ON users(email)');

// Check query plan
const plan = await db.queryAll('EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = ?', [email]);
```

## Examples

### User Management

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

// Create users table
await db.createTable('users', {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  name: 'TEXT NOT NULL',
  email: 'TEXT UNIQUE NOT NULL',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
});

// Create user
const userId = await db.insert(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['Alice Johnson', 'alice@example.com']
);

// Get user
const user = await db.queryOne<User>(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// Update user
await db.update(
  'UPDATE users SET name = ? WHERE id = ?',
  ['Alice Smith', userId]
);

// Delete user
await db.delete(
  'DELETE FROM users WHERE id = ?',
  [userId]
);
```

### Blog Posts with Comments

```typescript
// Create tables
await db.createTable('posts', {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  title: 'TEXT NOT NULL',
  content: 'TEXT NOT NULL',
  author_id: 'INTEGER NOT NULL REFERENCES users(id)',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
});

await db.createTable('comments', {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  post_id: 'INTEGER NOT NULL REFERENCES posts(id)',
  author_id: 'INTEGER NOT NULL REFERENCES users(id)',
  content: 'TEXT NOT NULL',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
});

// Create post with comments in transaction
await db.transaction(async (tx) => {
  const postId = await tx.insert(
    'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
    ['My First Post', 'This is my first blog post', userId]
  );

  await tx.insert(
    'INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)',
    [postId, userId, 'Great post!']
  );
});
```

## Migration Guide

### From Manual Database Handling

**Before**:
```typescript
// Manual database setup
import Database from 'better-sqlite3';
const db = new Database('./app.db');
const result = db.prepare('SELECT * FROM users').all();
```

**After**:
```typescript
// Using Yukemuri database plugin
const users = await db.queryAll('SELECT * FROM users');
```

## Performance Tips

1. **Batch Operations**: Use transactions for multiple related operations
2. **Connection Pooling**: Reuse database connections
3. **Indexes**: Create indexes on frequently queried columns
4. **Caching**: Cache frequently accessed data
5. **Query Optimization**: Use EXPLAIN to optimize slow queries

## Security Considerations

1. **SQL Injection**: Always use parameterized queries
2. **Authentication**: Use strong auth tokens for Turso
3. **Data Validation**: Validate input before database operations
4. **Backups**: Regularly backup your database
5. **Access Control**: Implement proper access control in your application

## Support

For issues, feature requests, or questions about the database plugin, please refer to the main Yukemuri documentation or open an issue on the project repository.

## License

MIT License - See LICENSE file for details
