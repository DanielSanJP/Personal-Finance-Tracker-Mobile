// Utility functions for the personal finance tracker

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getCurrentMonthName = () => {
  return new Date().toLocaleString('default', { month: 'long' });
};

// Format date to YYYY-MM-DD in local timezone (avoids UTC conversion issues)
export const formatDateForDatabase = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
