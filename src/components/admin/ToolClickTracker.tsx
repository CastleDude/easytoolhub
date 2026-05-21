"use client";

import { useEffect } from "react";

export default function ToolClickTracker({ toolSlug }: { toolSlug: string }) {
  useEffect(() => {
    const id = setTimeout(() => {
      const blob = new Blob([JSON.stringify({ toolSlug })], { type: "application/json" });
      navigator.sendBeacon("/api/admin/clicks", blob);
    }, 0);
    return () => clearTimeout(id);
  }, [toolSlug]);

  return null;
}
