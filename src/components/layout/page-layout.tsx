"use client";

import { type ReactNode } from "react";
import { Navigation } from "./navigation";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export function PageLayout({
  children,
  title,
  description,
  maxWidth = "lg",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      {/* Outer wrapper with proper padding */}
      <div className="pt-32 pb-28 px-4 sm:px-6 lg:px-8">
        <main
          className={cn(
            "mx-auto",
            maxWidthClasses[maxWidth]
          )}
        >
          {(title || description) && (
            <div className="mb-10">
              {title && (
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-2 text-lg text-slate-600 max-w-2xl">{description}</p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
