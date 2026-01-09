"use client";

import { useState, useEffect } from "react";
import { User, X } from "lucide-react";
import { Button } from "@/components/ui";

export function HandlerNameFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [handlerName, setHandlerName] = useState("");
  const [newHandlerName, setNewHandlerName] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedName = localStorage.getItem("handlerName") || "";
    setHandlerName(storedName);
    setNewHandlerName(storedName);
  }, []);

  const handleSave = () => {
    if (newHandlerName.trim()) {
      localStorage.setItem("handlerName", newHandlerName.trim());
      localStorage.setItem("handlerNameSetAt", new Date().toISOString());
      setHandlerName(newHandlerName.trim());
      setIsOpen(false);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Floating Action Button - Only on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 md:hidden flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Set handler name"
      >
        <div className="p-3">
          <User className="w-6 h-6" />
        </div>
        {handlerName && (
          <span className="pr-4 text-sm font-medium truncate max-w-[120px]">
            {handlerName}
          </span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Handler Name</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Enter your name to track your activities in the logs.
              </p>
              <input
                type="text"
                value={newHandlerName}
                onChange={(e) => setNewHandlerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
                autoFocus
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <Button
                onClick={() => setIsOpen(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!newHandlerName.trim()}
                className="flex-1"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
