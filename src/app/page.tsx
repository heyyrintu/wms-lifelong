import Link from "next/link";
import { PageLayout } from "@/components/layout";
import { Card } from "@/components/ui";
import { Package, MapPin, Barcode, ArrowRightLeft, Search, ScanLine, Lightbulb } from "lucide-react";

const actions = [
  {
    title: "Cycle Count",
    description: "Scan location and ENs to add inventory",
    href: "/putaway",
    icon: Package,
    gradient: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/20",
    colSpan: "col-span-1 sm:col-span-2 lg:col-span-1",
  },
  {
    title: "Lookup Location",
    description: "View all ENs at a location",
    href: "/lookup/location",
    icon: MapPin,
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
    colSpan: "col-span-1",
  },
  {
    title: "Lookup EN",
    description: "Find where an EN is stored",
    href: "/lookup/sku",
    icon: Barcode,
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
    colSpan: "col-span-1",
  },
  {
    title: "Move Inventory",
    description: "Transfer stock between locations",
    href: "/move",
    icon: ArrowRightLeft,
    gradient: "from-orange-500 to-amber-600",
    shadow: "shadow-orange-500/20",
    colSpan: "col-span-1",
  },
  {
    title: "Records",
    description: "View all inventory movements",
    href: "/logs",
    icon: Search,
    gradient: "from-slate-600 to-slate-800",
    shadow: "shadow-slate-500/20",
    colSpan: "col-span-1 sm:col-span-2 lg:col-span-1",
  },
];

export default function HomePage() {
  return (
    <PageLayout maxWidth="xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back! 👋
        </h1>
        <p className="mt-2 text-slate-600">
          Select an action to manage your warehouse inventory.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">

        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={action.colSpan}
          >
            <Card
              variant="glass"
              className="h-full group hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-transparent hover:border-indigo-100"
            >
              <div className="flex flex-col h-full">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white mb-4 shadow-lg ${action.shadow} group-hover:shadow-xl transition-all duration-300`}>
                  <action.icon className="w-6 h-6" />
                </div>

                <div className="mt-auto">
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {action.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick tips */}
      <Card variant="flat" className="bg-amber-50/50 border-amber-100/50 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ScanLine className="w-32 h-32 text-amber-600" />
        </div>

        <div className="relative z-10">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
              <Lightbulb className="w-5 h-5" />
            </div>
            Scanner Tips
          </h3>
          <div className="grid sm:grid-cols-2 gap-y-3 gap-x-8 text-sm text-slate-600 font-medium">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Use a keyboard wedge scanner
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Press <kbd className="px-2 py-0.5 bg-white border border-amber-200 rounded-md text-xs font-mono text-slate-500 shadow-sm mx-1">Enter</kbd> to confirm</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Tap camera icon for mobile scan
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Auto-create on first scan
            </div>
          </div>
        </div>
      </Card>
    </PageLayout>
  );
}
