"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  className?: string;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-900 shadow-lg",
  error: "bg-gradient-to-r from-red-50 to-pink-50 border-red-300 text-red-900 shadow-lg",
  warning: "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-900 shadow-lg",
  info: "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 text-blue-900 shadow-lg",
};

const iconStyles = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

export function Alert({ type, title, message, className }: AlertProps) {
  const Icon = icons[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border",
        styles[type],
        className
      )}
      role="alert"
    >
      <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", iconStyles[type])} />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p className={cn(title && "mt-1")}>{message}</p>
      </div>
    </div>
  );
}
