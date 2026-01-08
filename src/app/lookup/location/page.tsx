"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout";
import { ScannerField } from "@/components/scanner";
import {
  Card,
  CardHeader,
  Button,
  Alert,
  Badge,
  EmptyState,
  PageLoader,
} from "@/components/ui";
import { MapPin, Package, RotateCcw } from "lucide-react";

interface LocationInventory {
  id: string;
  code: string;
  items: Array<{
    skuId: string;
    skuCode: string;
    skuName: string | null;
    qty: number;
  }>;
  totalItems: number;
  totalQty: number;
}

export default function LookupLocationPage() {
  const [searchCode, setSearchCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const {
    data: inventory,
    isLoading,
    error,
    refetch,
  } = useQuery<LocationInventory>({
    queryKey: ["location-inventory", submittedCode],
    queryFn: async () => {
      if (!submittedCode) throw new Error("No location code");
      const res = await fetch(`/api/inventory/location/${encodeURIComponent(submittedCode)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch");
      }
      const json = await res.json();
      return json.data;
    },
    enabled: !!submittedCode,
    retry: false,
  });

  const handleSubmit = useCallback(() => {
    if (searchCode.trim()) {
      setSubmittedCode(searchCode.trim().toUpperCase());
    }
  }, [searchCode]);

  const handleReset = useCallback(() => {
    setSearchCode("");
    setSubmittedCode(null);
  }, []);

  return (
    <PageLayout
      title="Lookup by Location"
      description="Scan a location to view its inventory"
      maxWidth="md"
    >
      {/* Search form */}
      <Card className="mb-6">
        <ScannerField
          label="Location Code"
          value={searchCode}
          onChange={setSearchCode}
          onSubmit={handleSubmit}
          placeholder="Scan or enter location code"
          autoFocus
        />
        <div className="mt-4 flex gap-3">
          <Button onClick={handleSubmit} disabled={!searchCode.trim()} className="flex-1">
            <MapPin className="w-4 h-4 mr-2" />
            Lookup
          </Button>
          {submittedCode && (
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>

      {/* Results */}
      {isLoading && <PageLoader message="Loading inventory..." />}

      {error && (
        <Alert
          type="error"
          title="Location Not Found"
          message={error instanceof Error ? error.message : "Failed to lookup location"}
        />
      )}

      {inventory && (
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-mono">{inventory.code}</span>
              </span>
            }
            action={
              <div className="flex gap-2">
                <Badge variant="info">{inventory.totalItems} ENs</Badge>
                <Badge variant="success">{inventory.totalQty} units</Badge>
              </div>
            }
          />

          {inventory.items.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8" />}
              title="Empty Location"
              description="No inventory at this location"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-semibold text-gray-600">EN</th>
                    <th className="pb-3 font-semibold text-gray-600">Name</th>
                    <th className="pb-3 font-semibold text-gray-600 text-right">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventory.items.map((item) => (
                    <tr key={item.skuId} className="hover:bg-gray-50">
                      <td className="py-3 font-mono font-semibold text-gray-900">
                        {item.skuCode}
                      </td>
                      <td className="py-3 text-gray-600">
                        {item.skuName ?? "-"}
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant="default" size="md">
                          {item.qty}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <Button variant="secondary" onClick={() => refetch()} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </Card>
      )}
    </PageLayout>
  );
}
