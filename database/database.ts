import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

export interface DatabaseConfig {
  dbPath?: string; // If undefined or ':memory:', runs in memory
  wasmBinaryPath?: string;
}

export class TaskBuddyDatabase {
  private db: SqlJsDatabase | null = null;
  private dbPath: string | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;

  async init(config?: DatabaseConfig): Promise<void> {
    const wasmLocate = (file: string) => {
      if (config?.wasmBinaryPath && fs.existsSync(config.wasmBinaryPath)) {
        return config.wasmBinaryPath;
      }
      const resourcesPath = (process as any).resourcesPath;
      // Common locations
      const possiblePaths = [
        resourcesPath ? path.join(resourcesPath, file) : '',
        resourcesPath ? path.join(resourcesPath, 'assets', file) : '',
        path.join(__dirname, file),
        path.join(__dirname, '../node_modules/sql.js/dist', file),
        path.join(__dirname, '../../node_modules/sql.js/dist', file),
        path.join(process.cwd(), 'node_modules/sql.js/dist', file),
        path.join(process.cwd(), file),
      ].filter(Boolean);
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) return p;
      }
      return file;
    };

    const resolvedWasmPath = wasmLocate('sql-wasm.wasm');
    let wasmBinary: ArrayBuffer | undefined = undefined;
    if (fs.existsSync(resolvedWasmPath)) {
      const buf = fs.readFileSync(resolvedWasmPath);
      wasmBinary = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }

    const SQL = await initSqlJs({
      locateFile: wasmLocate,
      wasmBinary,
    });

    if (config?.dbPath && config.dbPath !== ':memory:') {
      this.dbPath = config.dbPath;
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.dbPath)) {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer);
      } else {
        this.db = new SQL.Database();
        this.persistImmediate();
      }
    } else {
      this.dbPath = null;
      this.db = new SQL.Database();
    }

    this.runMigrations();
  }

  getRawDatabase(): SqlJsDatabase {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  private runMigrations(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON;');

    // Migrations table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);

    const appliedVersions = this.all<{ version: number }>(
      'SELECT version FROM migrations'
    ).map((r) => r.version);

    // Migration 1: Base schema
    if (!appliedVersions.includes(1)) {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT NOT NULL CHECK(category IN ('online_tests', 'hackathons', 'reviews', 'presentations', 'academics', 'personal', 'other')),
          deadline_at TEXT NOT NULL,
          priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
          status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'canceled')),
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          completed_at TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
        CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline_at);

        CREATE TABLE IF NOT EXISTS reminders (
          id TEXT PRIMARY KEY,
          task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
          reminder_type TEXT NOT NULL CHECK(reminder_type IN ('two_day', 'one_day', 'deadline_day', 'overdue', 'custom')),
          scheduled_at TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'delivered', 'dismissed', 'snoozed', 'canceled', 'failed')),
          delivered_at TEXT,
          snoozed_until TEXT,
          attempt_count INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE(task_id, reminder_type)
        );

        CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_status ON reminders(status, scheduled_at);
        CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON reminders(task_id);

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);

      this.run('INSERT INTO migrations (version, applied_at) VALUES (?, ?)', [
        1,
        new Date().toISOString(),
      ]);
    }

    // Migration 2: Add next_action and destination_url to tasks
    if (!appliedVersions.includes(2)) {
      try {
        this.db.run(`ALTER TABLE tasks ADD COLUMN next_action TEXT;`);
      } catch {
        // column may already exist
      }
      try {
        this.db.run(`ALTER TABLE tasks ADD COLUMN destination_url TEXT;`);
      } catch {
        // column may already exist
      }

      this.run('INSERT INTO migrations (version, applied_at) VALUES (?, ?)', [
        2,
        new Date().toISOString(),
      ]);
    }

    // Migration 3: Add remind_at to tasks
    if (!appliedVersions.includes(3)) {
      try {
        this.db.run(`ALTER TABLE tasks ADD COLUMN remind_at TEXT;`);
      } catch {
        // column may already exist
      }

      this.run('INSERT INTO migrations (version, applied_at) VALUES (?, ?)', [
        3,
        new Date().toISOString(),
      ]);
    }

    this.persistImmediate();
  }

  run(sql: string, params: (string | number | null | undefined)[] = []): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.run(sql, params as (string | number | null)[]);
    this.scheduleSave();
  }

  get<T = any>(sql: string, params: (string | number | null | undefined)[] = []): T | null {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(params as (string | number | null)[]);
      if (stmt.step()) {
        const obj = stmt.getAsObject() as T;
        return obj;
      }
      return null;
    } finally {
      stmt.free();
    }
  }

  all<T = any>(sql: string, params: (string | number | null | undefined)[] = []): T[] {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(sql);
    const results: T[] = [];
    try {
      stmt.bind(params as (string | number | null)[]);
      while (stmt.step()) {
        results.push(stmt.getAsObject() as T);
      }
      return results;
    } finally {
      stmt.free();
    }
  }

  private scheduleSave(): void {
    if (!this.dbPath) return;
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.persistImmediate();
    }, 100);
  }

  persistImmediate(): void {
    if (!this.db || !this.dbPath) return;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      // Atomic write using a temp file
      const tempPath = `${this.dbPath}.tmp`;
      fs.writeFileSync(tempPath, buffer);
      fs.renameSync(tempPath, this.dbPath);
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  close(): void {
    this.persistImmediate();
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
