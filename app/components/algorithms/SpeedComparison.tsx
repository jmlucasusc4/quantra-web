"use client";

const SIZES = [4, 16, 64, 256, 1024, 4096];

export default function SpeedComparison() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />Classical O(N)</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sky-400 inline-block" />Grover&apos;s O(√N)</span>
      </div>

      {SIZES.map(n => {
        const classical = n;
        const grover = (Math.PI / 4) * Math.sqrt(n);
        const speedup = (classical / grover).toFixed(1);
        return (
          <div key={n} className="space-y-1">
            <p className="mono text-xs text-white/50">N = {n}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 rounded h-4 overflow-hidden">
                  <div className="h-full rounded bg-red-400/70" style={{ width: "100%" }} />
                </div>
                <span className="mono text-xs text-red-400 w-12 text-right">{n}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 rounded h-4 overflow-hidden">
                  <div className="h-full rounded bg-sky-400/70" style={{ width: `${(grover / classical) * 100}%` }} />
                </div>
                <span className="mono text-xs text-sky-400 w-12 text-right">{Math.round(grover)}</span>
              </div>
            </div>
            <p className="text-xs text-green-400 text-right">{speedup}× faster</p>
          </div>
        );
      })}
    </div>
  );
}
