"use client";

import { useEffect, useRef } from "react";

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BlogEditor({ value, onChange }: BlogEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const easymdeRef = useRef<any>(null);

  useEffect(() => {
    let instance: any = null;

    async function init() {
      const EasyMDE = (await import("easymde")).default;
      await import("easymde/dist/easymde.min.css");

      if (textareaRef.current && !easymdeRef.current) {
        instance = new EasyMDE({
          element: textareaRef.current,
          initialValue: value,
          spellChecker: false,
          status: ["lines", "words"],
          toolbar: [
            "bold", "italic", "heading", "|",
            "quote", "unordered-list", "ordered-list", "|",
            "link", "image", "|",
            "preview", "side-by-side", "fullscreen", "|",
            "guide",
          ],
          minHeight: "300px",
        });

        instance.codemirror.on("change", () => {
          onChange(instance.value());
        });

        easymdeRef.current = instance;
      }
    }

    init();

    return () => {
      if (instance) {
        instance.toTextArea();
        instance = null;
      }
    };
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (easymdeRef.current && value !== easymdeRef.current.value()) {
      easymdeRef.current.value(value);
    }
  }, []);

  return (
    <div className="blog-editor-wrapper">
      <textarea ref={textareaRef} defaultValue={value} />
      <style jsx global>{`
        .dark .EasyMDEContainer .CodeMirror {
          background: #1f2937 !important;
          color: #e5e7eb !important;
          border-color: #374151 !important;
        }
        .dark .EasyMDEContainer .editor-toolbar {
          border-color: #374151 !important;
          background: #111827 !important;
        }
        .dark .EasyMDEContainer .editor-toolbar button {
          color: #e5e7eb !important;
        }
        .dark .EasyMDEContainer .editor-toolbar button:hover,
        .dark .EasyMDEContainer .editor-toolbar button.active {
          background: #374151 !important;
          border-color: #4b5563 !important;
        }
        .dark .EasyMDEContainer .editor-preview {
          background: #1f2937 !important;
          color: #e5e7eb !important;
        }
        .dark .EasyMDEContainer .editor-statusbar {
          background: #111827 !important;
          color: #9ca3af !important;
          border-color: #374151 !important;
        }
        .EasyMDEContainer .CodeMirror {
          border-radius: 0 0 8px 8px;
        }
        .EasyMDEContainer .editor-toolbar {
          border-radius: 8px 8px 0 0;
          border: 1px solid #d1d5db;
        }
        .dark .EasyMDEContainer .editor-toolbar {
          border-color: #374151;
        }
      `}</style>
    </div>
  );
}
