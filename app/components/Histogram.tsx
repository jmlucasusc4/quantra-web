"use client";

interface Props { counts: Record<string, number> }

export default function Histogram({ counts }: Props) {
  const entries = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  const max = Math.max(...entries.map(([, v]) => v));

  return (
    <div className="space-y-2">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center gap-3">
          <span className="mono text-xs text-purple-300 w-16 shrink-0 text-right">{key}</span>
          <div className="flex-1 bg-white/5 rounded h-6 overflow-hidden">
            <div
              className="h-full rounded transition-all duration-500"
              style={{
                width: `${(val / max) * 100}%`,
                background: "linear-gradient(90deg, #7c3aed, #a855f7)",
              }}
            />
          </div>
          <span className="mono text-xs text-white/50 w-12 shrink-0">{val}</span>
        </div>
      ))}
    </div>
  );
}
