"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout";
import {
  Card,
  Button,
  Badge,
  EmptyState,
  PageLoader,
  ScannerInput,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import {
  ArrowRight,
  Package,
  ArrowRightLeft,
  Pencil,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { MovementRecord } from "@/lib/validators";

interface LogsResponse {
  data: MovementRecord[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const actionIcons = {
  PUTAWAY: Package,
  MOVE: ArrowRightLeft,
  ADJUST: Pencil,
};

const actionColors = {
  PUTAWAY: "success" as const,
  MOVE: "info" as const,
  ADJUST: "warning" as const,
};

export default function LogsPage() {
  const [filters, setFilters] = useState({
    action: "",
    sku: "",
    location: "",
  });
  const [page, setPage] = useState(0);
  const limit = 20;

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", limit.toString());
    params.set("offset", (page * limit).toString());
    if (filters.action) params.set("action", filters.action);
    if (filters.sku) params.set("sku", filters.sku.toUpperCase());
    if (filters.location) params.set("location", filters.location.toUpperCase());
    return params.toString();
  }, [filters, page]);

  const { data, isLoading, refetch } = useQuery<LogsResponse>({
    queryKey: ["movement-logs", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/logs?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
  });

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({ action: "", sku: "", location: "" });
    setPage(0);
  };

  const totalPages = data ? Math.ceil(data.pagination.total / limit) : 0;

  return (
    <PageLayout
      title="Audit Log"
      description="View all inventory movements"
      maxWidth="xl"
    >
      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Actions</option>
              <option value="PUTAWAY">Cycle Count</option>
              <option value="MOVE">Move</option>
              <option value="ADJUST">Adjust</option>
            </select>
          </div>
          <div>
            <ScannerInput
              label="EN Filter"
              value={filters.sku}
              onChange={(e) => handleFilterChange("sku", e.target.value)}
              placeholder="Filter by EN"
              className="py-2! text-base!"
            />
          </div>
          <div>
            <ScannerInput
              label="Location Filter"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              placeholder="Filter by location"
              className="py-2! text-base!"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={() => refetch()} variant="secondary" className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button onClick={handleClearFilters} variant="ghost">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading && <PageLoader message="Loading logs..." />}

      {data && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {data.pagination.total} records found
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data.pagination.hasMore}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {data.data.length === 0 ? (
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              title="No Records Found"
              description="Try adjusting your filters"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-600">
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">EN</th>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">To</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.data.map((log) => {
                    const Icon = actionIcons[log.action];
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={actionColors[log.action]}
                            className="inline-flex items-center gap-1"
                          >
                            <Icon className="w-3 h-3" />
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-mono font-semibold text-gray-900">
                              {log.skuCode}
                            </span>
                            {log.skuName && (
                              <p className="text-xs text-gray-500">{log.skuName}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">
                          {log.fromLocationCode ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {log.fromLocationCode && log.toLocationCode ? (
                            <span className="flex items-center gap-1 font-mono text-sm text-gray-600">
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              {log.toLocationCode}
                            </span>
                          ) : (
                            <span className="font-mono text-sm text-gray-600">
                              {log.toLocationCode ?? "-"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`font-semibold ${log.action === "ADJUST" && log.qty < 0
                              ? "text-red-600"
                              : "text-green-600"
                              }`}
                          >
                            {log.qty > 0 ? "+" : ""}
                            {log.qty}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {log.user}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                          {log.note ?? "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </PageLayout>
  );
}
