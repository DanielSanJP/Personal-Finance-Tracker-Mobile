import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency with user preferences
 * @param amount - The amount to format
 * @param currency - Currency code (USD, EUR, GBP, CAD, AUD, NZD) - defaults to USD
 * @param showCents - Whether to show decimal places - defaults to true
 */
export function formatCurrency(
  amount: number, 
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'NZD' = 'USD',
  showCents: boolean = true
): string {
  // Get locale based on currency
  const localeMap: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'CAD': 'en-CA',
    'AUD': 'en-AU',
    'NZD': 'en-NZ',
  };

  const locale = localeMap[currency] || 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'NZD' = 'USD'): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'NZD': 'NZ$',
  };
  return symbols[currency] || '$';
}
