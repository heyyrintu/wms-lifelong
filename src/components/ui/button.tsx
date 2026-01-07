"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl hover:scale-105 focus:ring-purple-500 disabled:opacity-50 disabled:hover:scale-100",
      secondary:
        "bg-white/80 backdrop-blur-sm text-gray-900 hover:bg-white hover:shadow-lg focus:ring-gray-500 disabled:opacity-50",
      danger:
        "bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 hover:shadow-2xl hover:scale-105 focus:ring-pink-500 disabled:opacity-50 disabled:hover:scale-100",
      ghost:
        "bg-transparent text-gray-700 hover:bg-white/50 focus:ring-gray-500",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-6 py-4 text-lg",
      xl: "px-8 py-5 text-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-semibold rounded-xl",
          "transition-all duration-200",
          // Focus ring
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-60",
          // Touch friendly
          "touch-manipulation",
          // Variants and sizes
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
