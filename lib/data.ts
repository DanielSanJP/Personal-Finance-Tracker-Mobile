import usersData from '../data/users.json';
import accountsData from '../data/accounts.json';
import transactionsData from '../data/transactions.json';
import budgetsData from '../data/budgets.json';
import goalsData from '../data/goals.json';
import summaryData from '../data/summary.json';

// User functions
export const getCurrentUser = () => usersData.users[0]; // For prototype, return Daniel M.

export const getUserById = (userId: string) => {
  return usersData.users.find(user => user.id === userId);
};

// Account functions
export const getAccountsByUserId = (userId: string) => {
  return accountsData.accounts.filter(account => account.userId === userId);
};

export const getCurrentUserAccounts = () => {
  const currentUser = getCurrentUser();
  return getAccountsByUserId(currentUser.id);
};

// Transaction functions
export const getTransactionsByUserId = (userId: string) => {
  return transactionsData.transactions.filter(transaction => transaction.userId === userId);
};

export const getCurrentUserTransactions = () => {
  const currentUser = getCurrentUser();
  return getTransactionsByUserId(currentUser.id);
};

export const getTransactionsByAccountId = (accountId: string) => {
  return transactionsData.transactions.filter(transaction => transaction.accountId === accountId);
};

// Budget functions
export const getBudgetsByUserId = (userId: string) => {
  return budgetsData.budgets.filter(budget => budget.userId === userId);
};

export const getCurrentUserBudgets = () => {
  const currentUser = getCurrentUser();
  return getBudgetsByUserId(currentUser.id);
};

// Goal functions
export const getGoalsByUserId = (userId: string) => {
  return goalsData.goals.filter(goal => goal.userId === userId);
};

export const getCurrentUserGoals = () => {
  const currentUser = getCurrentUser();
  return getGoalsByUserId(currentUser.id);
};

// Summary functions
export const getCurrentUserSummary = () => {
  return summaryData.summary;
};

// Helper functions
export const getTotalBalanceForUser = (userId: string) => {
  const accounts = getAccountsByUserId(userId);
  return accounts.reduce((total, account) => total + account.balance, 0);
};

export const getMonthlyExpensesForUser = (userId: string) => {
  const transactions = getTransactionsByUserId(userId);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear &&
           transaction.amount < 0;
  });
};

export const getMonthlyIncomeForUser = (userId: string) => {
  const transactions = getTransactionsByUserId(userId);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear &&
           transaction.amount > 0;
  });
};

// Format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
