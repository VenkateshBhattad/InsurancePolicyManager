/**
 * Core data models for Insurance Policy Management App
 */

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface Policy {
  id: string;
  policyNumber: string;
  clientId: string;
  policyType: PolicyType;
  premiumAmount: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: PolicyStatus;
  insuranceCompany: string;
  agentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PolicyType {
  AUTO = 'auto',
  HOME = 'home',
  LIFE = 'life',
  HEALTH = 'health',
  BUSINESS = 'business',
  OTHER = 'other'
}

export enum PolicyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending'
}

export interface RenewalReminder {
  id: string;
  policyId: string;
  reminderDate: string;
  reminderType: ReminderType;
  sent: boolean;
  createdAt: string;
}

export enum ReminderType {
  SEVEN_DAYS = '7_days',
  FIFTEEN_DAYS = '15_days',
  THIRTY_DAYS = '30_days',
  SIXTY_DAYS = '60_days',
  NINETY_DAYS = '90_days'
}

export interface DashboardStats {
  totalPolicies: number;
  activePolicies: number;
  expiredPolicies: number;
  upcomingRenewals: number;
  totalClients: number;
  totalPremiumValue: number;
}

export interface SyncStatus {
  lastSyncDate: string | null;
  isOnline: boolean;
  isSyncing: boolean;
  hasConflicts: boolean;
  pendingChanges: number;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  reminderIntervals: ReminderType[];
  autoSyncEnabled: boolean;
  darkModeEnabled: boolean;
  biometricAuthEnabled: boolean;
  googleSheetsConnected: boolean;
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  PolicyDetails: { policyId: string };
  AddEditPolicy: { policyId?: string; clientId?: string };
  ClientDetails: { clientId: string };
  AddEditClient: { clientId?: string };
  Settings: undefined;
  Auth: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Policies: undefined;
  Clients: undefined;
  Calendar: undefined;
  Settings: undefined;
};

// Form types
export interface PolicyFormData {
  policyNumber: string;
  clientId: string;
  policyType: PolicyType;
  premiumAmount: string;
  startDate: Date;
  endDate: Date;
  status: PolicyStatus;
  insuranceCompany: string;
  agentNotes?: string;
}

export interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: Date;
}

// API types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  clientsSheetName: string;
  policiesSheetName: string;
}

// Filter and search types
export interface PolicyFilters {
  status?: PolicyStatus[];
  type?: PolicyType[];
  clientId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

export interface ClientFilters {
  searchQuery?: string;
  hasActivePolicies?: boolean;
}

// Notification types
export interface NotificationData {
  type: 'renewal_reminder' | 'policy_expired' | 'sync_complete';
  policyId?: string;
  clientId?: string;
  title: string;
  body: string;
  data?: any;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Database types
export interface DatabaseMigration {
  version: number;
  sql: string;
  description: string;
}

export interface QueryResult<T> {
  rows: T[];
  rowsAffected: number;
  insertId?: number;
}
