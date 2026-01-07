"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  className?: string;
}

const variants = {
  default: "bg-gray-100 text-gray-700 shadow-md",
  success: "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg",
  warning: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg",
  error: "bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg",
  info: "bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
