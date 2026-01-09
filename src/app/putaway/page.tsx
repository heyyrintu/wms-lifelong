"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";
import { ScannerField } from "@/components/scanner";
import {
  Card,
  CardHeader,
  Button,
  ScannerInput,
  Alert,
  Badge,
} from "@/components/ui";
import { putaway } from "@/actions";
import { Trash2, Check, RotateCcw, Edit, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

type FormStep = "location" | "items" | "complete";

interface PutawayItem {
  skuCode: string;
  itemCode?: string;
  qty: number;
}

export default function PutawayPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<FormStep>("location");
  const [locationCode, setLocationCode] = useState("");
  const [items, setItems] = useState<PutawayItem[]>([]);
  const [currentSku, setCurrentSku] = useState("");
  const [currentItemCode, setCurrentItemCode] = useState("");
  const [currentQty, setCurrentQty] = useState<string>("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editQty, setEditQty] = useState<string>("0");
  const [lastResult, setLastResult] = useState<{
    locationCode: string;
    items: Array<{ skuCode: string; skuName: string | null; qty: number }>;
  } | null>(null);

  const qtyInputRef = useRef<HTMLInputElement>(null);
  const skuInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Location scan - auto advance to items step
  const handleLocationSubmit = useCallback(() => {
    const locationValue = locationInputRef.current?.value || locationCode;
    if (locationValue.trim()) {
      setLocationCode(locationValue.toUpperCase());
      setStep("items");
      // Focus on SKU input after transition
      setTimeout(() => {
        skuInputRef.current?.focus();
      }, 50);
    }
  }, [locationCode]);

  // Step 2: SKU scanned - auto focus quantity field
  const handleSkuSubmit = useCallback(() => {
    const skuValue = skuInputRef.current?.value || currentSku;
    if (skuValue.trim()) {
      // Update state with scanned value
      setCurrentSku(skuValue.toUpperCase());
      // Focus on quantity input
      setTimeout(() => {
        qtyInputRef.current?.focus();
        qtyInputRef.current?.select();
      }, 50);
    }
  }, [currentSku]);

  // Add item to list
  const handleAddItem = useCallback(() => {
    const qty = parseInt(currentQty, 10);
    if (!currentSku.trim() || isNaN(qty) || qty <= 0) {
      toast.error("Enter a valid EAN and quantity");
      return;
    }

    // Check if SKU already exists in list
    const existingIndex = items.findIndex(
      (item) => item.skuCode === currentSku.toUpperCase()
    );

    if (existingIndex >= 0) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        skuCode: updatedItems[existingIndex]?.skuCode ?? currentSku.toUpperCase(),
        qty: (updatedItems[existingIndex]?.qty ?? 0) + qty,
      };
      setItems(updatedItems);
      toast.success(`Updated ${currentItemCode || currentSku} quantity`);
    } else {
      // Add new item
      setItems([...items, { 
        skuCode: currentSku.toUpperCase(), 
        itemCode: currentItemCode.trim() || undefined,
        qty 
      }]);
      toast.success(`Added ${currentItemCode || currentSku}`);
    }

    setCurrentSku("");
    setCurrentItemCode("");
    setCurrentQty("1");
    
    // Auto-focus back to SKU field for next item
    setTimeout(() => {
      skuInputRef.current?.focus();
    }, 100);
  }, [currentSku, currentItemCode, currentQty, items]);

  // Remove item
  const handleRemoveItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Edit item
  const handleEditItem = useCallback((index: number) => {
    setEditingIndex(index);
    setEditQty(items[index]?.qty.toString() ?? "0");
  }, [items]);

  // Update item quantity
  const handleUpdateItem = useCallback((index: number) => {
    const qty = parseInt(editQty, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }

    setItems((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], qty };
      }
      return updated;
    });
    toast.success("Quantity updated");
    setEditingIndex(null);
    setEditQty("0");
  }, [editQty]);

  // Cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditQty("0");
  }, []);

  // Submit putaway
  const handleSubmitPutaway = useCallback(async () => {
    if (items.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    setIsSubmitting(true);
    try {
      const handlerName = typeof window !== 'undefined' ? localStorage.getItem('handlerName') : null;
      const result = await putaway({
        locationCode: locationCode.toUpperCase(),
        items,
        user: user?.name || user?.email || "system",
        handlerName: handlerName || undefined,
      });

      if (result.success && result.data) {
        toast.success(`Cycle Count complete! ${items.length} EN(s) added.`);
        // Map result data to include skuName
        const itemsWithNames = result.data.map(record => ({
          skuCode: record.skuCode,
          skuName: record.skuName ?? null,
          qty: items.find(i => i.skuCode === record.skuCode)?.qty || 0
        }));
        setLastResult({ locationCode, items: itemsWithNames });
        setStep("complete");
      } else {
        toast.error(result.error ?? "Cycle Count failed");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }, [locationCode, items, user]);

  // Reset for new putaway
  const handleReset = useCallback(() => {
    setStep("location");
    setLocationCode("");
    setItems([]);
    setCurrentSku("");
    setCurrentQty("0");
    setLastResult(null);
  }, []);

  // Continue at same location
  const handleContinueSameLocation = useCallback(() => {
    setStep("items");
    setItems([]);
    setCurrentSku("");
    setCurrentQty("1");
  }, []);

  // Handle qty input keydown
  const handleQtyKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddItem();
      }
    },
    [handleAddItem]
  );

  return (
    <PageLayout
      title="Cycle Count"
      description="Scan location, then scan ENs to add inventory"
      maxWidth="md"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <Badge variant={step === "location" ? "info" : "success"}>
          1. Location
        </Badge>
        <span className="text-gray-300">→</span>
        <Badge
          variant={
            step === "items" ? "info" : step === "complete" ? "success" : "default"
          }
        >
          2. Scan Items
        </Badge>
        <span className="text-gray-300">→</span>
        <Badge variant={step === "complete" ? "success" : "default"}>
          3. Complete
        </Badge>
      </div>

      {/* Step 1: Location */}
      {step === "location" && (
        <Card>
          <CardHeader
            title="Step 1: Scan Location"
            description="Scan or enter the location code"
          />
          <ScannerField
            ref={locationInputRef}
            label="Location Code"
            value={locationCode}
            onChange={setLocationCode}
            onSubmit={handleLocationSubmit}
            placeholder="e.g., A1-R02-S03-B04"
            autoFocus
          />
          <div className="mt-4">
            <Button
              onClick={handleLocationSubmit}
              disabled={!locationCode.trim()}
              size="lg"
              className="w-full"
            >
              Continue to Scan Items
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Items */}
      {step === "items" && (
        <div className="space-y-4">
          {/* Location info */}
          <Alert
            type="info"
            message={`Adding items to location: ${locationCode}`}
          />

          {/* Add item form */}
          <Card>
            <CardHeader
              title="Step 2: Scan ENs"
              description="Scan EAN → Enter Qty → Press Enter to add"
            />

            <div className="space-y-4">
              <ScannerField
                ref={skuInputRef}
                label="EAN Code"
                value={currentSku}
                onChange={setCurrentSku}
                onSubmit={handleSkuSubmit}
                placeholder="Scan or enter EAN"
                autoFocus
              />

              <div>
                <ScannerInput
                  label="Item Code (Optional)"
                  value={currentItemCode}
                  onChange={(e) => setCurrentItemCode(e.target.value)}
                  placeholder="Enter Item/SKU Code if EAN not available"
                  className="normal-case!"
                />
              </div>

              {/* Quantity field - visible when SKU is scanned */}
              <div>
                <ScannerInput
                  ref={qtyInputRef}
                  label="Quantity"
                  type="number"
                  value={currentQty}
                  onChange={(e) => setCurrentQty(e.target.value)}
                  onKeyDown={handleQtyKeyDown}
                  min={1}
                  className="normal-case!"
                />
                <p className="text-xs text-gray-500 mt-1">Press Enter after entering quantity to add item</p>
              </div>
            </div>
          </Card>

          {/* Items list */}
          {items.length > 0 && (
            <Card>
              <CardHeader
                title={`Items to Count (${items.length})`}
                action={
                  <Badge variant="info">
                    Total: {items.reduce((sum, item) => sum + item.qty, 0)} units
                  </Badge>
                }
              />

              <div className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3"
                  >
                    {editingIndex === index ? (
                      <>
                        <div className="flex items-center gap-3 flex-1">
                          <div>
                            <span className="font-mono font-semibold text-gray-900">
                              {item.itemCode || item.skuCode}
                            </span>
                            {item.itemCode && (
                              <p className="text-xs text-gray-500">EAN: {item.skuCode}</p>
                            )}
                          </div>
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            className="w-24 px-2 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min={1}
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateItem(index)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div>
                            <span className="font-mono font-semibold text-gray-900">
                              {item.itemCode || item.skuCode}
                            </span>
                            {item.itemCode && (
                              <p className="text-xs text-gray-500">EAN: {item.skuCode}</p>
                            )}
                          </div>
                          <span className="ml-3 text-gray-500">
                            Qty: {item.qty}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(index)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitPutaway}
                  loading={isSubmitting}
                  className="flex-1"
                  size="lg"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Complete Cycle Count
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Step 3: Complete */}
      {step === "complete" && lastResult && (
        <Card>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cycle Count Complete!
            </h2>
            <p className="text-gray-600 mb-6">
              {lastResult.items.length} EN(s) added to{" "}
              <span className="font-mono font-semibold">
                {lastResult.locationCode}
              </span>
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              {lastResult.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between py-2 text-sm border-b last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="font-mono font-semibold">{item.skuCode}</span>
                    {item.skuName && (
                      <span className="text-xs text-gray-600 mt-0.5">{item.skuName}</span>
                    )}
                  </div>
                  <span className="text-gray-500 font-semibold">+{item.qty}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleContinueSameLocation}
                className="flex-1"
              >
                Continue at {lastResult.locationCode}
              </Button>
              <Button onClick={handleReset} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                New Cycle Count
              </Button>
            </div>
          </div>
        </Card>
      )}
    </PageLayout>
  );
}
