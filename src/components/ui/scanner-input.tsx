"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ScannerInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/**
 * Scanner-optimized input component
 * - Large touch target
 * - High contrast
 * - Auto-uppercase for codes
 * - Keyboard wedge scanner friendly
 */
export const ScannerInput = forwardRef<HTMLInputElement, ScannerInputProps>(
  ({ className, label, error, hint, type = "text", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          className={cn(
            // Base styles
            "w-full px-4 py-4 text-lg font-mono uppercase",
            // Border and focus
            "border-2 border-white/30 rounded-xl bg-white/50 backdrop-blur-sm",
            "focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 focus:bg-white focus:shadow-2xl",
            "transition-all duration-300",
            // Placeholder
            "placeholder:text-gray-400 placeholder:normal-case",
            // Error state
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            // Disabled state
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            // Touch-friendly
            "touch-manipulation",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

ScannerInput.displayName = "ScannerInput";
