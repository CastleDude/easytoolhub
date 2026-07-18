"use client";

import { useEffect, useRef } from "react";

export default function VisitorTracker() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const sessionKey = "visitor_session_id";
    const countKey = "visitor_page_count";

    // Get or create session ID
    let sessionId = sessionStorage.getItem(sessionKey);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(sessionKey, sessionId);
      sessionStorage.setItem(countKey, "0");
    }

    // Increment page count
    const count = parseInt(sessionStorage.getItem(countKey) || "0", 10) + 1;
    sessionStorage.setItem(countKey, String(count));

    // Send visit data
    fetch("/api/admin/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, pageCount: count }),
    }).catch(() => {});
  }, []);

  return null;
}
