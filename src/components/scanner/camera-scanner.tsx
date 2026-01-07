"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, BarcodeFormat } from "@zxing/browser";
import { DecodeHintType } from "@zxing/library";
import { Button } from "@/components/ui";
import { Camera, X } from "lucide-react";

interface CameraScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  const stopScanner = useCallback(() => {
    // Stop video tracks first
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    // Clear reader reference
    if (readerRef.current) {
      readerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const startScanner = async () => {
      try {
        setIsStarting(true);
        setError(null);

        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.QR_CODE,
          BarcodeFormat.DATA_MATRIX,
        ]);

        const reader = new BrowserMultiFormatReader(hints);
        readerRef.current = reader;

        const videoInputDevices =
          await BrowserMultiFormatReader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          throw new Error("No camera found");
        }

        // Prefer back camera on mobile
        const backCamera = videoInputDevices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear")
        );

        const deviceId = backCamera?.deviceId ?? videoInputDevices[0]?.deviceId;

        if (!videoRef.current || !deviceId) {
          throw new Error("Video element or device not available");
        }

        await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result) => {
            if (result) {
              const text = result.getText();
              if (text) {
                stopScanner();
                onScan(text);
              }
            }
          }
        );

        setIsStarting(false);
      } catch (err) {
        console.error("Scanner error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to start camera"
        );
        setIsStarting(false);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScan, stopScanner]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-linear-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2 text-white">
          <Camera className="w-5 h-5" />
          <span className="font-medium">Scan Barcode</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Video feed */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Scanning overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-40 border-2 border-white rounded-lg shadow-lg relative">
          {/* Corner accents */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br" />
          
          {/* Scanning line animation */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 animate-scan" />
        </div>
      </div>

      {/* Status messages */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/70 to-transparent">
        {isStarting && (
          <p className="text-white text-center">Starting camera...</p>
        )}
        {error && (
          <div className="text-center">
            <p className="text-red-400 mb-3">{error}</p>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}
        {!isStarting && !error && (
          <p className="text-white text-center text-sm opacity-80">
            Position barcode within the frame
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0%,
          100% {
            top: 0;
          }
          50% {
            top: calc(100% - 2px);
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
