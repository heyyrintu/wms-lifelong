"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function HandlerNamePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [handlerName, setHandlerName] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Check if we have a stored handler name
    const storedName = localStorage.getItem("handlerName");
    const lastPromptTime = localStorage.getItem("lastHandlerPromptTime");
    
    if (storedName) {
      setHandlerName(storedName);
    }

    // Calculate time until next prompt
    const now = Date.now();
    const lastTime = lastPromptTime ? parseInt(lastPromptTime) : now;
    const elapsed = now - lastTime;
    const fortyMinutes = 40 * 60 * 1000; // 40 minutes in milliseconds

    if (elapsed >= fortyMinutes || !storedName) {
      setShowPrompt(true);
      return;
    }
    
    // Set timer for next prompt
    const timeUntilPrompt = fortyMinutes - elapsed;
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, timeUntilPrompt);

    return () => clearTimeout(timer);
  }, []);

  // Set up recurring 40-minute timer after initial prompt
  useEffect(() => {
    if (!showPrompt && handlerName) {
      const fortyMinutes = 40 * 60 * 1000;
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, fortyMinutes);

      return () => clearTimeout(timer);
    }
    return;
  }, [showPrompt, handlerName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const name = inputValue.trim();
      setHandlerName(name);
      localStorage.setItem("handlerName", name);
      localStorage.setItem("lastHandlerPromptTime", Date.now().toString());
      setShowPrompt(false);
      setInputValue("");
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
          Handler Name Required
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Please enter your name to continue. This will be recorded in all activity logs.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            autoFocus
            required
          />
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
