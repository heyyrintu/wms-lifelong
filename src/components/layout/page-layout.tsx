"use client";

import { type ReactNode } from "react";
import { Navigation } from "./navigation";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-full",
};

export function PageLayout({
  children,
  title,
  description,
  maxWidth = "lg",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className={`mx-auto px-4 pt-24 pb-12 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]}`}>
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-gray-600">{description}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
