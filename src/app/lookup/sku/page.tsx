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
import { Barcode, MapPin, RotateCcw } from "lucide-react";

interface SkuInventory {
  id: string;
  code: string;
  name: string | null;
  barcode: string | null;
  locations: Array<{
    locationId: string;
    locationCode: string;
    qty: number;
  }>;
  totalLocations: number;
  totalQty: number;
}

export default function LookupSkuPage() {
  const [searchCode, setSearchCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const {
    data: inventory,
    isLoading,
    error,
    refetch,
  } = useQuery<SkuInventory>({
    queryKey: ["sku-inventory", submittedCode],
    queryFn: async () => {
      if (!submittedCode) throw new Error("No EAN code");
      const res = await fetch(`/api/inventory/sku/${encodeURIComponent(submittedCode)}`);
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
      title="Lookup by EN"
      description="Scan an EN to find its locations"
      maxWidth="md"
    >
      {/* Search form */}
      <Card className="mb-6">
        <ScannerField
          label="EN Code"
          value={searchCode}
          onChange={setSearchCode}
          onSubmit={handleSubmit}
          placeholder="Scan or enter EN code"
          autoFocus
        />
        <div className="mt-4 flex gap-3">
          <Button onClick={handleSubmit} disabled={!searchCode.trim()} className="flex-1">
            <Barcode className="w-4 h-4 mr-2" />
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
      {isLoading && <PageLoader message="Loading EN locations..." />}

      {error && (
        <Alert
          type="error"
          title="EN Not Found"
          message={error instanceof Error ? error.message : "Failed to lookup EN"}
        />
      )}

      {inventory && (
        <Card>
          <CardHeader
            title={
              <div>
                <span className="flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-purple-600" />
                  <span className="font-mono">{inventory.code}</span>
                </span>
                {inventory.name && (
                  <p className="text-sm font-normal text-gray-500 mt-1">
                    {inventory.name}
                  </p>
                )}
              </div>
            }
            action={
              <div className="flex gap-2">
                <Badge variant="info">{inventory.totalLocations} locations</Badge>
                <Badge variant="success">{inventory.totalQty} total units</Badge>
              </div>
            }
          />

          {inventory.barcode && (
            <p className="text-sm text-gray-500 mb-4">
              Barcode: <span className="font-mono">{inventory.barcode}</span>
            </p>
          )}

          {inventory.locations.length === 0 ? (
            <EmptyState
              icon={<MapPin className="w-8 h-8" />}
              title="No Stock"
              description="This EN has no inventory in any location"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-semibold text-gray-600">Location</th>
                    <th className="pb-3 font-semibold text-gray-600 text-right">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventory.locations.map((loc) => (
                    <tr key={loc.locationId} className="hover:bg-gray-50">
                      <td className="py-3">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-mono font-semibold text-gray-900">
                            {loc.locationCode}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant="default" size="md">
                          {loc.qty}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td className="pt-3 font-semibold text-gray-900">Total</td>
                    <td className="pt-3 text-right">
                      <Badge variant="success" size="md">
                        {inventory.totalQty}
                      </Badge>
                    </td>
                  </tr>
                </tfoot>
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
