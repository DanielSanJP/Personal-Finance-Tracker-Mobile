// Type definitions for the personal finance tracker mobile app

export interface Account {
  id: string;
  userId: string;
  name: string;
  balance: number;
  type: string;
  accountNumber: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  user_id: string; // This will be converted from UUID to string
  account_id: string;
  date: string; // Timestamp with time zone, converted to ISO string (e.g., "2025-10-08T14:30:00.000Z")
  description: string;
  amount: number;
  category: string | null;
  type: 'income' | 'expense' | 'transfer';
  // New universal party system (replaces merchant)
  from_party: string | null;
  to_party: string | null;
  destination_account_id?: string | null; // For transfers and goal contributions
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  created_at: string; // Timestamp will be converted to string
  updated_at: string; // Timestamp will be converted to string
}

export interface User {
  id: string;
  // Fields from public.users table
  first_name: string;
  last_name: string;
  initials: string;
  avatar?: string | null;
  
  // Fields from auth.users table (accessed via auth context)
  email: string;
  display_name?: string;
  
  // Legacy support (will be removed eventually)
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category?: string;
  priority?: string;
  status: string;
}

export interface Summary {
  id?: number;
  userId: string;
  totalBalance: number;
  monthlyChange: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  budgetRemaining: number;
  accountBreakdown: Record<string, unknown>;
  categorySpending: Record<string, unknown>;
  lastUpdated?: string;
}

// Auth related types
export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// User Preferences types
export interface UserPreferences {
  id: string;
  user_id: string;
  // Appearance Settings
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'NZD';
  language: 'English' | 'Español' | 'Français' | 'Deutsch' | 'Italiano';
  // Notification Settings
  email_notifications: boolean;
  budget_alerts: boolean;
  goal_reminders: boolean;
  weekly_reports: boolean;
  // Display Options
  show_account_numbers: boolean;
  compact_view: boolean;
  show_cents: boolean;
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface UpdateUserPreferences {
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'NZD';
  language?: 'English' | 'Español' | 'Français' | 'Deutsch' | 'Italiano';
  email_notifications?: boolean;
  budget_alerts?: boolean;
  goal_reminders?: boolean;
  weekly_reports?: boolean;
  show_account_numbers?: boolean;
  compact_view?: boolean;
  show_cents?: boolean;
}
