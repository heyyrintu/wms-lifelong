"use client";

import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
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
import { moveInventory, getAvailableQty } from "@/actions";
import {
  ArrowRight,
  Check,
  RotateCcw,
  MapPin,
  Package,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

type MoveStep = "from" | "sku" | "qty" | "to" | "complete";

interface MoveState {
  fromLocation: string;
  skuCode: string;
  skuName?: string | null;
  availableQty: number;
  moveQty: number;
  toLocation: string;
}

export default function MovePage() {
  const { user } = useAuth();
  const [step, setStep] = useState<MoveStep>("from");
  const [state, setState] = useState<MoveState>({
    fromLocation: "",
    skuCode: "",
    skuName: null,
    availableQty: 0,
    moveQty: 0,
    toLocation: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qtyInputRef = useRef<HTMLInputElement>(null);
  const skuInputRef = useRef<{ focus: () => void } | null>(null);

  // Step 1: From location
  const handleFromLocationSubmit = useCallback((code: string) => {
    if (code.trim()) {
      setState((prev) => ({ ...prev, fromLocation: code.trim().toUpperCase() }));
      setStep("sku");
      setError(null);
    }
  }, []);

  // Step 2: SKU code - check availability
  const handleSkuSubmit = useCallback(
    async (code: string) => {
      if (!code.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await getAvailableQty(state.fromLocation, code);

        if (!result.success) {
          setError(result.error ?? "Failed to check EN");
          return;
        }

        if (result.data?.qty === 0) {
          setError(`EN ${code} not found at location ${state.fromLocation}`);
          return;
        }

        setState((prev) => ({
          ...prev,
          skuCode: code.trim().toUpperCase(),
          skuName: result.data?.skuName,
          availableQty: result.data?.qty ?? 0,
          moveQty: result.data?.qty ?? 0,
        }));
        setStep("qty");

        // Focus qty input
        setTimeout(() => {
          qtyInputRef.current?.focus();
          qtyInputRef.current?.select();
        }, 100);
      } catch {
        setError("Failed to check EN availability");
      } finally {
        setIsLoading(false);
      }
    },
    [state.fromLocation]
  );

  // Step 3: Quantity
  const handleQtySubmit = useCallback(() => {
    if (state.moveQty > 0 && state.moveQty <= state.availableQty) {
      setStep("to");
      setError(null);
    } else if (state.moveQty > state.availableQty) {
      setError(`Cannot move more than ${state.availableQty} units`);
    } else {
      setError("Enter a valid quantity");
    }
  }, [state.moveQty, state.availableQty]);

  // Step 4: To location - execute move
  const handleToLocationSubmit = useCallback(
    async (code: string) => {
      if (!code.trim()) return;

      if (code.trim().toUpperCase() === state.fromLocation) {
        setError("Destination must be different from source");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await moveInventory({
          fromLocationCode: state.fromLocation,
          toLocationCode: code.trim().toUpperCase(),
          skuCode: state.skuCode,
          qty: state.moveQty,
          user: user?.name || user?.email || "system",
        });

        if (!result.success) {
          setError(result.error ?? "Move failed");
          return;
        }

        setState((prev) => ({ ...prev, toLocation: code.trim().toUpperCase() }));
        setStep("complete");
        toast.success("Move completed successfully!");
      } catch {
        setError("Failed to move inventory");
      } finally {
        setIsLoading(false);
      }
    },
    [state.fromLocation, state.skuCode, state.moveQty]
  );

  // Reset
  const handleReset = useCallback(() => {
    setStep("from");
    setState({
      fromLocation: "",
      skuCode: "",
      skuName: null,
      availableQty: 0,
      moveQty: 0,
      toLocation: "",
    });
    setError(null);
  }, []);

  // Continue from same location
  const handleContinue = useCallback(() => {
    setState((prev) => ({
      ...prev,
      skuCode: "",
      skuName: null,
      availableQty: 0,
      moveQty: 0,
      toLocation: "",
    }));
    setStep("sku");
    setError(null);
    
    // Auto-focus SKU field
    setTimeout(() => {
      skuInputRef.current?.focus();
    }, 100);
  }, []);

  return (
    <PageLayout
      title="Move Inventory"
      description="Transfer stock between locations"
      maxWidth="md"
    >
      {/* Progress indicator */}
      <div className="flex items-center gap-1 mb-6 flex-wrap">
        <Badge variant={step === "from" ? "info" : "success"}>1. From</Badge>
        <ArrowRight className="w-4 h-4 text-gray-300" />
        <Badge
          variant={
            step === "sku"
              ? "info"
              : ["qty", "to", "complete"].includes(step)
                ? "success"
                : "default"
          }
        >
          2. EN
        </Badge>
        <ArrowRight className="w-4 h-4 text-gray-300" />
        <Badge
          variant={
            step === "qty"
              ? "info"
              : ["to", "complete"].includes(step)
                ? "success"
                : "default"
          }
        >
          3. Qty
        </Badge>
        <ArrowRight className="w-4 h-4 text-gray-300" />
        <Badge
          variant={
            step === "to" ? "info" : step === "complete" ? "success" : "default"
          }
        >
          4. To
        </Badge>
      </div>

      {/* Error display */}
      {error && (
        <Alert type="error" message={error} className="mb-4" />
      )}

      {/* Step 1: From Location */}
      {step === "from" && (
        <Card>
          <CardHeader
            title="Step 1: Source Location"
            description="Scan the location to move FROM"
          />
          <ScannerFieldWithState
            label="From Location"
            onSubmit={handleFromLocationSubmit}
            placeholder="Scan source location"
            autoFocus
          />
        </Card>
      )}

      {/* Step 2: SKU */}
      {step === "sku" && (
        <Card>
          <CardHeader
            title="Step 2: Select EN"
            description={`Scan the EN at ${state.fromLocation}`}
          />
          <Alert
            type="info"
            message={`Source: ${state.fromLocation}`}
            className="mb-4"
          />
          <ScannerFieldWithState
            ref={skuInputRef}
            label="EAN Code"
            onSubmit={handleSkuSubmit}
            placeholder="Scan EAN to move"
            autoFocus
            disabled={isLoading}
          />
          {isLoading && (
            <p className="text-sm text-gray-500 mt-2">Checking availability...</p>
          )}
        </Card>
      )}

      {/* Step 3: Quantity */}
      {step === "qty" && (
        <Card>
          <CardHeader
            title="Step 3: Enter Quantity"
            description="How many units to move?"
          />

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">From:</span>
              <span className="font-mono font-semibold">{state.fromLocation}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">EN:</span>
              <span className="font-mono font-semibold">{state.skuCode}</span>
            </div>
            {state.skuName && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Name:</span>
                <span className="text-gray-900">{state.skuName}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Available:</span>
              <Badge variant="info">{state.availableQty} units</Badge>
            </div>
          </div>

          <ScannerInput
            ref={qtyInputRef}
            label="Quantity to Move"
            type="number"
            value={state.moveQty.toString()}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setState((prev) => ({
                ...prev,
                moveQty: isNaN(val) ? 0 : val,
              }));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleQtySubmit();
              }
            }}
            min={1}
            max={state.availableQty}
            className="normal-case!"
          />

          <div className="mt-4">
            <Button
              onClick={handleQtySubmit}
              disabled={state.moveQty <= 0 || state.moveQty > state.availableQty}
              size="lg"
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: To Location */}
      {step === "to" && (
        <Card>
          <CardHeader
            title="Step 4: Destination Location"
            description="Scan the location to move TO"
          />

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4 justify-center">
              <div className="text-center">
                <MapPin className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <span className="font-mono text-sm">{state.fromLocation}</span>
              </div>
              <ArrowRight className="w-6 h-6 text-blue-500" />
              <div className="text-center">
                <Package className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <span className="font-mono text-sm">{state.skuCode}</span>
                <Badge variant="info" size="sm" className="ml-1">
                  {state.moveQty}
                </Badge>
              </div>
              <ArrowRight className="w-6 h-6 text-blue-500" />
              <div className="text-center">
                <MapPin className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <span className="text-sm text-gray-500">Scan</span>
              </div>
            </div>
          </div>

          <ScannerFieldWithState
            label="To Location"
            onSubmit={handleToLocationSubmit}
            placeholder="Scan destination location"
            autoFocus
            disabled={isLoading}
          />
          {isLoading && (
            <p className="text-sm text-gray-500 mt-2">Moving inventory...</p>
          )}
        </Card>
      )}

      {/* Complete */}
      {step === "complete" && (
        <Card>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Move Complete!
            </h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-xs mx-auto">
              <div className="flex items-center gap-3 justify-center">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">From</p>
                  <p className="font-mono font-semibold">{state.fromLocation}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-green-500" />
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">To</p>
                  <p className="font-mono font-semibold">{state.toLocation}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="font-mono">{state.skuCode}</p>
                <Badge variant="success">{state.moveQty} units</Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleContinue} className="flex-1">
                Move More from {state.fromLocation}
              </Button>
              <Button onClick={handleReset} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                New Move
              </Button>
            </div>
          </div>
        </Card>
      )}
    </PageLayout>
  );
}

// Helper component that manages its own state
const ScannerFieldWithState = forwardRef<
  { focus: () => void },
  {
    label: string;
    onSubmit: (value: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
    disabled?: boolean;
  }
>(function ScannerFieldWithState(
  { label, onSubmit, placeholder, autoFocus, disabled },
  ref
) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose focus method to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const handleSubmit = useCallback(() => {
    if (value.trim()) {
      onSubmit(value);
    }
  }, [value, onSubmit]);

  return (
    <>
      <ScannerField
        ref={inputRef}
        label={label}
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      <div className="mt-4">
        <Button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          size="lg"
          className="w-full"
        >
          Continue
        </Button>
      </div>
    </>
  );
});
