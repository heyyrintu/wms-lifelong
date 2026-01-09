"use client";

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { ScannerInput, Button } from "@/components/ui";
import { CameraScanner } from "./camera-scanner";
import { Camera } from "lucide-react";

interface ScannerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  showCamera?: boolean;
}

/**
 * Combined scanner field supporting:
 * - Keyboard wedge scanner input
 * - Manual text entry
 * - Optional camera scanning
 */
export const ScannerField = forwardRef<HTMLInputElement, ScannerFieldProps>(function ScannerField({
  label,
  value,
  onChange,
  onSubmit,
  placeholder,
  error,
  hint,
  disabled = false,
  autoFocus = false,
  showCamera = true,
}, ref) {
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose focus method to parent
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // Auto-focus on mount if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        // Read directly from input to handle fast barcode scanner input
        const currentValue = inputRef.current?.value || "";
        if (currentValue.trim()) {
          onSubmit();
        }
      }
    },
    [onSubmit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value.toUpperCase());
    },
    [onChange]
  );

  const handleCameraScan = useCallback(
    (code: string) => {
      onChange(code.toUpperCase());
      setShowCameraScanner(false);
      // Focus input after camera scan
      setTimeout(() => {
        inputRef.current?.focus();
        onSubmit();
      }, 100);
    },
    [onChange, onSubmit]
  );

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <ScannerInput
              ref={inputRef}
              label={label}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              error={error}
              hint={hint}
              disabled={disabled}
            />
          </div>
          {showCamera && (
            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setShowCameraScanner(true)}
                disabled={disabled}
                className="h-[58px] px-4"
                aria-label="Open camera scanner"
              >
                <Camera className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={focusInput}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          Click to focus for scanner input
        </button>
      </div>

      {showCameraScanner && (
        <CameraScanner
          onScan={handleCameraScan}
          onClose={() => setShowCameraScanner(false)}
        />
      )}
    </>
  );
});
