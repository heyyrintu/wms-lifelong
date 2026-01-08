"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Package,
  Search,
  ArrowRightLeft,
  LayoutGrid,
  MapPin,
  Barcode,
  MoreHorizontal,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutGrid },
  { name: "Cycle Count", href: "/putaway", icon: Package },
  { name: "Lookup Location", href: "/lookup/location", icon: MapPin },
  { name: "Lookup EN", href: "/lookup/sku", icon: Barcode },
  { name: "Move Inventory", href: "/move", icon: ArrowRightLeft },
  { name: "Audit Log", href: "/logs", icon: Search },
];

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDesktopMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Primary nav items for display (first 4)
  const primaryNavItems = navigation.slice(0, 4);
  const secondaryNavItems = navigation.slice(4);

  // Bottom nav items
  const bottomNavItems = navigation.slice(0, 4);
  const moreItems = navigation.slice(4);

  return (
    <>
      {/* Desktop Navigation - Clean Modern Header */}
      <header
        className={cn(
          "hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm shadow-slate-200/50"
            : "bg-white/60 backdrop-blur-md border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/25">
                  <Package className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="font-semibold text-lg text-slate-800 tracking-tight">
                WHMapping
              </span>
            </Link>

            {/* Center Navigation */}
            <nav className="flex items-center">
              <div className="flex items-center bg-slate-100/80 rounded-full p-1.5 gap-10">
                {primaryNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        isActive
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-4 h-4 transition-colors duration-300",
                          isActive ? "text-indigo-600" : "text-slate-400"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span>{item.name.replace("Lookup ", "")}</span>
                    </Link>
                  );
                })}

                {/* More dropdown trigger */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      desktopMenuOpen || secondaryNavItems.some(item =>
                        pathname === item.href || pathname.startsWith(item.href)
                      )
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <span>More</span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        desktopMenuOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Dropdown menu */}
                  {desktopMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 animate-fadeIn">
                      {secondaryNavItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setDesktopMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                              isActive
                                ? "bg-indigo-50 text-indigo-600"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                          >
                            <item.icon className="w-4 h-4" />
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </nav>

            {/* Right side - Settings */}
            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-200 group",
                  pathname === "/settings"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                <Settings className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header
        className={cn(
          "md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm"
            : "bg-white/60 backdrop-blur-md border-b border-transparent"
        )}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 rounded-lg shadow-md shadow-indigo-500/20">
              <Package className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-base text-slate-800 tracking-tight">
              WHMapping
            </span>
          </Link>

          <Link
            href="/settings"
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              pathname === "/settings"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 active:scale-95 transition-all duration-200",
                  isActive ? "text-indigo-600" : "text-slate-400"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all duration-300",
                    isActive && "bg-indigo-50"
                  )}
                >
                  <item.icon
                    className="w-5 h-5"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className="text-[10px] font-medium tracking-wide">
                  {item.name.replace("Lookup ", "")}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setMobileMenuOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 active:scale-95 transition-all duration-200",
              mobileMenuOpen ? "text-indigo-600" : "text-slate-400"
            )}
          >
            <div className="p-2 rounded-xl">
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-wide">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute bottom-20 right-4 left-4 sm:left-auto sm:w-72 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100 p-2 animate-slideUp">
            <div className="p-2 mb-1 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                More Options
              </span>
            </div>
            <div className="space-y-1">
              {moreItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <div className="border-t border-slate-100 mt-2 pt-2">
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    pathname === "/settings"
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
