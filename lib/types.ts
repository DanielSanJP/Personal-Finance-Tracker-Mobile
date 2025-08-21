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
  userId: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: string;
  merchant: string;
  status: string;
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
