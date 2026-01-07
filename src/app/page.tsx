import Link from "next/link";
import { PageLayout } from "@/components/layout";
import { Card } from "@/components/ui";
import { Package, MapPin, Barcode, ArrowRightLeft, Search } from "lucide-react";

const actions = [
  {
    title: "Putaway",
    description: "Scan location and SKUs to add inventory",
    href: "/putaway",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Lookup Location",
    description: "View all SKUs at a location",
    href: "/lookup/location",
    icon: MapPin,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Lookup SKU",
    description: "Find where a SKU is stored",
    href: "/lookup/sku",
    icon: Barcode,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Move Inventory",
    description: "Transfer stock between locations",
    href: "/move",
    icon: ArrowRightLeft,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Audit Log",
    description: "View all inventory movements",
    href: "/logs",
    icon: Search,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
  },
];

export default function HomePage() {
  return (
    <PageLayout
      title="Warehouse Mapping"
      description="Select an action to get started"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="h-full hover:shadow-md hover:border-blue-100 group cursor-pointer">
              <div className="flex items-start gap-4">
                <div
                  className={`${action.bgColor} ${action.color} p-3 rounded-xl transition-transform group-hover:scale-110`}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick tips */}
      <Card className="mt-8 bg-amber-50/50 border-amber-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>💡</span>
          Scanner Tips
        </h3>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Use a keyboard wedge scanner
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs font-mono text-gray-500">Enter</kbd> to confirm</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Tap camera icon for mobile scan
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Auto-create on first scan
          </li>
        </ul>
      </Card>
    </PageLayout>
  );
}
