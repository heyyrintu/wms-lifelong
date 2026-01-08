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
  Edit,
  X,
  Trash2,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import type { MovementRecord } from "@/lib/validators";
import { adjustInventory } from "@/actions/adjust";
import { useAuth } from "@/contexts/auth-context";

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
  const { user, isAdmin } = useAuth();
  const [filters, setFilters] = useState({
    action: "",
    sku: "",
    location: "",
  });
  const [page, setPage] = useState(0);
  const [editingLog, setEditingLog] = useState<MovementRecord | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustNote, setAdjustNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleEdit = (log: MovementRecord) => {
    setEditingLog(log);
    setAdjustQty(0);
    setAdjustNote("");
  };

  const handleCancelEdit = () => {
    setEditingLog(null);
    setAdjustQty(0);
    setAdjustNote("");
  };

  const handleSubmitEdit = async () => {
    if (!editingLog || !adjustNote.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await adjustInventory({
        locationCode: editingLog.toLocationCode || "",
        skuCode: editingLog.skuCode,
        qty: adjustQty,
        user: user?.name || user?.email || "system",
        note: adjustNote,
      });

      if (result.success) {
        handleCancelEdit();
        refetch();
      } else {
        alert(result.error || "Failed to adjust quantity");
      }
    } catch (error) {
      console.error("Edit error:", error);
      alert("Failed to adjust quantity");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this log entry? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/logs?id=${logId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete log");
      }

      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete log entry");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} log entries? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/logs/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete logs");
      }

      setSelectedIds(new Set());
      refetch();
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Failed to delete log entries");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = () => {
    if (!data) return;
    
    if (selectedIds.size === data.data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.data.map(log => log.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDownloadExcel = () => {
    if (!data || data.data.length === 0) return;

    // Prepare data for Excel export
    const excelData = data.data.map((log) => ({
      "Timestamp": formatDate(log.createdAt),
      "Item Code": log.itemCode || "-",
      "EAN CODE": log.skuCode,
      "Location": log.toLocationCode || log.fromLocationCode || "-",
      "Quantity": log.qty,
      "User": log.user,
      "Action": log.action === "PUTAWAY" ? "CYCLE COUNT" : log.action,
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");

    // Generate filename with current date
    const date = new Date().toISOString().split("T")[0];
    const filename = `audit-logs-${date}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
  };

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
            <Button 
              onClick={() => refetch()} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
            <Button 
              onClick={handleDownloadExcel}
              disabled={!data || data.data.length === 0}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button 
              onClick={handleClearFilters} 
              variant="ghost" 
              size="lg"
              className="hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            >
              <RotateCcw className="w-5 h-5" />
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
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {data.pagination.total} records found
                </span>
                {isAdmin && selectedIds.size > 0 && (
                  <Button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete {selectedIds.size} selected
                  </Button>
                )}
              </div>
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
                    {isAdmin && (
                      <th className="px-4 py-3 w-12">
                        <input
                          type="checkbox"
                          checked={data.data.length > 0 && selectedIds.size === data.data.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">EAN CODE</th>
                    <th className="px-4 py-3">SKU CODE</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Note</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.data.map((log) => {
                    const Icon = actionIcons[log.action];
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        {isAdmin && (
                          <td className="px-4 py-3 w-12">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(log.id)}
                              onChange={() => handleSelectOne(log.id)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                        )}
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={actionColors[log.action]}
                            className="inline-flex items-center gap-1"
                          >
                            <Icon className="w-3 h-3" />
                            {log.action === "PUTAWAY" ? "CYCLE COUNT" : log.action}
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
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-gray-900">
                            {log.itemCode || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {log.action === "MOVE" ? (
                            <span className="flex items-center gap-2 font-mono text-sm text-gray-600">
                              <span>{log.fromLocationCode ?? "-"}</span>
                              <ArrowRight className="w-4 h-4 text-blue-500" />
                              <span>{log.toLocationCode ?? "-"}</span>
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
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                              {log.user
                                ? log.user.charAt(0).toUpperCase()
                                : "?"}
                            </div>
                            <span className="text-sm text-gray-700 font-medium">
                              {log.user || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                          {log.note ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {log.toLocationCode && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(log)}
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                                title="Edit quantity"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(log.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                title="Delete entry (Admin only)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
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

      {/* Edit Modal */}
      {editingLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Adjust Quantity</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EAN CODE
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg font-mono text-sm">
                  {editingLog.skuCode}
                  {editingLog.itemCode && (
                    <span className="text-xs text-gray-500 block">Item: {editingLog.itemCode}</span>
                  )}
                  {editingLog.skuName && (
                    <span className="text-xs text-gray-500 block">{editingLog.skuName}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg font-mono text-sm">
                  {editingLog.toLocationCode}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjustment (+/-)
                </label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter +/- quantity"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Positive numbers add, negative numbers subtract
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Adjustment *
                </label>
                <textarea
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Why are you adjusting this quantity?"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitEdit}
                  disabled={!adjustNote.trim() || adjustQty === 0 || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Adjusting..." : "Adjust Quantity"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
