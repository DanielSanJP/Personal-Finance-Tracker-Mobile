/**
 * Currency and number input utilities
 * Handles various number formats including commas, multiple decimals, etc.
 */

/**
 * Parse a currency string into a valid number
 * Handles:
 * - Commas: "1,000.50" -> 1000.50
 * - Multiple decimals: "1.000.50" -> 1000.50 (European format)
 * - Spaces: "1 000.50" -> 1000.50
 * - Currency symbols: "$1,000.50" -> 1000.50
 * - Invalid input: returns NaN
 * 
 * @param input - The string to parse
 * @returns The parsed number or NaN if invalid
 */
export function parseCurrencyInput(input: string | number): number {
  // If already a number, return it
  if (typeof input === 'number') {
    return input;
  }

  // If empty or null/undefined, return NaN
  if (!input || input.trim() === '') {
    return NaN;
  }

  // Remove currency symbols, spaces, and letters
  let cleaned = input
    .toString()
    .replace(/[$€£¥₹]/g, '') // Remove currency symbols
    .replace(/\s/g, '') // Remove spaces
    .replace(/[a-zA-Z]/g, ''); // Remove letters

  // Count decimal points and commas to determine format
  const decimalCount = (cleaned.match(/\./g) || []).length;
  const commaCount = (cleaned.match(/,/g) || []).length;

  // Determine if using European format (1.000,50) or US format (1,000.50)
  if (commaCount > 0 && decimalCount > 0) {
    // If last separator is comma, it's European format
    const lastCommaIndex = cleaned.lastIndexOf(',');
    const lastDotIndex = cleaned.lastIndexOf('.');
    
    if (lastCommaIndex > lastDotIndex) {
      // European format: 1.000.000,50
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,000,000.50
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (commaCount > 0 && decimalCount === 0) {
    // Only commas present
    if (commaCount === 1) {
      // Could be decimal (European) or thousands separator
      // Check position: if last 3 chars or less, likely decimal
      const commaIndex = cleaned.lastIndexOf(',');
      const charsAfterComma = cleaned.length - commaIndex - 1;
      
      if (charsAfterComma <= 2) {
        // Likely decimal: 100,50
        cleaned = cleaned.replace(',', '.');
      } else {
        // Likely thousands: 1,000
        cleaned = cleaned.replace(/,/g, '');
      }
    } else {
      // Multiple commas: treat as thousands separators
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (decimalCount > 1) {
    // Multiple dots: European thousands separator
    // Keep only the last dot as decimal
    const lastDotIndex = cleaned.lastIndexOf('.');
    cleaned = cleaned.substring(0, lastDotIndex).replace(/\./g, '') + 
              cleaned.substring(lastDotIndex);
  }

  // Parse the cleaned string
  const result = parseFloat(cleaned);
  
  return result;
}

/**
 * Validate if a currency input string can be parsed to a valid positive number
 * Also checks against database constraints (NUMERIC(10,2) max = 99,999,999.99)
 * 
 * @param input - The string to validate
 * @returns true if valid positive number within database limits, false otherwise
 */
export function isValidCurrencyInput(input: string | number): boolean {
  const parsed = parseCurrencyInput(input);
  // Database field is NUMERIC(10,2): max value is 99,999,999.99
  const MAX_AMOUNT = 99999999.99;
  return !isNaN(parsed) && isFinite(parsed) && parsed > 0 && parsed <= MAX_AMOUNT;
}

/**
 * Get a user-friendly validation error message for invalid currency input
 * 
 * @param input - The string to validate
 * @returns Error message or null if valid
 */
export function getCurrencyValidationError(input: string | number): string | null {
  const parsed = parseCurrencyInput(input);
  const MAX_AMOUNT = 99999999.99;
  
  if (isNaN(parsed) || !isFinite(parsed)) {
    return "Please enter a valid number (e.g., 1000 or 1,000.50)";
  }
  
  if (parsed <= 0) {
    return "Amount must be greater than zero";
  }
  
  if (parsed > MAX_AMOUNT) {
    return `Amount exceeds maximum limit of ${formatNumberForDisplay(MAX_AMOUNT)}`;
  }
  
  return null; // Valid
}

/**
 * Format a number as currency for display (without symbol)
 * 
 * @param value - The number to format
 * @param showCents - Whether to show cents/decimals
 * @returns Formatted string like "1,234.56" or "1,234"
 */
export function formatNumberForDisplay(value: number, showCents: boolean = true): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0';
  }

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  };

  return value.toLocaleString('en-US', options);
}

/**
 * Sanitize input for numeric keyboard entry
 * Allows: numbers, one decimal point, one comma, one minus sign
 * 
 * @param input - The raw input string
 * @returns Sanitized string safe for input field
 */
export function sanitizeNumericInput(input: string): string {
  // Allow numbers, decimal point, comma, minus sign
  return input.replace(/[^0-9.,-]/g, '');
}
