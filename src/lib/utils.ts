
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format numbers consistently throughout the application
 */
export function formatNumberConsistently(value: number, decimals: number = 2): number {
  return parseFloat(value.toFixed(decimals));
}

