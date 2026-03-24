"use client";

import React, { type ReactNode } from "react";
import { debug } from "@/lib/utils/debug";

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    debug("ErrorBoundary caught", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-parchment flex flex-col items-center justify-center gap-6 p-8">
          <p className="font-gtw text-2xl text-ink tracking-tight">Something went wrong.</p>
          <button onClick={() => window.location.reload()} className="bg-ink text-parchment font-body text-sm px-6 py-3 rounded-full">
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
