"use client";

import { useCallback, useState } from "react";

interface DownloadButtonProps {
  resultUrl: string;
  fileName: string;
}

export default function DownloadButton({
  resultUrl,
  fileName,
}: DownloadButtonProps) {
  const [open, setOpen] = useState(false);

  const stem = fileName.replace(/\.[^.]+$/, "");

  const downloadTransparent = useCallback(() => {
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${stem}_nobg.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setOpen(false);
  }, [resultUrl, stem]);

  const downloadWithBackground = useCallback(
    (bgColor: string, suffix: string) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${stem}_${suffix}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setOpen(false);
          },
          "image/png",
          1.0
        );
      };
      img.src = resultUrl;
    },
    [resultUrl, stem]
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/30"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download PNG
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1a1a28] shadow-2xl">
          <button
            onClick={downloadTransparent}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-zinc-300 transition-colors hover:bg-white/[0.06]"
          >
            <span
              className="inline-block h-5 w-5 rounded border border-white/20"
              style={{
                background:
                  "repeating-conic-gradient(#333 0% 25%, #555 0% 50%) 50% / 6px 6px",
              }}
            />
            Transparent PNG
          </button>
          <button
            onClick={() => downloadWithBackground("#ffffff", "white_bg")}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-zinc-300 transition-colors hover:bg-white/[0.06]"
          >
            <span className="inline-block h-5 w-5 rounded border border-white/20 bg-white" />
            White Background
          </button>
          <button
            onClick={() => downloadWithBackground("#000000", "black_bg")}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-zinc-300 transition-colors hover:bg-white/[0.06]"
          >
            <span className="inline-block h-5 w-5 rounded border border-white/20 bg-black" />
            Black Background
          </button>
        </div>
      )}
    </div>
  );
}
