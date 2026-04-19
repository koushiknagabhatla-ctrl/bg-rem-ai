"use client";

import { useCallback, useRef, useState } from "react";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export default function DropZone({ onFileSelect, disabled }: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File): boolean => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only PNG, JPEG, and WebP images are supported.");
      return false;
    }

    if (file.size > MAX_SIZE) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 20MB.`);
      return false;
    }

    return true;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (validate(file)) {
        onFileSelect(file);
      }
    },
    [validate, onFileSelect]
  );

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-16 text-center transition-all duration-300 ${
          disabled
            ? "cursor-not-allowed border-zinc-800 bg-zinc-900/30 opacity-50"
            : dragActive
              ? "border-indigo-500 bg-indigo-500/[0.08] shadow-[0_0_30px_rgba(99,102,241,0.12)]"
              : "border-white/[0.08] bg-white/[0.02] hover:border-indigo-500/40 hover:bg-white/[0.04]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        <div
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
            dragActive
              ? "bg-indigo-500/20 text-indigo-400"
              : "bg-white/[0.04] text-zinc-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
          }`}
        >
          {dragActive ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          )}
        </div>

        <p className="mb-2 text-lg font-semibold text-zinc-300">
          {dragActive ? "Drop your image here" : "Drop image or click to upload"}
        </p>
        <p className="text-sm text-zinc-500">
          PNG, JPEG, or WebP &middot; Max 20MB
        </p>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-center text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
