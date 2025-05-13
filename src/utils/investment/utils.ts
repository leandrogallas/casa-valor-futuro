
/**
 * Utility functions for investment calculations
 */

/**
 * Calculates monthly rate from annual rate
 * @param annualRate The annual interest rate (e.g., 0.12 for 12%)
 * @returns Monthly equivalent rate
 */
export function calculateMonthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

/**
 * Calculates future value with compound interest
 * @param presentValue The initial value
 * @param rate The interest rate per period
 * @param periods Number of periods
 * @returns Future value after compound interest
 */
export function calculateFutureValue(presentValue: number, rate: number, periods: number): number {
  return presentValue * Math.pow(1 + rate, periods);
}

/**
 * Returns a formatted number with fixed decimal places
 * @param value The number to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted number as a number type (not string)
 */
export function formatNumber(value: number, decimals: number = 2): number {
  return parseFloat(value.toFixed(decimals));
}
