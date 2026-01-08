"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <WifiOff className="w-10 h-10 text-slate-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          You&apos;re Offline
        </h1>
        
        <p className="text-slate-600 mb-6">
          It looks like you&apos;ve lost your internet connection. Some features 
          may be unavailable until you&apos;re back online.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <p className="text-sm text-slate-500">
            Recent lookups may still be available from cache.
          </p>
        </div>
      </div>
    </div>
  );
}
