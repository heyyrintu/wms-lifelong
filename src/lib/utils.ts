import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Debounce function for scanner input
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Get configuration flags from environment
 */
export function getConfig() {
  return {
    autoCreateSku: process.env.NEXT_PUBLIC_AUTO_CREATE_SKU === "true",
    autoCreateLocation: process.env.NEXT_PUBLIC_AUTO_CREATE_LOCATION === "true",
    defaultUser: process.env.DEFAULT_USER ?? "system",
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Warehouse Mapping",
  };
}

/**
 * Parse quantity input safely
 */
export function parseQuantity(value: string | number): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  const parsed = parseInt(value, 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Validate barcode/code format (alphanumeric with hyphens)
 */
export function isValidCode(code: string): boolean {
  return /^[A-Za-z0-9\-_]+$/.test(code.trim());
}
