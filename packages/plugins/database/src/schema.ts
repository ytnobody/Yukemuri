import type { DatabaseManager } from "./manager"

/**
 * Migration interface
 */
export interface Migration {
  name: string
  up: (db: DatabaseManager) => Promise<void>
  down: (db: DatabaseManager) => Promise<void>
}

/**
 * Schema definition interface
 */
export interface TableSchema {
  name: string
  columns: Record<string, string>
  indexes?: Array<{ name: string; columns: string[] }>
}

/**
 * Migration runner for database schema management
 */
export class MigrationRunner {
  private migrations: Map<string, Migration> = new Map()
  private executed: Set<string> = new Set()

  /**
   * Register a migration
   */
  register(migration: Migration): void {
    this.migrations.set(migration.name, migration)
  }

  /**
   * Run all pending migrations
   */
  async runAll(db: DatabaseManager): Promise<void> {
    this.migrations.forEach(async (migration, name) => {
      if (!this.executed.has(name)) {
        try {
          await migration.up(db)
          this.executed.add(name)
          console.log(`Migration executed: ${name}`)
        } catch (error) {
          console.error(`Migration failed: ${name}`, error)
          throw error
        }
      }
    })
  }

  /**
   * Rollback specific migration
   */
  async rollback(db: DatabaseManager, name: string): Promise<void> {
    const migration = this.migrations.get(name)
    if (!migration) {
      throw new Error(`Migration not found: ${name}`)
    }

    try {
      await migration.down(db)
      this.executed.delete(name)
      console.log(`Migration rolled back: ${name}`)
    } catch (error) {
      console.error(`Rollback failed: ${name}`, error)
      throw error
    }
  }

  /**
   * Get list of executed migrations
   */
  getExecuted(): string[] {
    return Array.from(this.executed)
  }

  /**
   * Get list of pending migrations
   */
  getPending(): string[] {
    return Array.from(this.migrations.keys()).filter(name => !this.executed.has(name))
  }
}

/**
 * Schema builder for type-safe table creation
 */
export class SchemaBuilder {
  private table: TableSchema

  constructor(name: string) {
    this.table = {
      name,
      columns: {},
      indexes: [],
    }
  }

  /**
   * Add primary key column
   */
  id(): SchemaBuilder {
    this.table.columns.id = "INTEGER PRIMARY KEY AUTOINCREMENT"
    return this
  }

  /**
   * Add string column
   */
  string(name: string, length?: number): SchemaBuilder {
    const type = length ? `VARCHAR(${length})` : "TEXT"
    this.table.columns[name] = type
    return this
  }

  /**
   * Add integer column
   */
  integer(name: string): SchemaBuilder {
    this.table.columns[name] = "INTEGER"
    return this
  }

  /**
   * Add float column
   */
  float(name: string): SchemaBuilder {
    this.table.columns[name] = "REAL"
    return this
  }

  /**
   * Add boolean column
   */
  boolean(name: string): SchemaBuilder {
    this.table.columns[name] = "BOOLEAN"
    return this
  }

  /**
   * Add timestamp column
   */
  timestamp(name: string): SchemaBuilder {
    this.table.columns[name] = "TIMESTAMP"
    return this
  }

  /**
   * Add created_at timestamp
   */
  timestamps(): SchemaBuilder {
    this.table.columns.created_at = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    this.table.columns.updated_at = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    return this
  }

  /**
   * Add JSON column
   */
  json(name: string): SchemaBuilder {
    this.table.columns[name] = "JSON"
    return this
  }

  /**
   * Add text column
   */
  text(name: string): SchemaBuilder {
    this.table.columns[name] = "TEXT"
    return this
  }

  /**
   * Add index
   */
  index(...columns: string[]): SchemaBuilder {
    this.table.indexes = this.table.indexes || []
    this.table.indexes.push({
      name: `idx_${columns.join("_")}`,
      columns,
    })
    return this
  }

  /**
   * Make column unique
   */
  unique(name: string): SchemaBuilder {
    const current = this.table.columns[name] || ""
    this.table.columns[name] = `${current} UNIQUE`
    return this
  }

  /**
   * Make column not null
   */
  notNull(name: string): SchemaBuilder {
    const current = this.table.columns[name] || ""
    this.table.columns[name] = `${current} NOT NULL`
    return this
  }

  /**
   * Add foreign key
   */
  foreignKey(name: string, table: string, column: string = "id"): SchemaBuilder {
    const current = this.table.columns[name] || "INTEGER"
    this.table.columns[name] = `${current} REFERENCES ${table}(${column})`
    return this
  }

  /**
   * Build and return schema
   */
  build(): TableSchema {
    return this.table
  }

  /**
   * Create SQL for table
   */
  toSQL(): string {
    const columns = Object.entries(this.table.columns)
      .map(([name, type]) => `${name} ${type}`)
      .join(", ")

    return `CREATE TABLE IF NOT EXISTS ${this.table.name} (${columns})`
  }

  /**
   * Create table in database
   */
  async create(db: DatabaseManager): Promise<void> {
    await db.execute(this.toSQL())

    // Create indexes if specified
    if (this.table.indexes) {
      for (const index of this.table.indexes) {
        const indexSQL = `CREATE INDEX IF NOT EXISTS ${index.name} ON ${this.table.name}(${index.columns.join(", ")})`
        await db.execute(indexSQL)
      }
    }
  }
}

/**
 * Database seeder for test data
 */
export class Seeder {
  private seeds: Array<{ name: string; run: (db: DatabaseManager) => Promise<void> }> = []

  /**
   * Register seed
   */
  register(name: string, run: (db: DatabaseManager) => Promise<void>): void {
    this.seeds.push({ name, run })
  }

  /**
   * Run all seeds
   */
  async runAll(db: DatabaseManager): Promise<void> {
    for (const seed of this.seeds) {
      try {
        await seed.run(db)
        console.log(`Seed executed: ${seed.name}`)
      } catch (error) {
        console.error(`Seed failed: ${seed.name}`, error)
        throw error
      }
    }
  }

  /**
   * Run specific seed
   */
  async run(db: DatabaseManager, name: string): Promise<void> {
    const seed = this.seeds.find(s => s.name === name)
    if (!seed) {
      throw new Error(`Seed not found: ${name}`)
    }

    try {
      await seed.run(db)
      console.log(`Seed executed: ${name}`)
    } catch (error) {
      console.error(`Seed failed: ${name}`, error)
      throw error
    }
  }
}

/**
 * Create migration
 */
export function createMigration(
  name: string,
  up: (db: DatabaseManager) => Promise<void>,
  down: (db: DatabaseManager) => Promise<void>
): Migration {
  return { name, up, down }
}

/**
 * Create seed
 */
export function createSeed(
  name: string,
  run: (db: DatabaseManager) => Promise<void>
): { name: string; run: (db: DatabaseManager) => Promise<void> } {
  return { name, run }
}
