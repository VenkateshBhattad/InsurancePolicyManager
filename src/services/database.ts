/**
 * SQLite Database Service
 * Handles all database operations with offline-first architecture
 */

import * as SQLite from 'expo-sqlite';
import { Client, Policy, DatabaseMigration, QueryResult } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  // Database version for migrations
  private readonly DB_VERSION = 1;
  private readonly DB_NAME = 'insurance_policy_manager.db';

  /**
   * Initialize database connection and run migrations
   */
  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(this.DB_NAME);
      await this.runMigrations();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const migrations: DatabaseMigration[] = [
      {
        version: 1,
        description: 'Create initial tables',
        sql: `
          -- Create clients table
          CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            dateOfBirth TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
          );

          -- Create policies table
          CREATE TABLE IF NOT EXISTS policies (
            id TEXT PRIMARY KEY,
            policyNumber TEXT NOT NULL UNIQUE,
            clientId TEXT NOT NULL,
            policyType TEXT NOT NULL,
            premiumAmount REAL NOT NULL,
            startDate TEXT NOT NULL,
            endDate TEXT NOT NULL,
            status TEXT NOT NULL,
            insuranceCompany TEXT NOT NULL,
            agentNotes TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            FOREIGN KEY (clientId) REFERENCES clients (id) ON DELETE CASCADE
          );

          -- Create renewal_reminders table
          CREATE TABLE IF NOT EXISTS renewal_reminders (
            id TEXT PRIMARY KEY,
            policyId TEXT NOT NULL,
            reminderDate TEXT NOT NULL,
            reminderType TEXT NOT NULL,
            sent INTEGER DEFAULT 0,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (policyId) REFERENCES policies (id) ON DELETE CASCADE
          );

          -- Create sync_log table for tracking changes
          CREATE TABLE IF NOT EXISTS sync_log (
            id TEXT PRIMARY KEY,
            tableName TEXT NOT NULL,
            recordId TEXT NOT NULL,
            operation TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            synced INTEGER DEFAULT 0
          );

          -- Create indexes for better performance
          CREATE INDEX IF NOT EXISTS idx_policies_client_id ON policies(clientId);
          CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
          CREATE INDEX IF NOT EXISTS idx_policies_end_date ON policies(endDate);
          CREATE INDEX IF NOT EXISTS idx_reminders_policy_id ON renewal_reminders(policyId);
          CREATE INDEX IF NOT EXISTS idx_reminders_date ON renewal_reminders(reminderDate);
          CREATE INDEX IF NOT EXISTS idx_sync_log_table_record ON sync_log(tableName, recordId);
        `
      }
    ];

    // Get current database version
    const currentVersion = await this.getDatabaseVersion();

    // Run migrations if needed
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        console.log(`Running migration ${migration.version}: ${migration.description}`);
        await this.db.execAsync(migration.sql);
        await this.setDatabaseVersion(migration.version);
      }
    }
  }

  /**
   * Get current database version
   */
  private async getDatabaseVersion(): Promise<number> {
    if (!this.db) return 0;

    try {
      const result = await this.db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
      );
      return result?.user_version || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Set database version
   */
  private async setDatabaseVersion(version: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execAsync(`PRAGMA user_version = ${version}`);
  }

  /**
   * Execute a query and return results
   */
  private async executeQuery<T>(
    sql: string,
    params: any[] = []
  ): Promise<QueryResult<T>> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync<T>(sql, params);
      return {
        rows: result,
        rowsAffected: result.length,
      };
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute an insert/update/delete query
   */
  private async executeUpdate(
    sql: string,
    params: any[] = []
  ): Promise<{ rowsAffected: number; insertId?: number }> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.runAsync(sql, params);
      return {
        rowsAffected: result.changes,
        insertId: result.lastInsertRowId,
      };
    } catch (error) {
      console.error('Update execution failed:', error);
      throw error;
    }
  }

  // Client operations
  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    await this.executeUpdate(
      `INSERT INTO clients (id, firstName, lastName, email, phone, address, dateOfBirth, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, client.firstName, client.lastName, client.email, client.phone, 
       client.address, client.dateOfBirth, now, now]
    );

    await this.logChange('clients', id, 'INSERT');
    return id;
  }

  async getClient(id: string): Promise<Client | null> {
    const result = await this.executeQuery<Client>(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );
    return result.rows[0] || null;
  }

  async getAllClients(): Promise<Client[]> {
    const result = await this.executeQuery<Client>(
      'SELECT * FROM clients ORDER BY lastName, firstName'
    );
    return result.rows;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<void> {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => updates[field as keyof Client]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await this.executeUpdate(
      `UPDATE clients SET ${setClause}, updatedAt = ? WHERE id = ?`,
      [...values, new Date().toISOString(), id]
    );

    await this.logChange('clients', id, 'UPDATE');
  }

  async deleteClient(id: string): Promise<void> {
    await this.executeUpdate('DELETE FROM clients WHERE id = ?', [id]);
    await this.logChange('clients', id, 'DELETE');
  }

  // Policy operations
  async createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    await this.executeUpdate(
      `INSERT INTO policies (id, policyNumber, clientId, policyType, premiumAmount, 
       startDate, endDate, status, insuranceCompany, agentNotes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, policy.policyNumber, policy.clientId, policy.policyType, policy.premiumAmount,
       policy.startDate, policy.endDate, policy.status, policy.insuranceCompany,
       policy.agentNotes, now, now]
    );

    await this.logChange('policies', id, 'INSERT');
    return id;
  }

  async getPolicy(id: string): Promise<Policy | null> {
    const result = await this.executeQuery<Policy>(
      'SELECT * FROM policies WHERE id = ?',
      [id]
    );
    return result.rows[0] || null;
  }

  async getAllPolicies(): Promise<Policy[]> {
    const result = await this.executeQuery<Policy>(
      'SELECT * FROM policies ORDER BY endDate DESC'
    );
    return result.rows;
  }

  async getPoliciesByClient(clientId: string): Promise<Policy[]> {
    const result = await this.executeQuery<Policy>(
      'SELECT * FROM policies WHERE clientId = ? ORDER BY endDate DESC',
      [clientId]
    );
    return result.rows;
  }

  async updatePolicy(id: string, updates: Partial<Policy>): Promise<void> {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => updates[field as keyof Policy]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await this.executeUpdate(
      `UPDATE policies SET ${setClause}, updatedAt = ? WHERE id = ?`,
      [...values, new Date().toISOString(), id]
    );

    await this.logChange('policies', id, 'UPDATE');
  }

  async deletePolicy(id: string): Promise<void> {
    await this.executeUpdate('DELETE FROM policies WHERE id = ?', [id]);
    await this.logChange('policies', id, 'DELETE');
  }

  /**
   * Log database changes for sync purposes
   */
  private async logChange(tableName: string, recordId: string, operation: string): Promise<void> {
    const id = this.generateId();
    const timestamp = new Date().toISOString();
    
    await this.executeUpdate(
      'INSERT INTO sync_log (id, tableName, recordId, operation, timestamp) VALUES (?, ?, ?, ?, ?)',
      [id, tableName, recordId, operation, timestamp]
    );
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get database instance (for advanced operations)
   */
  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
