"use client";

import { useState } from "react";
import FeedbackForm from "./FeedbackForm";

export default function FeedbackWidget({ toolSlug }: { toolSlug: string }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-4 shadow-lg max-w-xs">
        <p className="text-sm text-green-700 dark:text-green-300">
          Thanks for your feedback!
        </p>
        <button
          onClick={() => { setSubmitted(false); setOpen(false); }}
          className="text-xs text-green-600 dark:text-green-400 underline mt-1"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-all hover:scale-105 flex items-center justify-center text-xl"
          title="Give feedback"
        >
          💬
        </button>
      )}

      {/* Feedback panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-5 w-80">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Rate this tool</h4>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
            >
              ×
            </button>
          </div>
          <FeedbackForm
            toolSlug={toolSlug}
            onClose={() => setOpen(false)}
            onSuccess={() => setSubmitted(true)}
          />
        </div>
      )}
    </>
  );
}
